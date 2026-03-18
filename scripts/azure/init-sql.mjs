import fs from "node:fs/promises";
import sql from "mssql";

const {
  ARCADE_SQL_SERVER,
  ARCADE_SQL_DATABASE = "arcade",
  ARCADE_SQL_MIGRATION_PRINCIPAL = "id-sql-migrate-arcade",
  ARCADE_SQL_RUNTIME_PRINCIPAL = "ca-arcade",
} = process.env;

if (!ARCADE_SQL_SERVER) {
  throw new Error("ARCADE_SQL_SERVER must be set.");
}

const migrationSql = await fs.readFile(
  new URL("../../prisma/migrations/20260312111840_init_arcade_domain/migration.sql", import.meta.url),
  "utf8",
);

const connection = {
  server: ARCADE_SQL_SERVER,
  port: 1433,
  database: ARCADE_SQL_DATABASE,
  authentication: {
    type: "azure-active-directory-default",
  },
  options: {
    encrypt: true,
  },
};

const runtimePrincipal = ARCADE_SQL_RUNTIME_PRINCIPAL;
const migrationPrincipal = ARCADE_SQL_MIGRATION_PRINCIPAL;

function membershipGuard(roleName, principalName) {
  return `
IF NOT EXISTS (
  SELECT 1
  FROM sys.database_role_members drm
  JOIN sys.database_principals rolep ON drm.role_principal_id = rolep.principal_id
  JOIN sys.database_principals memberp ON drm.member_principal_id = memberp.principal_id
  WHERE rolep.name = N'${roleName}' AND memberp.name = N'${principalName}'
)
  ALTER ROLE [${roleName}] ADD MEMBER [${principalName}];`;
}

const pool = await sql.connect(connection);

try {
  try {
    await pool.request().batch(migrationSql);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!message.includes("already an object named")) {
      throw error;
    }
  }

  await pool.request().batch(`
IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'${runtimePrincipal}')
  CREATE USER [${runtimePrincipal}] FROM EXTERNAL PROVIDER;
${membershipGuard("db_datareader", runtimePrincipal)}
${membershipGuard("db_datawriter", runtimePrincipal)}

IF NOT EXISTS (SELECT 1 FROM sys.database_principals WHERE name = N'${migrationPrincipal}')
  CREATE USER [${migrationPrincipal}] FROM EXTERNAL PROVIDER;
${membershipGuard("db_datareader", migrationPrincipal)}
${membershipGuard("db_datawriter", migrationPrincipal)}
${membershipGuard("db_ddladmin", migrationPrincipal)}
`);

  console.log("Azure SQL schema and roles are ready.");
} finally {
  await pool.close();
}
