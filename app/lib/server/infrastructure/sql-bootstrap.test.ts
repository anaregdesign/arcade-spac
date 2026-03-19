import { describe, expect, it } from "vitest";

const initSqlModulePath = "../../../../scripts/azure/init-sql.mjs";

describe("sql bootstrap", () => {
  it("reconciles Azure SQL principals against current Entra object IDs before reusing role grants", async () => {
    const { buildBootstrapSql } = await import(initSqlModulePath);
    const sql = buildBootstrapSql({
      runtimePrincipalName: "ca-arcade-green",
      runtimePrincipalObjectId: "11111111-1111-1111-1111-111111111111",
      migrationPrincipalName: "id-arcade-green-migration",
      migrationPrincipalObjectId: "22222222-2222-2222-2222-222222222222",
    });

    expect(sql).toContain("DECLARE @principal_object_id uniqueidentifier = CAST(N'11111111-1111-1111-1111-111111111111' AS uniqueidentifier);");
    expect(sql).toContain("DECLARE @principal_object_id uniqueidentifier = CAST(N'22222222-2222-2222-2222-222222222222' AS uniqueidentifier);");
    expect(sql).toContain("TRY_CAST(sid AS uniqueidentifier) <> @principal_object_id");
    expect(sql).toContain("EXEC(N'DROP USER [ca-arcade-green]');");
    expect(sql).toContain("EXEC(N'DROP USER [id-arcade-green-migration]');");
    expect(sql).toContain("ALTER ROLE [db_ddladmin] ADD MEMBER [id-arcade-green-migration];");
  });

  it("escapes principal names in dynamic SQL statements", async () => {
    const { buildBootstrapSql } = await import(initSqlModulePath);
    const sql = buildBootstrapSql({
      runtimePrincipalName: "runtime]principal",
      runtimePrincipalObjectId: "33333333-3333-3333-3333-333333333333",
      migrationPrincipalName: "migration'principal",
      migrationPrincipalObjectId: "44444444-4444-4444-4444-444444444444",
    });

    expect(sql).toContain("EXEC(N'DROP USER [runtime]]principal]');");
    expect(sql).toContain("DECLARE @principal_name sysname = N'migration''principal';");
    expect(sql).toContain("EXEC(N'CREATE USER [migration''principal] FROM EXTERNAL PROVIDER;');");
    expect(sql).toContain("ALTER ROLE [db_ddladmin] ADD MEMBER [migration'principal];");
  });
});
