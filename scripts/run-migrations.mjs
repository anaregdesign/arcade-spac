import {
  AZURE_SQL_MIGRATION_CLIENT_ID_ENV_NAME,
  buildManagedIdentityPrismaEnv,
  describeDatabaseUrlSource,
  resolveMigrationDatabaseUrl,
  verifyManagedIdentitySqlLogin,
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
  ) {
    console.log(`Using DefaultAzureCredential Prisma auth for migration job with client ID ${migrationClientId.trim()}.`);
  }

  if (resolvedDatabaseUrl) {
    try {
      const loginContext = await verifyManagedIdentitySqlLogin(
        migrationEnv.DATABASE_URL,
        migrationClientId,
      );

      if (loginContext) {
        console.log("Managed identity SQL preflight succeeded.", loginContext);
      } else {
        console.log("Managed identity SQL preflight succeeded.");
      }
    } catch (error) {
      console.error("Managed identity SQL preflight failed before Prisma migrate.", error);
      throw error;
    }
  }

  await runNpmCommand(["run", "db:migrate:deploy"], migrationEnv);
}

main().catch((error) => {
  console.error("Failed to run Prisma migrations.", error);
  process.exit(1);
});
