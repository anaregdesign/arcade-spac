export type RuntimeConfig = {
  databaseUrl: string;
  environment: "development" | "test" | "production";
  hostingTarget: "local" | "azure";
  sessionSecret: string;
  publicAppUrl: string | null;
  azureAppConfigurationEndpoint: string | null;
  azureKeyVaultUri: string | null;
  entraTenantId: string | null;
  entraClientId: string | null;
};

const DEFAULT_SQLITE_URL = "file:./prisma/dev.db";
const DEFAULT_DEV_SESSION_SECRET = "arcade-local-session-secret";

function requireAzureSetting(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`${name} must be configured for Azure hosting.`);
  }

  return value;
}

export function getRuntimeConfig(): RuntimeConfig {
  const environment = (process.env.NODE_ENV as RuntimeConfig["environment"] | undefined) ?? "development";
  const hostingTarget = process.env.AZURE_CONTAINER_APP_NAME ? "azure" : "local";
  const sessionSecret = hostingTarget === "azure"
    ? requireAzureSetting("ARCADE_SESSION_SECRET", process.env.ARCADE_SESSION_SECRET)
    : process.env.ARCADE_SESSION_SECRET ?? DEFAULT_DEV_SESSION_SECRET;
  const databaseUrl = hostingTarget === "azure"
    ? requireAzureSetting("DATABASE_URL", process.env.DATABASE_URL)
    : process.env.DATABASE_URL ?? DEFAULT_SQLITE_URL;

  return {
    databaseUrl,
    environment,
    hostingTarget,
    sessionSecret,
    publicAppUrl: process.env.PUBLIC_APP_URL ?? null,
    azureAppConfigurationEndpoint: process.env.AZURE_APPCONFIG_ENDPOINT ?? null,
    azureKeyVaultUri: process.env.AZURE_KEY_VAULT_URI ?? null,
    entraTenantId: process.env.AZURE_TENANT_ID ?? null,
    entraClientId: process.env.AZURE_CLIENT_ID ?? null,
  };
}