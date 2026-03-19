import { spawn } from "node:child_process";

export const STARTUP_MIGRATION_DATABASE_URL_ENV_NAME = "STARTUP_MIGRATION_DATABASE_URL";
export const AZURE_SQL_RUNTIME_CLIENT_ID_ENV_NAME = "AZURE_SQL_RUNTIME_CLIENT_ID";
export const AZURE_SQL_MIGRATION_CLIENT_ID_ENV_NAME = "AZURE_SQL_MIGRATION_CLIENT_ID";
export const MANAGED_IDENTITY_ENDPOINT_ENV_NAME = "IDENTITY_ENDPOINT";
export const MANAGED_IDENTITY_HEADER_ENV_NAME = "IDENTITY_HEADER";

export function isAzureHosting(env = process.env) {
  return Boolean(env.AZURE_APP_NAME);
}

function npmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

export function splitConnectionStringParts(databaseUrl) {
  return databaseUrl
    .split(";")
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

function findAuthenticationMode(databaseUrl) {
  const authenticationPart = splitConnectionStringParts(databaseUrl)
    .find((part) => part.toLowerCase().startsWith("authentication="));

  if (!authenticationPart) {
    return null;
  }

  const [, value = ""] = authenticationPart.split(/=(.+)/, 2);
  return value.trim().toLowerCase();
}

function braceEscapeConnectionStringValue(value) {
  return `{${value.trim().replaceAll("}", "}}")}}`;
}

export function rewriteDatabaseUrlForManagedIdentity(databaseUrl, clientId, env = process.env) {
  const identityEndpoint = env[MANAGED_IDENTITY_ENDPOINT_ENV_NAME];
  const identityHeader = env[MANAGED_IDENTITY_HEADER_ENV_NAME];
  const authenticationMode = findAuthenticationMode(databaseUrl);

  if (
    typeof clientId !== "string"
    || clientId.trim().length === 0
    || typeof identityEndpoint !== "string"
    || identityEndpoint.trim().length === 0
    || typeof identityHeader !== "string"
    || identityHeader.trim().length === 0
    || authenticationMode !== "defaultazurecredential"
  ) {
    return databaseUrl;
  }

  const rewrittenParts = splitConnectionStringParts(databaseUrl)
    .filter((part) => {
      const [rawKey = ""] = part.split("=", 1);
      const key = rawKey.trim().toLowerCase();
      return key !== "authentication" && key !== "clientid" && key !== "msiendpoint" && key !== "msisecret";
    });

  rewrittenParts.push("authentication=ActiveDirectoryManagedIdentity");
  rewrittenParts.push(`clientId=${clientId.trim()}`);
  rewrittenParts.push(`msiEndpoint=${braceEscapeConnectionStringValue(identityEndpoint)}`);
  rewrittenParts.push(`msiSecret=${braceEscapeConnectionStringValue(identityHeader)}`);

  return rewrittenParts.join(";");
}

export function buildManagedIdentityPrismaEnv(baseEnv, clientId, databaseUrl = baseEnv.DATABASE_URL) {
  const nextEnv = { ...baseEnv };

  if (typeof clientId === "string" && clientId.trim().length > 0) {
    nextEnv.AZURE_CLIENT_ID = clientId.trim();
  } else {
    delete nextEnv.AZURE_CLIENT_ID;
  }

  if (typeof databaseUrl === "string" && databaseUrl.trim().length > 0) {
    nextEnv.DATABASE_URL = rewriteDatabaseUrlForManagedIdentity(databaseUrl.trim(), clientId, nextEnv);
  }

  return nextEnv;
}

export function resolveMigrationDatabaseUrl(env = process.env) {
  if (
    typeof env[STARTUP_MIGRATION_DATABASE_URL_ENV_NAME] === "string"
    && env[STARTUP_MIGRATION_DATABASE_URL_ENV_NAME].trim().length > 0
  ) {
    return {
      source: STARTUP_MIGRATION_DATABASE_URL_ENV_NAME,
      value: env[STARTUP_MIGRATION_DATABASE_URL_ENV_NAME].trim(),
    };
  }

  if (typeof env.DATABASE_URL === "string" && env.DATABASE_URL.trim().length > 0) {
    return {
      source: "DATABASE_URL",
      value: env.DATABASE_URL.trim(),
    };
  }

  if (!isAzureHosting(env)) {
    return null;
  }

  throw new Error("STARTUP_MIGRATION_DATABASE_URL or DATABASE_URL must be configured for Azure-hosted Prisma migration.");
}

export function describeDatabaseUrlSource(databaseUrl) {
  const [prefix] = databaseUrl.split(";");
  return prefix || "sqlserver://<redacted>";
}

export function runNpmCommand(args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(npmCommand(), args, {
      env,
      stdio: "inherit",
    });

    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`Command ${args.join(" ")} failed with code ${code ?? "null"} and signal ${signal ?? "null"}.`));
    });
  });
}
