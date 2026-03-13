ALTER TABLE [UserProfile]
ADD [themePreference] NVARCHAR(1000) NOT NULL CONSTRAINT [UserProfile_themePreference_df] DEFAULT 'LIGHT';

ALTER TABLE [PlayResult]
ADD [shareToken] NVARCHAR(1000);

CREATE INDEX [PlayResult_shareToken_idx] ON [PlayResult]([shareToken]);
