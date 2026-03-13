ALTER TABLE [dbo].[User]
DROP CONSTRAINT [User_entraTenantId_entraObjectId_key];

ALTER TABLE [dbo].[User]
ALTER COLUMN [entraTenantId] NVARCHAR(64) NOT NULL;

ALTER TABLE [dbo].[User]
ALTER COLUMN [entraObjectId] NVARCHAR(64) NOT NULL;

ALTER TABLE [dbo].[User]
ADD CONSTRAINT [User_entraTenantId_entraObjectId_key] UNIQUE NONCLUSTERED ([entraTenantId], [entraObjectId]);
