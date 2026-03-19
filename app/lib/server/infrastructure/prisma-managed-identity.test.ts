import { describe, expect, it } from "vitest";

const prismaManagedIdentityModulePath = "../../../../scripts/prisma-managed-identity.mjs";

describe("rewriteDatabaseUrlForManagedIdentity", () => {
  it("rewrites DefaultAzureCredential URLs to ActiveDirectoryManagedIdentity when Container Apps identity env is available", async () => {
    const { rewriteDatabaseUrlForManagedIdentity } = await import(prismaManagedIdentityModulePath);
    const result = rewriteDatabaseUrlForManagedIdentity(
      "sqlserver://sql-arcade-green.database.windows.net;database=arcade;authentication=DefaultAzureCredential;encrypt=true;trustServerCertificate=false",
      "11111111-1111-1111-1111-111111111111",
      {
        IDENTITY_ENDPOINT: "http://127.0.0.1:42356/msi/token",
        IDENTITY_HEADER: "header-token",
      },
    );

    expect(result).toContain("authentication=ActiveDirectoryManagedIdentity");
    expect(result).toContain("clientId=11111111-1111-1111-1111-111111111111");
    expect(result).toContain("msiEndpoint={http://127.0.0.1:42356/msi/token}");
    expect(result).toContain("msiSecret={header-token}");
    expect(result).not.toContain("authentication=DefaultAzureCredential");
  });

  it("leaves the URL unchanged when the managed identity endpoint is unavailable", async () => {
    const { rewriteDatabaseUrlForManagedIdentity } = await import(prismaManagedIdentityModulePath);
    const input = "sqlserver://sql-arcade-green.database.windows.net;database=arcade;authentication=DefaultAzureCredential;encrypt=true;trustServerCertificate=false";

    expect(rewriteDatabaseUrlForManagedIdentity(input, "11111111-1111-1111-1111-111111111111", {})).toBe(input);
  });

  it("leaves non-DefaultAzureCredential URLs unchanged", async () => {
    const { rewriteDatabaseUrlForManagedIdentity } = await import(prismaManagedIdentityModulePath);
    const input = "sqlserver://sql-arcade-green.database.windows.net;database=arcade;authentication=ActiveDirectoryManagedIdentity;encrypt=true;trustServerCertificate=false";

    expect(
      rewriteDatabaseUrlForManagedIdentity(input, "11111111-1111-1111-1111-111111111111", {
        IDENTITY_ENDPOINT: "http://127.0.0.1:42356/msi/token",
        IDENTITY_HEADER: "header-token",
      }),
    ).toBe(input);
  });
});

describe("resolveMigrationDatabaseUrl", () => {
  it("prefers STARTUP_MIGRATION_DATABASE_URL when present", async () => {
    const { resolveMigrationDatabaseUrl } = await import(prismaManagedIdentityModulePath);
    expect(
      resolveMigrationDatabaseUrl({
        AZURE_APP_NAME: "arcade",
        DATABASE_URL: "sqlserver://runtime.database.windows.net;database=arcade",
        STARTUP_MIGRATION_DATABASE_URL: "sqlserver://migrate.database.windows.net;database=arcade",
      }),
    ).toEqual({
      source: "STARTUP_MIGRATION_DATABASE_URL",
      value: "sqlserver://migrate.database.windows.net;database=arcade",
    });
  });

  it("throws when Azure hosting is enabled and no migration database URL is available", async () => {
    const { resolveMigrationDatabaseUrl } = await import(prismaManagedIdentityModulePath);
    expect(() => resolveMigrationDatabaseUrl({ AZURE_APP_NAME: "arcade" })).toThrow(
      "STARTUP_MIGRATION_DATABASE_URL or DATABASE_URL must be configured for Azure-hosted Prisma migration.",
    );
  });
});

describe("buildManagedIdentityPrismaEnv", () => {
  it("rewrites DATABASE_URL and aligns AZURE_CLIENT_ID for managed identity commands", async () => {
    const { buildManagedIdentityPrismaEnv } = await import(prismaManagedIdentityModulePath);
    const result = buildManagedIdentityPrismaEnv(
      {
        DATABASE_URL:
          "sqlserver://sql-arcade-green.database.windows.net;database=arcade;authentication=DefaultAzureCredential;encrypt=true;trustServerCertificate=false",
        IDENTITY_ENDPOINT: "http://127.0.0.1:42356/msi/token",
        IDENTITY_HEADER: "header-token",
      },
      "11111111-1111-1111-1111-111111111111",
    );

    expect(result.AZURE_CLIENT_ID).toBe("11111111-1111-1111-1111-111111111111");
    expect(result.DATABASE_URL).toContain("authentication=ActiveDirectoryManagedIdentity");
  });
});
