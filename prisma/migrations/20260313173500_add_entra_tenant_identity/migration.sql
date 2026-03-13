ALTER TABLE [dbo].[User]
ADD [entraTenantId] NVARCHAR(1000) NOT NULL
    CONSTRAINT [User_entraTenantId_df] DEFAULT 'eecca864-7a91-4b48-9327-e19aa5cc3f35';

ALTER TABLE [dbo].[User]
DROP CONSTRAINT [User_entraObjectId_key];

ALTER TABLE [dbo].[User]
ADD CONSTRAINT [User_entraTenantId_entraObjectId_key] UNIQUE NONCLUSTERED ([entraTenantId], [entraObjectId]);
