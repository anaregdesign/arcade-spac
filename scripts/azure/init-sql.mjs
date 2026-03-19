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

export function buildPrincipalReconciliationSql(principalName, principalObjectId, roleNames, variableScope = "principal") {
  const escapedPrincipalLiteral = escapeSqlLiteral(principalName);
  const escapedObjectIdLiteral = escapeSqlLiteral(principalObjectId);
  const principalIdentifier = bracketSqlIdentifier(principalName);
  const principalIdentifierDynamicLiteral = escapeSqlLiteral(principalIdentifier);
  const variableFragment = sqlVariableFragment(variableScope);
  const principalNameVariable = `@principal_name_${variableFragment}`;
  const principalObjectIdVariable = `@principal_object_id_${variableFragment}`;
  const membershipStatements = roleNames.map((roleName) => membershipGuard(roleName, principalName)).join("\n");

  return `
DECLARE ${principalNameVariable} sysname = N'${escapedPrincipalLiteral}';
DECLARE ${principalObjectIdVariable} uniqueidentifier = CAST(N'${escapedObjectIdLiteral}' AS uniqueidentifier);

IF EXISTS (
  SELECT 1
  FROM sys.database_principals
  WHERE name = ${principalNameVariable}
    AND (
      type <> 'E'
      OR TRY_CAST(sid AS uniqueidentifier) IS NULL
      OR TRY_CAST(sid AS uniqueidentifier) <> ${principalObjectIdVariable}
    )
)
BEGIN
  PRINT N'Recreating Azure SQL principal ${escapedPrincipalLiteral} to match the current Entra object ID.';
  EXEC(N'DROP USER ${principalIdentifierDynamicLiteral}');
END;

IF NOT EXISTS (
  SELECT 1
  FROM sys.database_principals
  WHERE name = ${principalNameVariable}
)
BEGIN
  PRINT N'Creating Azure SQL principal ${escapedPrincipalLiteral}.';
  EXEC(N'CREATE USER ${principalIdentifierDynamicLiteral} FROM EXTERNAL PROVIDER;');
END;

${membershipStatements}`;
}

export function buildBootstrapSql({
  runtimePrincipalName,
  runtimePrincipalObjectId,
  migrationPrincipalName,
  migrationPrincipalObjectId,
}) {
  return `
${buildPrincipalReconciliationSql(runtimePrincipalName, runtimePrincipalObjectId, ["db_datareader", "db_datawriter"], "runtime")}

${buildPrincipalReconciliationSql(
  migrationPrincipalName,
  migrationPrincipalObjectId,
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
  const runtimePrincipalObjectId = requireEnv("ARCADE_SQL_RUNTIME_OBJECT_ID");
  const migrationPrincipalName = requireEnv("ARCADE_SQL_MIGRATION_PRINCIPAL");
  const migrationPrincipalObjectId = requireEnv("ARCADE_SQL_MIGRATION_OBJECT_ID");
  const pool = await sql.connect(connection);

  try {
    await pool.request().batch(
      buildBootstrapSql({
        runtimePrincipalName,
        runtimePrincipalObjectId,
        migrationPrincipalName,
        migrationPrincipalObjectId,
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
