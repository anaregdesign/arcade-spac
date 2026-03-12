BEGIN TRY

BEGIN TRAN;

-- CreateSchema
IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = N'dbo') EXEC sp_executesql N'CREATE SCHEMA [dbo];';

-- CreateTable
CREATE TABLE [dbo].[User] (
    [id] NVARCHAR(1000) NOT NULL,
    [entraObjectId] NVARCHAR(1000) NOT NULL,
    [displayName] NVARCHAR(1000) NOT NULL,
    [avatarUrl] NVARCHAR(1000),
    [joinedAt] DATETIME2 NOT NULL CONSTRAINT [User_joinedAt_df] DEFAULT CURRENT_TIMESTAMP,
    [onboardingSeenAt] DATETIME2,
    [visibilityScope] NVARCHAR(1000) NOT NULL CONSTRAINT [User_visibilityScope_df] DEFAULT 'TENANT_ONLY',
    CONSTRAINT [User_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [User_entraObjectId_key] UNIQUE NONCLUSTERED ([entraObjectId])
);

-- CreateTable
CREATE TABLE [dbo].[UserProfile] (
    [userId] NVARCHAR(1000) NOT NULL,
    [tagline] NVARCHAR(1000),
    [favoriteGame] NVARCHAR(1000),
    [streakDays] INT NOT NULL CONSTRAINT [UserProfile_streakDays_df] DEFAULT 0,
    [totalPlayCount] INT NOT NULL CONSTRAINT [UserProfile_totalPlayCount_df] DEFAULT 0,
    [lastPlayedAt] DATETIME2,
    CONSTRAINT [UserProfile_pkey] PRIMARY KEY CLUSTERED ([userId])
);

-- CreateTable
CREATE TABLE [dbo].[Game] (
    [id] NVARCHAR(1000) NOT NULL,
    [key] NVARCHAR(1000) NOT NULL,
    [name] NVARCHAR(1000) NOT NULL,
    [shortDescription] NVARCHAR(1000) NOT NULL,
    [accentColor] NVARCHAR(1000) NOT NULL,
    [rulesSummary] NVARCHAR(1000) NOT NULL,
    CONSTRAINT [Game_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [Game_key_key] UNIQUE NONCLUSTERED ([key])
);

-- CreateTable
CREATE TABLE [dbo].[PlayResult] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [gameId] NVARCHAR(1000) NOT NULL,
    [difficulty] NVARCHAR(1000) NOT NULL,
    [startedAt] DATETIME2 NOT NULL,
    [finishedAt] DATETIME2,
    [status] NVARCHAR(1000) NOT NULL,
    [cleared] BIT NOT NULL,
    [leaderboardEligible] BIT NOT NULL,
    [primaryMetric] INT NOT NULL,
    [secondaryMetric] INT,
    [hintCount] INT,
    [mistakeCount] INT,
    [competitivePoints] INT NOT NULL,
    [totalPointsDelta] INT NOT NULL CONSTRAINT [PlayResult_totalPointsDelta_df] DEFAULT 0,
    [rankDelta] INT,
    [isPersonalBest] BIT NOT NULL CONSTRAINT [PlayResult_isPersonalBest_df] DEFAULT 0,
    [summaryText] NVARCHAR(1000) NOT NULL,
    [sharePath] NVARCHAR(1000),
    CONSTRAINT [PlayResult_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[LeaderboardEntry] (
    [id] NVARCHAR(1000) NOT NULL,
    [periodType] NVARCHAR(1000) NOT NULL,
    [gameId] NVARCHAR(1000),
    [userId] NVARCHAR(1000) NOT NULL,
    [rank] INT NOT NULL,
    [points] INT NOT NULL,
    [deltaToLeader] INT,
    [deltaToNext] INT,
    [capturedAt] DATETIME2 NOT NULL CONSTRAINT [LeaderboardEntry_capturedAt_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [LeaderboardEntry_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [LeaderboardEntry_periodType_gameId_userId_key] UNIQUE NONCLUSTERED ([periodType],[gameId],[userId])
);

-- CreateTable
CREATE TABLE [dbo].[UserGameSummary] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [gameId] NVARCHAR(1000) NOT NULL,
    [currentRank] INT,
    [bestCompetitivePoints] INT NOT NULL CONSTRAINT [UserGameSummary_bestCompetitivePoints_df] DEFAULT 0,
    [personalBestMetric] INT,
    [playCount] INT NOT NULL CONSTRAINT [UserGameSummary_playCount_df] DEFAULT 0,
    [completedCount] INT NOT NULL CONSTRAINT [UserGameSummary_completedCount_df] DEFAULT 0,
    [lastPlayedAt] DATETIME2,
    [recommendationText] NVARCHAR(1000),
    CONSTRAINT [UserGameSummary_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UserGameSummary_userId_gameId_key] UNIQUE NONCLUSTERED ([userId],[gameId])
);

-- CreateTable
CREATE TABLE [dbo].[UserOverallSummary] (
    [id] NVARCHAR(1000) NOT NULL,
    [userId] NVARCHAR(1000) NOT NULL,
    [periodType] NVARCHAR(1000) NOT NULL,
    [totalPoints] INT NOT NULL CONSTRAINT [UserOverallSummary_totalPoints_df] DEFAULT 0,
    [currentRank] INT,
    [trendDelta] INT NOT NULL CONSTRAINT [UserOverallSummary_trendDelta_df] DEFAULT 0,
    [recentPlaySummary] NVARCHAR(1000),
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [UserOverallSummary_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [UserOverallSummary_userId_periodType_key] UNIQUE NONCLUSTERED ([userId],[periodType])
);

-- CreateIndex
CREATE NONCLUSTERED INDEX [PlayResult_userId_gameId_startedAt_idx] ON [dbo].[PlayResult]([userId], [gameId], [startedAt]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [PlayResult_gameId_status_competitivePoints_idx] ON [dbo].[PlayResult]([gameId], [status], [competitivePoints]);

-- CreateIndex
CREATE NONCLUSTERED INDEX [LeaderboardEntry_periodType_gameId_rank_idx] ON [dbo].[LeaderboardEntry]([periodType], [gameId], [rank]);

-- AddForeignKey
ALTER TABLE [dbo].[UserProfile] ADD CONSTRAINT [UserProfile_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[PlayResult] ADD CONSTRAINT [PlayResult_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[PlayResult] ADD CONSTRAINT [PlayResult_gameId_fkey] FOREIGN KEY ([gameId]) REFERENCES [dbo].[Game]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[LeaderboardEntry] ADD CONSTRAINT [LeaderboardEntry_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[LeaderboardEntry] ADD CONSTRAINT [LeaderboardEntry_gameId_fkey] FOREIGN KEY ([gameId]) REFERENCES [dbo].[Game]([id]) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserGameSummary] ADD CONSTRAINT [UserGameSummary_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserGameSummary] ADD CONSTRAINT [UserGameSummary_gameId_fkey] FOREIGN KEY ([gameId]) REFERENCES [dbo].[Game]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE [dbo].[UserOverallSummary] ADD CONSTRAINT [UserOverallSummary_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH

