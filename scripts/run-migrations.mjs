import {
  AZURE_SQL_MIGRATION_CLIENT_ID_ENV_NAME,
  buildManagedIdentityPrismaEnv,
  describeDatabaseUrlSource,
  resolveMigrationDatabaseUrl,
  runNpmCommand,
} from "./prisma-managed-identity.mjs";

async function main() {
  const resolvedDatabaseUrl = resolveMigrationDatabaseUrl();
  const migrationClientId = process.env[AZURE_SQL_MIGRATION_CLIENT_ID_ENV_NAME] ?? process.env.AZURE_CLIENT_ID;
  const migrationEnv = buildManagedIdentityPrismaEnv(
    process.env,
    migrationClientId,
    resolvedDatabaseUrl?.value,
  );

  if (resolvedDatabaseUrl) {
    console.log(
      `Resolved Prisma migration database URL from ${resolvedDatabaseUrl.source} (${describeDatabaseUrlSource(resolvedDatabaseUrl.value)}).`,
    );
  }

  if (
    typeof migrationClientId === "string"
    && migrationClientId.trim().length > 0
    && resolvedDatabaseUrl
    && migrationEnv.DATABASE_URL !== resolvedDatabaseUrl.value
  ) {
    console.log(`Using ActiveDirectoryManagedIdentity Prisma auth for migration job with client ID ${migrationClientId.trim()}.`);
  }

  await runNpmCommand(["run", "db:migrate:deploy"], migrationEnv);
}

main().catch((error) => {
  console.error("Failed to run Prisma migrations.", error);
  process.exit(1);
});
