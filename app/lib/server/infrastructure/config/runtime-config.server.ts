export type RuntimeConfig = {
  databaseUrl: string;
  environment: "development" | "test" | "production";
  hostingTarget: "local" | "azure";
};

const DEFAULT_SQLITE_URL = "file:./prisma/dev.db";

export function getRuntimeConfig(): RuntimeConfig {
  const environment = (process.env.NODE_ENV as RuntimeConfig["environment"] | undefined) ?? "development";
  const hostingTarget = process.env.AZURE_CONTAINER_APP_NAME ? "azure" : "local";

  return {
    databaseUrl: process.env.DATABASE_URL ?? DEFAULT_SQLITE_URL,
    environment,
    hostingTarget,
  };
}