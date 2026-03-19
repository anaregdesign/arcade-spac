import sql from "mssql";
import { pathToFileURL } from "node:url";

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} must be set.`);
  }

  return value;
}

function escapeSqlLiteral(value) {
  return value.replaceAll("'", "''");
}

function bracketSqlIdentifier(value) {
  return `[${value.replaceAll("]", "]]")}]`;
}

function sqlVariableFragment(value) {
  const normalized = value.replace(/[^A-Za-z0-9_]/g, "_");

  if (!normalized) {
    throw new Error("SQL variable scope must include at least one alphanumeric character.");
  }

  return /^[0-9]/.test(normalized) ? `_${normalized}` : normalized;
}

function membershipGuard(roleName, principalName) {
  const roleIdentifier = bracketSqlIdentifier(roleName);
  const principalIdentifier = bracketSqlIdentifier(principalName);
  const escapedRoleLiteral = escapeSqlLiteral(roleName);
  const escapedPrincipalLiteral = escapeSqlLiteral(principalName);

  return `
IF NOT EXISTS (
  SELECT 1
  FROM sys.database_role_members drm
  JOIN sys.database_principals rolep ON drm.role_principal_id = rolep.principal_id
  JOIN sys.database_principals memberp ON drm.member_principal_id = memberp.principal_id
  WHERE rolep.name = N'${escapedRoleLiteral}' AND memberp.name = N'${escapedPrincipalLiteral}'
  )
  ALTER ROLE ${roleIdentifier} ADD MEMBER ${principalIdentifier};`;
}

export function buildPrincipalReconciliationSql(principalName, principalClientId, roleNames, variableScope = "principal") {
  const escapedPrincipalLiteral = escapeSqlLiteral(principalName);
  const escapedClientIdLiteral = escapeSqlLiteral(principalClientId);
  const principalIdentifier = bracketSqlIdentifier(principalName);
  const principalIdentifierDynamicLiteral = escapeSqlLiteral(principalIdentifier);
  const variableFragment = sqlVariableFragment(variableScope);
  const principalNameVariable = `@principal_name_${variableFragment}`;
  const principalClientIdVariable = `@principal_client_id_${variableFragment}`;
  const principalSidVariable = `@principal_sid_${variableFragment}`;
  const principalSidLiteralVariable = `@principal_sid_literal_${variableFragment}`;
  const membershipStatements = roleNames.map((roleName) => membershipGuard(roleName, principalName)).join("\n");

  return `
DECLARE ${principalNameVariable} sysname = N'${escapedPrincipalLiteral}';
DECLARE ${principalClientIdVariable} uniqueidentifier = CAST(N'${escapedClientIdLiteral}' AS uniqueidentifier);
DECLARE ${principalSidVariable} varbinary(16) = CONVERT(VARBINARY(16), ${principalClientIdVariable});
DECLARE ${principalSidLiteralVariable} varchar(max) = CONVERT(VARCHAR(MAX), ${principalSidVariable}, 1);

IF EXISTS (
  SELECT 1
  FROM sys.database_principals
  WHERE name = ${principalNameVariable}
    AND (
      type <> 'E'
      OR sid IS NULL
      OR sid <> ${principalSidVariable}
    )
)
BEGIN
  PRINT N'Recreating Azure SQL principal ${escapedPrincipalLiteral} to match the current managed identity client ID.';
  EXEC(N'DROP USER ${principalIdentifierDynamicLiteral}');
END;

IF NOT EXISTS (
  SELECT 1
  FROM sys.database_principals
  WHERE name = ${principalNameVariable}
)
BEGIN
  PRINT N'Creating Azure SQL principal ${escapedPrincipalLiteral} without Microsoft Entra validation.';
  EXEC(N'CREATE USER ${principalIdentifierDynamicLiteral} WITH SID = ' + ${principalSidLiteralVariable} + N', TYPE = E;');
END;

${membershipStatements}`;
}

export function buildBootstrapSql({
  runtimePrincipalName,
  runtimePrincipalClientId,
  migrationPrincipalName,
  migrationPrincipalClientId,
}) {
  return `
${buildPrincipalReconciliationSql(runtimePrincipalName, runtimePrincipalClientId, ["db_datareader", "db_datawriter"], "runtime")}

${buildPrincipalReconciliationSql(
  migrationPrincipalName,
  migrationPrincipalClientId,
  ["db_datareader", "db_datawriter", "db_ddladmin"],
  "migration",
)}
`;
}

export async function main() {
  const connection = {
    server: requireEnv("ARCADE_SQL_SERVER"),
    port: 1433,
    database: requireEnv("ARCADE_SQL_DATABASE"),
    authentication: {
      type: "azure-active-directory-default",
    },
    options: {
      encrypt: true,
    },
  };
  const runtimePrincipalName = requireEnv("ARCADE_SQL_RUNTIME_PRINCIPAL");
  const runtimePrincipalClientId = requireEnv("ARCADE_SQL_RUNTIME_CLIENT_ID");
  const migrationPrincipalName = requireEnv("ARCADE_SQL_MIGRATION_PRINCIPAL");
  const migrationPrincipalClientId = requireEnv("ARCADE_SQL_MIGRATION_CLIENT_ID");
  const pool = await sql.connect(connection);

  try {
    await pool.request().batch(
      buildBootstrapSql({
        runtimePrincipalName,
        runtimePrincipalClientId,
        migrationPrincipalName,
        migrationPrincipalClientId,
      }),
    );

    console.log("Azure SQL principals and roles are ready.");
  } finally {
    await pool.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error("Azure SQL bootstrap failed.", error);
    process.exit(1);
  });
}
