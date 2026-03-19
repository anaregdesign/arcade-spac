import { describe, expect, it } from "vitest";
import { rewriteDatabaseUrlForManagedIdentity } from "../../../../scripts/start-with-migrations.mjs";

describe("rewriteDatabaseUrlForManagedIdentity", () => {
  it("rewrites DefaultAzureCredential URLs to ActiveDirectoryManagedIdentity when Container Apps identity env is available", () => {
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
    expect(result).toContain("msiEndpoint=http://127.0.0.1:42356/msi/token");
    expect(result).toContain("msiSecret=header-token");
    expect(result).not.toContain("authentication=DefaultAzureCredential");
  });

  it("leaves the URL unchanged when the managed identity endpoint is unavailable", () => {
    const input = "sqlserver://sql-arcade-green.database.windows.net;database=arcade;authentication=DefaultAzureCredential;encrypt=true;trustServerCertificate=false";

    expect(rewriteDatabaseUrlForManagedIdentity(input, "11111111-1111-1111-1111-111111111111", {})).toBe(input);
  });

  it("leaves non-DefaultAzureCredential URLs unchanged", () => {
    const input = "sqlserver://sql-arcade-green.database.windows.net;database=arcade;authentication=ActiveDirectoryManagedIdentity;encrypt=true;trustServerCertificate=false";

    expect(
      rewriteDatabaseUrlForManagedIdentity(input, "11111111-1111-1111-1111-111111111111", {
        IDENTITY_ENDPOINT: "http://127.0.0.1:42356/msi/token",
        IDENTITY_HEADER: "header-token",
      }),
    ).toBe(input);
  });
});
