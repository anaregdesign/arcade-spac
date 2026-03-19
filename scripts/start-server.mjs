import {
  AZURE_SQL_RUNTIME_CLIENT_ID_ENV_NAME,
  STARTUP_MIGRATION_DATABASE_URL_ENV_NAME,
  buildManagedIdentityPrismaEnv,
  runNpmCommand,
} from "./prisma-managed-identity.mjs";

async function main() {
  const runtimeClientId = process.env[AZURE_SQL_RUNTIME_CLIENT_ID_ENV_NAME];
  const serverEnv = buildManagedIdentityPrismaEnv(process.env, runtimeClientId);

  if (
    typeof runtimeClientId === "string"
    && runtimeClientId.trim().length > 0
    && typeof process.env.DATABASE_URL === "string"
    && process.env.DATABASE_URL.trim().length > 0
    && serverEnv.DATABASE_URL !== process.env.DATABASE_URL
  ) {
    console.log(`Using ActiveDirectoryManagedIdentity Prisma auth for server runtime with client ID ${runtimeClientId.trim()}.`);
  }

  delete serverEnv[STARTUP_MIGRATION_DATABASE_URL_ENV_NAME];

  await runNpmCommand(["run", "start:server"], serverEnv);
}

main().catch((error) => {
  console.error("Failed to start Arcade runtime.", error);
  process.exit(1);
});
