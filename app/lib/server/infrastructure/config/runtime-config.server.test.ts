import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const loadMock = vi.fn();

vi.mock("@azure/app-configuration-provider", () => ({
  load: loadMock,
}));

vi.mock("@azure/identity", () => ({
  DefaultAzureCredential: class DefaultAzureCredential {},
  ManagedIdentityCredential: class ManagedIdentityCredential {},
}));

const RUNTIME_ENV_KEYS = [
  "ARCADE_AUTH_MODE",
  "ARCADE_SESSION_SECRET",
  "AZURE_APP_NAME",
  "AZURE_APPCONFIG_ENDPOINT",
  "AZURE_KEY_VAULT_URI",
  "DATABASE_URL",
  "ENTRA_AUTHORITY_TENANT",
  "ENTRA_CLIENT_ID",
  "ENTRA_CLIENT_SECRET",
  "ENTRA_TENANT_ID",
  "PUBLIC_APP_URL",
] as const;

const ORIGINAL_ENV = new Map(
  RUNTIME_ENV_KEYS.map((key) => [key, process.env[key]]),
);

function restoreRuntimeEnv() {
  for (const key of RUNTIME_ENV_KEYS) {
    const value = ORIGINAL_ENV.get(key);

    if (typeof value === "string") {
      process.env[key] = value;
      continue;
    }

    delete process.env[key];
  }
}

describe("runtime-config.server", () => {
  beforeEach(() => {
    vi.resetModules();
    loadMock.mockReset();
    restoreRuntimeEnv();
  });

  afterEach(() => {
    restoreRuntimeEnv();
  });

  it("uses complete Azure process env runtime settings without loading App Configuration", async () => {
    process.env.AZURE_APP_NAME = "arcade";
    process.env.AZURE_APPCONFIG_ENDPOINT = "https://example.azconfig.io";
    process.env.AZURE_KEY_VAULT_URI = "https://example.vault.azure.net/";
    process.env.ARCADE_AUTH_MODE = "entra";
    process.env.PUBLIC_APP_URL = "https://example.com";
    process.env.ARCADE_SESSION_SECRET = "session-secret";
    process.env.DATABASE_URL = "sqlserver://localhost:1433;database=arcade;user=sa;password=Passw0rd!;encrypt=false;trustServerCertificate=true";
    process.env.ENTRA_TENANT_ID = "tenant-id";
    process.env.ENTRA_AUTHORITY_TENANT = "organizations";
    process.env.ENTRA_CLIENT_ID = "client-id";
    process.env.ENTRA_CLIENT_SECRET = "client-secret";

    const { getRuntimeConfig } = await import("./runtime-config.server");

    expect(loadMock).not.toHaveBeenCalled();
    expect(getRuntimeConfig()).toMatchObject({
      authMode: "entra",
      databaseUrl: process.env.DATABASE_URL,
      hostingTarget: "azure",
      sessionSecret: "session-secret",
      publicAppUrl: "https://example.com",
      azureAppConfigurationEndpoint: "https://example.azconfig.io",
      azureKeyVaultUri: "https://example.vault.azure.net/",
      entraTenantId: "tenant-id",
      entraAuthorityTenant: "organizations",
      entraClientId: "client-id",
      entraClientSecret: "client-secret",
      entraAuthority: "https://login.microsoftonline.com/organizations/v2.0",
    });
  });
});
