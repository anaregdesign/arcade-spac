import { spawn } from "node:child_process";
import sql from "mssql";

export const STARTUP_MIGRATION_DATABASE_URL_ENV_NAME = "STARTUP_MIGRATION_DATABASE_URL";
export const AZURE_SQL_RUNTIME_CLIENT_ID_ENV_NAME = "AZURE_SQL_RUNTIME_CLIENT_ID";
export const AZURE_SQL_MIGRATION_CLIENT_ID_ENV_NAME = "AZURE_SQL_MIGRATION_CLIENT_ID";

export function isAzureHosting(env = process.env) {
  return Boolean(env.AZURE_APP_NAME);
}

function npmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

export function splitConnectionStringParts(databaseUrl) {
  return databaseUrl
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

export function rewriteDatabaseUrlForManagedIdentity(databaseUrl) {
  // Prisma's MSSQL adapter and query-plan executor both accept
  // `authentication=DefaultAzureCredential` directly. The hosted process only
  // needs `AZURE_CLIENT_ID` to target the intended user-assigned identity.
  return databaseUrl;
}

function readConnectionStringValue(databaseUrl, keyName) {
  const targetKey = keyName.toLowerCase();
  const matchingPart = splitConnectionStringParts(databaseUrl)
    .find((part) => {
      const [rawKey = ""] = part.split("=", 1);
      return rawKey.trim().toLowerCase() === targetKey;
    });

  if (!matchingPart) {
    return null;
  }

  const [, value = ""] = matchingPart.split(/=(.+)/, 2);
  return value.trim();
}

function parseBooleanConnectionStringValue(value, fallback) {
  if (typeof value !== "string" || value.length === 0) {
    return fallback;
  }

  return value.trim().toLowerCase() === "true";
}

export function parseAzureSqlConnectionConfig(databaseUrl) {
  const [prefix = ""] = splitConnectionStringParts(databaseUrl);
  const normalizedPrefix = prefix.replace(/^sqlserver:\/\//i, "");
  const [serverToken = ""] = normalizedPrefix.split(";", 1);
  const portFromComma = serverToken.includes(",")
    ? serverToken.split(",", 2)[1]
    : null;
  const portFromColon = !serverToken.includes(",") && /^.+:\d+$/.test(serverToken)
    ? serverToken.split(":", 2)[1]
    : null;
  const server = serverToken
    .replace(/,\d+$/, "")
    .replace(/:\d+$/, "");
  const database = readConnectionStringValue(databaseUrl, "database")
    ?? readConnectionStringValue(databaseUrl, "databaseName");

  if (!server || !database) {
    throw new Error("DATABASE_URL must include Azure SQL server and database values.");
  }

  return {
    server,
    port: Number.parseInt(portFromComma ?? portFromColon ?? "1433", 10),
    database,
    encrypt: parseBooleanConnectionStringValue(readConnectionStringValue(databaseUrl, "encrypt"), true),
    trustServerCertificate: parseBooleanConnectionStringValue(
      readConnectionStringValue(databaseUrl, "trustServerCertificate"),
      false,
    ),
  };
}

export function buildManagedIdentityPrismaEnv(baseEnv, clientId, databaseUrl = baseEnv.DATABASE_URL) {
  const nextEnv = { ...baseEnv };

  if (typeof clientId === "string" && clientId.trim().length > 0) {
    nextEnv.AZURE_CLIENT_ID = clientId.trim();
  } else {
    delete nextEnv.AZURE_CLIENT_ID;
  }

  if (typeof databaseUrl === "string" && databaseUrl.trim().length > 0) {
    nextEnv.DATABASE_URL = rewriteDatabaseUrlForManagedIdentity(databaseUrl.trim());
  }

  return nextEnv;
}

export function resolveMigrationDatabaseUrl(env = process.env) {
  if (
    typeof env[STARTUP_MIGRATION_DATABASE_URL_ENV_NAME] === "string"
    && env[STARTUP_MIGRATION_DATABASE_URL_ENV_NAME].trim().length > 0
  ) {
    return {
      source: STARTUP_MIGRATION_DATABASE_URL_ENV_NAME,
      value: env[STARTUP_MIGRATION_DATABASE_URL_ENV_NAME].trim(),
    };
  }

  if (typeof env.DATABASE_URL === "string" && env.DATABASE_URL.trim().length > 0) {
    return {
      source: "DATABASE_URL",
      value: env.DATABASE_URL.trim(),
    };
  }

  if (!isAzureHosting(env)) {
    return null;
  }

  throw new Error("STARTUP_MIGRATION_DATABASE_URL or DATABASE_URL must be configured for Azure-hosted Prisma migration.");
}

export function describeDatabaseUrlSource(databaseUrl) {
  const [prefix] = databaseUrl.split(";");
  return prefix || "sqlserver://<redacted>";
}

export async function verifyManagedIdentitySqlLogin(databaseUrl, clientId) {
  const connectionConfig = parseAzureSqlConnectionConfig(databaseUrl);
  const pool = await sql.connect({
    server: connectionConfig.server,
    port: connectionConfig.port,
    database: connectionConfig.database,
    authentication: {
      type: "azure-active-directory-default",
      options: typeof clientId === "string" && clientId.trim().length > 0
        ? { clientId: clientId.trim() }
        : {},
    },
    options: {
      encrypt: connectionConfig.encrypt,
      trustServerCertificate: connectionConfig.trustServerCertificate,
    },
  });

  try {
    const result = await pool.request().query(`
      SELECT
        ORIGINAL_LOGIN() AS original_login,
        SUSER_SNAME() AS suser_sname,
        USER_NAME() AS user_name,
        DB_NAME() AS database_name;
    `);
    return result.recordset[0] ?? null;
  } finally {
    await pool.close();
  }
}

export function runNpmCommand(args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(npmCommand(), args, {
      env,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Command ${args.join(" ")} failed with code ${code ?? "null"} and signal ${signal ?? "null"}.`));
    });
  });
}
