import { describe, expect, it } from "vitest";

const initSqlModulePath = "../../../../scripts/azure/init-sql.mjs";

describe("sql bootstrap", () => {
  it("reconciles Azure SQL principals against managed identity client IDs before reusing role grants", async () => {
    const { buildBootstrapSql } = await import(initSqlModulePath);
    const sql = buildBootstrapSql({
      runtimePrincipalName: "id-sql-runtime-arcade-green",
      runtimePrincipalClientId: "11111111-1111-1111-1111-111111111111",
      migrationPrincipalName: "id-sql-migrate-arcade-green",
      migrationPrincipalClientId: "22222222-2222-2222-2222-222222222222",
    });

    expect(sql).toContain(
      "DECLARE @principal_client_id_runtime uniqueidentifier = CAST(N'11111111-1111-1111-1111-111111111111' AS uniqueidentifier);",
    );
    expect(sql).toContain(
      "DECLARE @principal_client_id_migration uniqueidentifier = CAST(N'22222222-2222-2222-2222-222222222222' AS uniqueidentifier);",
    );
    expect(sql).toContain("sid <> @principal_sid_runtime");
    expect(sql).toContain("sid <> @principal_sid_migration");
    expect(sql).toContain("EXEC(N'DROP USER [id-sql-runtime-arcade-green]');");
    expect(sql).toContain("EXEC(N'DROP USER [id-sql-migrate-arcade-green]');");
    expect(sql).toContain(
      "EXEC(N'CREATE USER [id-sql-migrate-arcade-green] WITH SID = ' + @principal_sid_literal_migration + N', TYPE = E;');",
    );
    expect(sql).toContain("ALTER ROLE [db_ddladmin] ADD MEMBER [id-sql-migrate-arcade-green];");
    expect(sql).not.toContain("FROM EXTERNAL PROVIDER");
  });

  it("escapes principal names in dynamic SQL statements", async () => {
    const { buildBootstrapSql } = await import(initSqlModulePath);
    const sql = buildBootstrapSql({
      runtimePrincipalName: "runtime]principal",
      runtimePrincipalClientId: "33333333-3333-3333-3333-333333333333",
      migrationPrincipalName: "migration'principal",
      migrationPrincipalClientId: "44444444-4444-4444-4444-444444444444",
    });

    expect(sql).toContain("EXEC(N'DROP USER [runtime]]principal]');");
    expect(sql).toContain("DECLARE @principal_name_migration sysname = N'migration''principal';");
    expect(sql).toContain(
      "EXEC(N'CREATE USER [migration''principal] WITH SID = ' + @principal_sid_literal_migration + N', TYPE = E;');",
    );
    expect(sql).toContain("ALTER ROLE [db_ddladmin] ADD MEMBER [migration'principal];");
  });
});
