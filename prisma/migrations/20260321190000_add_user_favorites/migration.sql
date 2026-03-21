BEGIN TRY

BEGIN TRAN;

CREATE TABLE [UserFavorite] (
  [userId] NVARCHAR(1000) NOT NULL,
  [gameId] INT NOT NULL,
  [createdAt] DATETIME2 NOT NULL CONSTRAINT [UserFavorite_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT [UserFavorite_pkey] PRIMARY KEY CLUSTERED ([userId], [gameId])
);

ALTER TABLE [UserFavorite] ADD CONSTRAINT [UserFavorite_userId_fkey]
FOREIGN KEY ([userId]) REFERENCES [User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE [UserFavorite] ADD CONSTRAINT [UserFavorite_gameId_fkey]
FOREIGN KEY ([gameId]) REFERENCES [Game]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

CREATE NONCLUSTERED INDEX [UserFavorite_gameId_createdAt_idx]
ON [UserFavorite]([gameId], [createdAt] DESC);

INSERT INTO [UserFavorite] ([userId], [gameId])
SELECT [UserProfile].[userId], [Game].[id]
FROM [UserProfile]
INNER JOIN [Game] ON [Game].[key] = [UserProfile].[favoriteGame]
WHERE [UserProfile].[favoriteGame] IS NOT NULL;

ALTER TABLE [UserProfile] DROP COLUMN [favoriteGame];

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH