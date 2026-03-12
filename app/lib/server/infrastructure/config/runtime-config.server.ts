export type RuntimeConfig = {
  databaseUrl: string;
  environment: "development" | "test" | "production";
  hostingTarget: "local" | "azure";
  sessionSecret: string;
};

const DEFAULT_SQLITE_URL = "file:./prisma/dev.db";
const DEFAULT_DEV_SESSION_SECRET = "arcade-local-session-secret";

export function getRuntimeConfig(): RuntimeConfig {
  const environment = (process.env.NODE_ENV as RuntimeConfig["environment"] | undefined) ?? "development";
  const hostingTarget = process.env.AZURE_CONTAINER_APP_NAME ? "azure" : "local";
  const sessionSecret = process.env.ARCADE_SESSION_SECRET ?? DEFAULT_DEV_SESSION_SECRET;

  return {
    databaseUrl: process.env.DATABASE_URL ?? DEFAULT_SQLITE_URL,
    environment,
    hostingTarget,
    sessionSecret,
  };
}