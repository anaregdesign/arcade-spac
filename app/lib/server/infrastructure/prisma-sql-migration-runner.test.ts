import { describe, expect, it } from "vitest";

const prismaSqlMigrationRunnerModulePath = "../../../../scripts/prisma-sql-migration-runner.mjs";

describe("unwrapPrismaSqlServerTransactionWrapper", () => {
  it("removes Prisma's SQL Server TRY/CATCH transaction wrapper", async () => {
    const { unwrapPrismaSqlServerTransactionWrapper } = await import(prismaSqlMigrationRunnerModulePath);
    const wrappedSql = `
BEGIN TRY

BEGIN TRAN;

ALTER TABLE [UserProfile]
ADD [themePreference] NVARCHAR(1000) NOT NULL CONSTRAINT [UserProfile_themePreference_df] DEFAULT 'LIGHT';

CREATE INDEX [PlayResult_shareToken_idx] ON [PlayResult]([shareToken]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
`;

    expect(unwrapPrismaSqlServerTransactionWrapper(wrappedSql)).toBe(`
ALTER TABLE [UserProfile]
ADD [themePreference] NVARCHAR(1000) NOT NULL CONSTRAINT [UserProfile_themePreference_df] DEFAULT 'LIGHT';

CREATE INDEX [PlayResult_shareToken_idx] ON [PlayResult]([shareToken]);
`.trim());
  });
});

describe("parsePrismaSqlStatements", () => {
  it("splits wrapped Prisma SQL Server migration files into executable statements", async () => {
    const { parsePrismaSqlStatements } = await import(prismaSqlMigrationRunnerModulePath);
    const wrappedSql = `
BEGIN TRY

BEGIN TRAN;

ALTER TABLE [UserProfile]
ADD [themePreference] NVARCHAR(1000) NOT NULL CONSTRAINT [UserProfile_themePreference_df] DEFAULT 'LIGHT;DARK';

-- preserve comments with semicolons;
CREATE INDEX [PlayResult_shareToken_idx] ON [PlayResult]([shareToken]);

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
`;

    expect(parsePrismaSqlStatements(wrappedSql)).toEqual([
      "ALTER TABLE [UserProfile]\nADD [themePreference] NVARCHAR(1000) NOT NULL CONSTRAINT [UserProfile_themePreference_df] DEFAULT 'LIGHT;DARK'",
      "-- preserve comments with semicolons;\nCREATE INDEX [PlayResult_shareToken_idx] ON [PlayResult]([shareToken])",
    ]);
  });

  it("keeps non-wrapped migration files split on top-level semicolons only", async () => {
    const { parsePrismaSqlStatements } = await import(prismaSqlMigrationRunnerModulePath);
    const sqlText = `
ALTER TABLE [dbo].[User]
ADD [displayName] NVARCHAR(1000) NOT NULL CONSTRAINT [User_displayName_df] DEFAULT 'Player;One';

/* block comment; still part of the next statement */
CREATE INDEX [User_displayName_idx] ON [dbo].[User]([displayName]);
`;

    expect(parsePrismaSqlStatements(sqlText)).toEqual([
      "ALTER TABLE [dbo].[User]\nADD [displayName] NVARCHAR(1000) NOT NULL CONSTRAINT [User_displayName_df] DEFAULT 'Player;One'",
      "/* block comment; still part of the next statement */\nCREATE INDEX [User_displayName_idx] ON [dbo].[User]([displayName])",
    ]);
  });
});
