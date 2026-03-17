BEGIN TRY

BEGIN TRAN;

ALTER TABLE [Game] ADD [id_int] INT IDENTITY(1,1);
CREATE UNIQUE NONCLUSTERED INDEX [Game_id_int_key] ON [Game]([id_int]);

ALTER TABLE [PlayResult] ADD [gameId_int] INT;
ALTER TABLE [UserGameSummary] ADD [gameId_int] INT;
ALTER TABLE [LeaderboardEntry] ADD [gameId_int] INT;
ALTER TABLE [UserFeedbackLog] ADD [gameId_int] INT;

UPDATE [PlayResult]
SET [gameId_int] = [Game].[id_int]
FROM [PlayResult]
INNER JOIN [Game] ON [PlayResult].[gameId] = [Game].[id];

UPDATE [UserGameSummary]
SET [gameId_int] = [Game].[id_int]
FROM [UserGameSummary]
INNER JOIN [Game] ON [UserGameSummary].[gameId] = [Game].[id];

UPDATE [UserFeedbackLog]
SET [gameId_int] = [Game].[id_int]
FROM [UserFeedbackLog]
INNER JOIN [Game] ON [UserFeedbackLog].[gameId] = [Game].[id];

UPDATE [LeaderboardEntry]
SET [gameId_int] = [Game].[id_int]
FROM [LeaderboardEntry]
INNER JOIN [Game] ON [LeaderboardEntry].[gameId] = [Game].[id]
WHERE [LeaderboardEntry].[gameId] IS NOT NULL;

ALTER TABLE [PlayResult] ALTER COLUMN [gameId_int] INT NOT NULL;
ALTER TABLE [UserGameSummary] ALTER COLUMN [gameId_int] INT NOT NULL;
ALTER TABLE [UserFeedbackLog] ALTER COLUMN [gameId_int] INT NOT NULL;

ALTER TABLE [PlayResult] DROP CONSTRAINT [PlayResult_gameId_fkey];
ALTER TABLE [LeaderboardEntry] DROP CONSTRAINT [LeaderboardEntry_gameId_fkey];
ALTER TABLE [UserGameSummary] DROP CONSTRAINT [UserGameSummary_gameId_fkey];
ALTER TABLE [UserFeedbackLog] DROP CONSTRAINT [UserFeedbackLog_gameId_fkey];

DROP INDEX [PlayResult_userId_gameId_startedAt_idx] ON [PlayResult];
DROP INDEX [PlayResult_gameId_status_competitivePoints_idx] ON [PlayResult];
ALTER TABLE [UserGameSummary] DROP CONSTRAINT [UserGameSummary_userId_gameId_key];
DROP INDEX [LeaderboardEntry_periodType_gameId_rank_idx] ON [LeaderboardEntry];
ALTER TABLE [LeaderboardEntry] DROP CONSTRAINT [LeaderboardEntry_periodType_gameId_userId_key];
DROP INDEX [UserFeedbackLog_gameId_loggedAt_idx] ON [UserFeedbackLog];

ALTER TABLE [PlayResult] DROP COLUMN [gameId];
EXEC sp_rename 'PlayResult.gameId_int', 'gameId', 'COLUMN';

ALTER TABLE [UserGameSummary] DROP COLUMN [gameId];
EXEC sp_rename 'UserGameSummary.gameId_int', 'gameId', 'COLUMN';

ALTER TABLE [LeaderboardEntry] DROP COLUMN [gameId];
EXEC sp_rename 'LeaderboardEntry.gameId_int', 'gameId', 'COLUMN';

ALTER TABLE [UserFeedbackLog] DROP COLUMN [gameId];
EXEC sp_rename 'UserFeedbackLog.gameId_int', 'gameId', 'COLUMN';

DROP INDEX [Game_id_int_key] ON [Game];
ALTER TABLE [Game] DROP CONSTRAINT [Game_pkey];
ALTER TABLE [Game] DROP COLUMN [id];
EXEC sp_rename 'Game.id_int', 'id', 'COLUMN';
ALTER TABLE [Game] ADD CONSTRAINT [Game_pkey] PRIMARY KEY CLUSTERED ([id]);

CREATE NONCLUSTERED INDEX [PlayResult_userId_gameId_startedAt_idx] ON [PlayResult]([userId], [gameId], [startedAt]);
CREATE NONCLUSTERED INDEX [PlayResult_gameId_status_competitivePoints_idx] ON [PlayResult]([gameId], [status], [competitivePoints]);
ALTER TABLE [UserGameSummary] ADD CONSTRAINT [UserGameSummary_userId_gameId_key] UNIQUE NONCLUSTERED ([userId], [gameId]);
ALTER TABLE [LeaderboardEntry] ADD CONSTRAINT [LeaderboardEntry_periodType_gameId_userId_key] UNIQUE NONCLUSTERED ([periodType], [gameId], [userId]);
CREATE NONCLUSTERED INDEX [LeaderboardEntry_periodType_gameId_rank_idx] ON [LeaderboardEntry]([periodType], [gameId], [rank]);
CREATE NONCLUSTERED INDEX [UserFeedbackLog_gameId_loggedAt_idx] ON [UserFeedbackLog]([gameId], [loggedAt] DESC);

ALTER TABLE [PlayResult] ADD CONSTRAINT [PlayResult_gameId_fkey] FOREIGN KEY ([gameId]) REFERENCES [Game]([id]) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE [LeaderboardEntry] ADD CONSTRAINT [LeaderboardEntry_gameId_fkey] FOREIGN KEY ([gameId]) REFERENCES [Game]([id]) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE [UserGameSummary] ADD CONSTRAINT [UserGameSummary_gameId_fkey] FOREIGN KEY ([gameId]) REFERENCES [Game]([id]) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE [UserFeedbackLog] ADD CONSTRAINT [UserFeedbackLog_gameId_fkey] FOREIGN KEY ([gameId]) REFERENCES [Game]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
