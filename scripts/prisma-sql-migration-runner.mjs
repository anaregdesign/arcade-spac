import { createHash, randomUUID } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import sql from "mssql";
import { fileURLToPath } from "node:url";
import { parseAzureSqlConnectionConfig } from "./prisma-managed-identity.mjs";

const PRISMA_MIGRATIONS_TABLE = "[dbo].[_prisma_migrations]";
const PRISMA_MIGRATION_LOCK_RESOURCE = "prisma_migrate";
const MIGRATIONS_DIRECTORY = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../prisma/migrations",
);

const CREATE_PRISMA_MIGRATIONS_TABLE_SQL = `
IF OBJECT_ID(N'dbo._prisma_migrations', N'U') IS NULL
BEGIN
  CREATE TABLE [dbo].[_prisma_migrations] (
      [id]                  VARCHAR(36) PRIMARY KEY NOT NULL,
      [checksum]            VARCHAR(64) NOT NULL,
      [finished_at]         DATETIMEOFFSET,
      [migration_name]      NVARCHAR(250) NOT NULL,
      [logs]                NVARCHAR(MAX) NULL,
      [rolled_back_at]      DATETIMEOFFSET,
      [started_at]          DATETIMEOFFSET NOT NULL DEFAULT CURRENT_TIMESTAMP,
      [applied_steps_count] INT NOT NULL DEFAULT 0
  );
END;
`;

const LOAD_PRISMA_MIGRATIONS_SQL = `
SELECT
  id,
  checksum,
  finished_at,
  migration_name,
  logs,
  rolled_back_at,
  started_at,
  applied_steps_count
FROM ${PRISMA_MIGRATIONS_TABLE}
ORDER BY started_at ASC;
`;

const PRISMA_SQL_SERVER_WRAPPER_PATTERN = /^\s*BEGIN TRY\s+BEGIN TRAN;\s*([\s\S]*?)\s*COMMIT TRAN;\s*END TRY\s+BEGIN CATCH\s+IF @@TRANCOUNT > 0\s+BEGIN\s+ROLLBACK TRAN;\s*END;\s*THROW\s+END CATCH\s*$/i;

function readConnectionStringValue(databaseUrl, keyName) {
  const targetKey = keyName.toLowerCase();
  const parts = databaseUrl
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);
  const matchingPart = parts.find((part) => {
    const [rawKey = ""] = part.split("=", 1);
    return rawKey.trim().toLowerCase() === targetKey;
  });

  if (!matchingPart) {
    return null;
  }

  const [, value = ""] = matchingPart.split(/=(.+)/, 2);
  return value.trim();
}

function buildAzureSqlConnection(databaseUrl, clientId) {
  const connectionConfig = parseAzureSqlConnectionConfig(databaseUrl);
  const user = readConnectionStringValue(databaseUrl, "user")
    ?? readConnectionStringValue(databaseUrl, "user id")
    ?? readConnectionStringValue(databaseUrl, "username");
  const password = readConnectionStringValue(databaseUrl, "password");
  const options = {
    server: connectionConfig.server,
    port: connectionConfig.port,
    database: connectionConfig.database,
    options: {
      encrypt: connectionConfig.encrypt,
      trustServerCertificate: connectionConfig.trustServerCertificate,
    },
    pool: {
      max: 1,
      min: 0,
    },
  };

  if (user && password) {
    return {
      ...options,
      user,
      password,
    };
  }

  return {
    ...options,
    authentication: {
      type: "azure-active-directory-default",
      options: typeof clientId === "string" && clientId.trim().length > 0
        ? { clientId: clientId.trim() }
        : {},
    },
  };
}

async function ensureMigrationLock(pool) {
  const result = await pool.request().query(`
    DECLARE @result int;
    EXEC @result = sp_getapplock
      @Resource = '${PRISMA_MIGRATION_LOCK_RESOURCE}',
      @LockMode = 'Exclusive',
      @LockOwner = 'Session',
      @LockTimeout = 60000;
    SELECT @result AS result;
  `);
  const lockResult = result.recordset[0]?.result;

  if (typeof lockResult !== "number" || lockResult < 0) {
    throw new Error(`Failed to acquire SQL migration lock (${lockResult ?? "unknown"}).`);
  }
}

async function ensureMigrationsTable(pool) {
  await pool.request().batch(CREATE_PRISMA_MIGRATIONS_TABLE_SQL);
}

async function loadAppliedMigrations(pool) {
  const result = await pool.request().query(LOAD_PRISMA_MIGRATIONS_SQL);
  return result.recordset;
}

function checksumMigration(sqlText) {
  return createHash("sha256").update(sqlText, "utf8").digest("hex");
}

async function loadFilesystemMigrations() {
  const entries = await readdir(MIGRATIONS_DIRECTORY, { withFileTypes: true });
  const migrations = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const migrationPath = path.join(MIGRATIONS_DIRECTORY, entry.name, "migration.sql");
    const sqlText = await readFile(migrationPath, "utf8");

    migrations.push({
      name: entry.name,
      sqlText,
      checksum: checksumMigration(sqlText),
    });
  }

  migrations.sort((left, right) => left.name.localeCompare(right.name));
  return migrations;
}

function formatErrorForMigrationLog(error) {
  if (error instanceof Error) {
    return [error.name, error.message, error.stack].filter(Boolean).join("\n\n");
  }

  return String(error);
}

function assertFinishedMigrationMatches(localMigration, appliedMigration) {
  if (appliedMigration.checksum !== localMigration.checksum) {
    throw new Error(
      `Applied migration ${localMigration.name} has checksum ${appliedMigration.checksum}, expected ${localMigration.checksum}.`,
    );
  }
}

function assertNoUnresolvedMigrationFailure(appliedMigrations) {
  const failedMigration = appliedMigrations.find(
    (migration) => migration.finished_at == null && migration.rolled_back_at == null,
  );

  if (failedMigration) {
    throw new Error(
      `Migration ${failedMigration.migration_name} is recorded as failed and requires manual resolution before rerun.`,
    );
  }
}

export function unwrapPrismaSqlServerTransactionWrapper(sqlText) {
  const match = PRISMA_SQL_SERVER_WRAPPER_PATTERN.exec(sqlText);
  return match ? match[1].trim() : sqlText.trim();
}

export function splitSqlStatements(sqlText) {
  const statements = [];
  let current = "";
  let inSingleQuote = false;
  let inBracketIdentifier = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let index = 0; index < sqlText.length; index += 1) {
    const character = sqlText[index];
    const nextCharacter = sqlText[index + 1];

    if (inLineComment) {
      current += character;
      if (character === "\n") {
        inLineComment = false;
      }
      continue;
    }

    if (inBlockComment) {
      current += character;
      if (character === "*" && nextCharacter === "/") {
        current += nextCharacter;
        index += 1;
        inBlockComment = false;
      }
      continue;
    }

    if (inSingleQuote) {
      current += character;
      if (character === "'" && nextCharacter === "'") {
        current += nextCharacter;
        index += 1;
        continue;
      }
      if (character === "'") {
        inSingleQuote = false;
      }
      continue;
    }

    if (inBracketIdentifier) {
      current += character;
      if (character === "]") {
        inBracketIdentifier = false;
      }
      continue;
    }

    if (character === "-" && nextCharacter === "-") {
      current += character;
      current += nextCharacter;
      index += 1;
      inLineComment = true;
      continue;
    }

    if (character === "/" && nextCharacter === "*") {
      current += character;
      current += nextCharacter;
      index += 1;
      inBlockComment = true;
      continue;
    }

    if (character === "'") {
      current += character;
      inSingleQuote = true;
      continue;
    }

    if (character === "[") {
      current += character;
      inBracketIdentifier = true;
      continue;
    }

    if (character === ";") {
      const statement = current.trim();
      if (statement.length > 0) {
        statements.push(statement);
      }
      current = "";
      continue;
    }

    current += character;
  }

  const trailingStatement = current.trim();
  if (trailingStatement.length > 0) {
    statements.push(trailingStatement);
  }

  return statements;
}

