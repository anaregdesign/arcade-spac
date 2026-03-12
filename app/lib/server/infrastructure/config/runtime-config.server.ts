export type RuntimeConfig = {
  authMode: "local" | "entra";
  databaseUrl: string;
  environment: "development" | "test" | "production";
  hostingTarget: "local" | "azure";
  sessionSecret: string;
  publicAppUrl: string | null;
  azureAppConfigurationEndpoint: string | null;
  azureKeyVaultUri: string | null;
  entraTenantId: string | null;
  entraClientId: string | null;
  entraClientSecret: string | null;
  entraAuthority: string | null;
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
  const requestedAuthMode = process.env.ARCADE_AUTH_MODE === "local" || process.env.ARCADE_AUTH_MODE === "entra"
    ? process.env.ARCADE_AUTH_MODE
    : hostingTarget === "azure"
      ? "entra"
      : "local";
  const sessionSecret = hostingTarget === "azure"
    ? requireAzureSetting("ARCADE_SESSION_SECRET", process.env.ARCADE_SESSION_SECRET)
    : process.env.ARCADE_SESSION_SECRET ?? DEFAULT_DEV_SESSION_SECRET;
  const databaseUrl = hostingTarget === "azure"
    ? requireAzureSetting("DATABASE_URL", process.env.DATABASE_URL)
    : process.env.DATABASE_URL ?? DEFAULT_SQLITE_URL;
  const publicAppUrl = process.env.PUBLIC_APP_URL ?? null;
  const entraTenantId = process.env.AZURE_TENANT_ID ?? null;
  const entraClientId = process.env.AZURE_CLIENT_ID ?? null;
  const entraClientSecret = process.env.AZURE_CLIENT_SECRET ?? null;

  if (requestedAuthMode === "entra") {
    requireAzureSetting("PUBLIC_APP_URL", publicAppUrl ?? undefined);
    requireAzureSetting("AZURE_TENANT_ID", entraTenantId ?? undefined);
    requireAzureSetting("AZURE_CLIENT_ID", entraClientId ?? undefined);
    requireAzureSetting("AZURE_CLIENT_SECRET", entraClientSecret ?? undefined);
  }

  return {
    authMode: requestedAuthMode,
    databaseUrl,
    environment,
    hostingTarget,
    sessionSecret,
    publicAppUrl,
    azureAppConfigurationEndpoint: process.env.AZURE_APPCONFIG_ENDPOINT ?? null,
    azureKeyVaultUri: process.env.AZURE_KEY_VAULT_URI ?? null,
    entraTenantId,
    entraClientId,
    entraClientSecret,
    entraAuthority: entraTenantId ? `https://login.microsoftonline.com/${entraTenantId}/v2.0` : null,
  };
}