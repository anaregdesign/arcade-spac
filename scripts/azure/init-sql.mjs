import sql from "mssql";

const {
  ARCADE_SQL_SERVER,
  ARCADE_SQL_DATABASE,
  ARCADE_SQL_MIGRATION_PRINCIPAL,
  ARCADE_SQL_RUNTIME_PRINCIPAL,
} = process.env;

if (!ARCADE_SQL_SERVER) {
  throw new Error("ARCADE_SQL_SERVER must be set.");
}

if (!ARCADE_SQL_DATABASE) {
  throw new Error("ARCADE_SQL_DATABASE must be set.");
}

if (!ARCADE_SQL_MIGRATION_PRINCIPAL) {
  throw new Error("ARCADE_SQL_MIGRATION_PRINCIPAL must be set.");
}

if (!ARCADE_SQL_RUNTIME_PRINCIPAL) {
  throw new Error("ARCADE_SQL_RUNTIME_PRINCIPAL must be set.");
}

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

  console.log("Azure SQL principals and roles are ready.");
} finally {
  await pool.close();
}