export function parsePrismaSqlStatements(sqlText) {
  return splitSqlStatements(unwrapPrismaSqlServerTransactionWrapper(sqlText));
}

async function recordMigrationStart(pool, migration) {
  const id = randomUUID();

  await pool.request()
    .input("id", sql.VarChar(36), id)
    .input("checksum", sql.VarChar(64), migration.checksum)
    .input("migrationName", sql.NVarChar(250), migration.name)
    .query(`
      INSERT INTO ${PRISMA_MIGRATIONS_TABLE} (
        id,
        checksum,
        migration_name,
        started_at,
        applied_steps_count
      )
      VALUES (
        @id,
        @checksum,
        @migrationName,
        SYSDATETIMEOFFSET(),
        0
      );
    `);

  return id;
}

async function recordMigrationSuccess(pool, migrationId) {
  await pool.request()
    .input("id", sql.VarChar(36), migrationId)
    .query(`
      UPDATE ${PRISMA_MIGRATIONS_TABLE}
      SET finished_at = SYSDATETIMEOFFSET(),
          applied_steps_count = 1
      WHERE id = @id;
    `);
}

async function recordMigrationFailure(pool, migrationId, error) {
  await pool.request()
    .input("id", sql.VarChar(36), migrationId)
    .input("logs", sql.NVarChar(sql.MAX), formatErrorForMigrationLog(error))
    .query(`
      UPDATE ${PRISMA_MIGRATIONS_TABLE}
      SET logs = @logs
      WHERE id = @id;
    `);
}

async function rollbackTransaction(transaction) {
  try {
    await transaction.rollback();
  } catch (rollbackError) {
    if (rollbackError instanceof Error && /transaction has been aborted/i.test(rollbackError.message)) {
      return;
    }

    throw rollbackError;
  }
}

async function executeMigrationStatements(pool, migration) {
  const statements = parsePrismaSqlStatements(migration.sqlText);
  const transaction = new sql.Transaction(pool);

  await transaction.begin();

  try {
    for (const statement of statements) {
      await new sql.Request(transaction).batch(statement);
    }

    await transaction.commit();
  } catch (error) {
    await rollbackTransaction(transaction);
    throw error;
  }
}

export async function applyPrismaSqlMigrations(databaseUrl, clientId) {
  const pool = new sql.ConnectionPool(buildAzureSqlConnection(databaseUrl, clientId));

  await pool.connect();

  try {
    await ensureMigrationLock(pool);
    await ensureMigrationsTable(pool);

    const filesystemMigrations = await loadFilesystemMigrations();
    const appliedMigrations = await loadAppliedMigrations(pool);

    assertNoUnresolvedMigrationFailure(appliedMigrations);

    let appliedCount = 0;
    let skippedCount = 0;

    for (const migration of filesystemMigrations) {
      const appliedMigration = appliedMigrations.find(
        (candidate) => candidate.migration_name === migration.name && candidate.rolled_back_at == null,
      );

      if (appliedMigration?.finished_at != null) {
        assertFinishedMigrationMatches(migration, appliedMigration);
        skippedCount += 1;
        continue;
      }

      if (appliedMigration) {
        throw new Error(`Migration ${migration.name} exists without completion metadata and requires manual resolution.`);
      }

      const migrationId = await recordMigrationStart(pool, migration);

      try {
        await executeMigrationStatements(pool, migration);
        await recordMigrationSuccess(pool, migrationId);
        appliedCount += 1;
        console.log(`Applied migration ${migration.name}.`);
      } catch (error) {
        await recordMigrationFailure(pool, migrationId, error);
        throw error;
      }
    }

    console.log(
      `Prisma SQL migrations are up to date. Applied ${appliedCount}, skipped ${skippedCount}.`,
    );
  } finally {
    await pool.close();
  }
}
