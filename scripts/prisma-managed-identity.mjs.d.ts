export const STARTUP_MIGRATION_DATABASE_URL_ENV_NAME: string;
export const AZURE_SQL_RUNTIME_CLIENT_ID_ENV_NAME: string;
export const AZURE_SQL_MIGRATION_CLIENT_ID_ENV_NAME: string;
export const MANAGED_IDENTITY_ENDPOINT_ENV_NAME: string;
export const MANAGED_IDENTITY_HEADER_ENV_NAME: string;

export function isAzureHosting(env?: NodeJS.ProcessEnv): boolean;
export function splitConnectionStringParts(databaseUrl: string): string[];
export function rewriteDatabaseUrlForManagedIdentity(
  databaseUrl: string,
  clientId?: string,
  env?: NodeJS.ProcessEnv,
): string;
export function buildManagedIdentityPrismaEnv(
  baseEnv: NodeJS.ProcessEnv,
  clientId?: string,
  databaseUrl?: string,
): NodeJS.ProcessEnv;
export function resolveMigrationDatabaseUrl(
  env?: NodeJS.ProcessEnv,
): { source: string; value: string } | null;
export function describeDatabaseUrlSource(databaseUrl: string): string;
export function runNpmCommand(args: string[], env: NodeJS.ProcessEnv): Promise<void>;
