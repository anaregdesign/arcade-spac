import { spawn } from "node:child_process";

const STARTUP_MIGRATION_DATABASE_URL_ENV_NAME = "STARTUP_MIGRATION_DATABASE_URL";
const AZURE_SQL_RUNTIME_CLIENT_ID_ENV_NAME = "AZURE_SQL_RUNTIME_CLIENT_ID";
const AZURE_SQL_MIGRATION_CLIENT_ID_ENV_NAME = "AZURE_SQL_MIGRATION_CLIENT_ID";
const MANAGED_IDENTITY_ENDPOINT_ENV_NAME = "IDENTITY_ENDPOINT";
const MANAGED_IDENTITY_HEADER_ENV_NAME = "IDENTITY_HEADER";

function isAzureHosting() {
  return Boolean(process.env.AZURE_APP_NAME);
}

function npmCommand() {
  return process.platform === "win32" ? "npm.cmd" : "npm";
}

function runCommand(args, env) {
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

async function resolveDatabaseUrl() {
  if (
    typeof process.env[STARTUP_MIGRATION_DATABASE_URL_ENV_NAME] === "string"
    && process.env[STARTUP_MIGRATION_DATABASE_URL_ENV_NAME].trim().length > 0
  ) {
    return {
      source: STARTUP_MIGRATION_DATABASE_URL_ENV_NAME,
      value: process.env[STARTUP_MIGRATION_DATABASE_URL_ENV_NAME].trim(),
    };
  }

  if (typeof process.env.DATABASE_URL === "string" && process.env.DATABASE_URL.trim().length > 0) {
    return {
      source: "DATABASE_URL",
      value: process.env.DATABASE_URL.trim(),
    };
  }

  if (!isAzureHosting()) {
    return null;
  }

  throw new Error("STARTUP_MIGRATION_DATABASE_URL or DATABASE_URL must be configured for Azure hosting startup migration.");
}

function describeDatabaseUrlSource(databaseUrl) {
  const [prefix] = databaseUrl.split(";");
  return prefix || "sqlserver://<redacted>";
}

function splitConnectionStringParts(databaseUrl) {
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

async function main() {
  const databaseUrl = await resolveDatabaseUrl();

  if (databaseUrl) {
    const migrationClientId = process.env[AZURE_SQL_MIGRATION_CLIENT_ID_ENV_NAME];
    const migrationDatabaseUrl = rewriteDatabaseUrlForManagedIdentity(databaseUrl.value, migrationClientId);
    console.log(
      `Resolved startup migration database URL from ${databaseUrl.source} (${describeDatabaseUrlSource(databaseUrl.value)}).`,
    );
    const migrationEnv = {
      ...process.env,
      DATABASE_URL: migrationDatabaseUrl,
    };

    if (migrationClientId) {
      migrationEnv.AZURE_CLIENT_ID = migrationClientId;
      if (migrationDatabaseUrl !== databaseUrl.value) {
        console.log(`Using ActiveDirectoryManagedIdentity Prisma auth for startup migration with client ID ${migrationClientId}.`);
      }
    }

    await runCommand(["run", "db:migrate:deploy"], migrationEnv);
  }

  const serverEnv = { ...process.env };
  const runtimeClientId = process.env[AZURE_SQL_RUNTIME_CLIENT_ID_ENV_NAME];
  if (typeof runtimeClientId === "string" && runtimeClientId.trim().length > 0) {
    serverEnv.AZURE_CLIENT_ID = runtimeClientId.trim();
    if (typeof serverEnv.DATABASE_URL === "string" && serverEnv.DATABASE_URL.trim().length > 0) {
      const runtimeDatabaseUrl = rewriteDatabaseUrlForManagedIdentity(serverEnv.DATABASE_URL, runtimeClientId, serverEnv);
      if (runtimeDatabaseUrl !== serverEnv.DATABASE_URL) {
        console.log(`Using ActiveDirectoryManagedIdentity Prisma auth for server runtime with client ID ${runtimeClientId.trim()}.`);
      }
      serverEnv.DATABASE_URL = runtimeDatabaseUrl;
    }
  } else {
    delete serverEnv.AZURE_CLIENT_ID;
  }
  delete serverEnv[STARTUP_MIGRATION_DATABASE_URL_ENV_NAME];

  await runCommand(["run", "start:server"], serverEnv);
}

main().catch((error) => {
  console.error("Failed to start Arcade runtime.", error);
  process.exit(1);
});
