import { describe, expect, it } from "vitest";

const prismaManagedIdentityModulePath = "../../../../scripts/prisma-managed-identity.mjs";

describe("rewriteDatabaseUrlForManagedIdentity", () => {
  it("preserves DefaultAzureCredential URLs because Prisma resolves the user-assigned identity from AZURE_CLIENT_ID", async () => {
    const { rewriteDatabaseUrlForManagedIdentity } = await import(prismaManagedIdentityModulePath);
    const input = "sqlserver://sql-arcade-green.database.windows.net;database=arcade;authentication=DefaultAzureCredential;encrypt=true;trustServerCertificate=false";
    const result = rewriteDatabaseUrlForManagedIdentity(input);

    expect(result).toBe(input);
  });

  it("leaves the URL unchanged when the managed identity endpoint is unavailable", async () => {
    const { rewriteDatabaseUrlForManagedIdentity } = await import(prismaManagedIdentityModulePath);
    const input = "sqlserver://sql-arcade-green.database.windows.net;database=arcade;authentication=DefaultAzureCredential;encrypt=true;trustServerCertificate=false";

    expect(rewriteDatabaseUrlForManagedIdentity(input)).toBe(input);
  });

  it("leaves non-DefaultAzureCredential URLs unchanged", async () => {
    const { rewriteDatabaseUrlForManagedIdentity } = await import(prismaManagedIdentityModulePath);
    const input = "sqlserver://sql-arcade-green.database.windows.net;database=arcade;authentication=ActiveDirectoryManagedIdentity;encrypt=true;trustServerCertificate=false";

    expect(rewriteDatabaseUrlForManagedIdentity(input)).toBe(input);
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
  it("keeps DATABASE_URL stable and aligns AZURE_CLIENT_ID for managed identity commands", async () => {
    const { buildManagedIdentityPrismaEnv } = await import(prismaManagedIdentityModulePath);
    const result = buildManagedIdentityPrismaEnv(
      {
        DATABASE_URL:
          "sqlserver://sql-arcade-green.database.windows.net;database=arcade;authentication=DefaultAzureCredential;encrypt=true;trustServerCertificate=false",
      },
      "11111111-1111-1111-1111-111111111111",
    );

    expect(result.AZURE_CLIENT_ID).toBe("11111111-1111-1111-1111-111111111111");
    expect(result.DATABASE_URL).toBe(
      "sqlserver://sql-arcade-green.database.windows.net;database=arcade;authentication=DefaultAzureCredential;encrypt=true;trustServerCertificate=false",
    );
  });
});

describe("parseAzureSqlConnectionConfig", () => {
  it("extracts server, database, and TLS flags from a JDBC-style SQL Server URL", async () => {
    const { parseAzureSqlConnectionConfig } = await import(prismaManagedIdentityModulePath);

    expect(
      parseAzureSqlConnectionConfig(
        "sqlserver://sql-arcade-green.database.windows.net;database=arcade;authentication=DefaultAzureCredential;encrypt=true;trustServerCertificate=false",
      ),
    ).toEqual({
      server: "sql-arcade-green.database.windows.net",
      database: "arcade",
      encrypt: true,
      trustServerCertificate: false,
    });
  });

  it("accepts SQL Server URLs that include databaseName and explicit host ports", async () => {
    const { parseAzureSqlConnectionConfig } = await import(prismaManagedIdentityModulePath);

    expect(
      parseAzureSqlConnectionConfig(
        "sqlserver://localhost,1433;databaseName=arcade;encrypt=false;trustServerCertificate=true",
      ),
    ).toEqual({
      server: "localhost",
      database: "arcade",
      encrypt: false,
      trustServerCertificate: true,
    });
  });
});
