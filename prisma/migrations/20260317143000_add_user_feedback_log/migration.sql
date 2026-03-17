CREATE TABLE [UserFeedbackLog] (
  [id] NVARCHAR(1000) NOT NULL,
  [userId] NVARCHAR(1000) NOT NULL,
  [gameId] NVARCHAR(1000) NOT NULL,
  [eventType] NVARCHAR(1000) NOT NULL,
  [reward] INT NOT NULL,
  [contextKey] NVARCHAR(1000) NOT NULL CONSTRAINT [UserFeedbackLog_contextKey_df] DEFAULT 'global',
  [loggedAt] DATETIME2 NOT NULL CONSTRAINT [UserFeedbackLog_loggedAt_df] DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT [UserFeedbackLog_pkey] PRIMARY KEY CLUSTERED ([id])
);

CREATE NONCLUSTERED INDEX [UserFeedbackLog_loggedAt_idx] ON [UserFeedbackLog]([loggedAt] DESC);
CREATE NONCLUSTERED INDEX [UserFeedbackLog_gameId_loggedAt_idx] ON [UserFeedbackLog]([gameId], [loggedAt] DESC);
CREATE NONCLUSTERED INDEX [UserFeedbackLog_userId_loggedAt_idx] ON [UserFeedbackLog]([userId], [loggedAt] DESC);

ALTER TABLE [UserFeedbackLog]
ADD CONSTRAINT [UserFeedbackLog_userId_fkey]
FOREIGN KEY ([userId]) REFERENCES [User]([id]) ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE [UserFeedbackLog]
ADD CONSTRAINT [UserFeedbackLog_gameId_fkey]
FOREIGN KEY ([gameId]) REFERENCES [Game]([id]) ON DELETE CASCADE ON UPDATE CASCADE;
