import { spawn } from "node:child_process";

import { load } from "@azure/app-configuration-provider";
import { ManagedIdentityCredential } from "@azure/identity";

const APP_CONFIGURATION_KEY_PREFIX = "Arcade:";
const STARTUP_MIGRATION_DATABASE_URL_ENV_NAME = "STARTUP_MIGRATION_DATABASE_URL";

function isAzureHosting() {
  return Boolean(process.env.AZURE_CONTAINER_APP_NAME || process.env.AZURE_APP_NAME);
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

  const endpoint = process.env.AZURE_APPCONFIG_ENDPOINT;

  if (!endpoint) {
    throw new Error("AZURE_APPCONFIG_ENDPOINT must be configured for Azure hosting.");
  }

  const credential = new ManagedIdentityCredential();
  const selector = process.env.AZURE_APPCONFIG_LABEL
    ? {
        keyFilter: `${APP_CONFIGURATION_KEY_PREFIX}DATABASE_URL`,
        labelFilter: process.env.AZURE_APPCONFIG_LABEL,
      }
    : {
        keyFilter: `${APP_CONFIGURATION_KEY_PREFIX}DATABASE_URL`,
      };
  const settings = await load(endpoint, credential, {
    keyVaultOptions: {
      credential,
      parallelSecretResolutionEnabled: true,
    },
    selectors: [selector],
    startupOptions: {
      timeoutInMs: 30_000,
    },
    trimKeyPrefixes: [APP_CONFIGURATION_KEY_PREFIX],
  });
  const databaseUrl = settings.get("DATABASE_URL");

  if (typeof databaseUrl !== "string" || databaseUrl.length === 0) {
    throw new Error("DATABASE_URL could not be resolved for startup migration.");
  }

  return {
    source: "Azure App Configuration",
    value: databaseUrl,
  };
}

function describeDatabaseUrlSource(databaseUrl) {
  const [prefix] = databaseUrl.split(";");
  return prefix || "sqlserver://<redacted>";
}

async function main() {
  const databaseUrl = await resolveDatabaseUrl();

  if (databaseUrl) {
    console.log(
      `Resolved startup migration database URL from ${databaseUrl.source} (${describeDatabaseUrlSource(databaseUrl.value)}).`,
    );
    const migrationEnv = {
      ...process.env,
      DATABASE_URL: databaseUrl.value,
    };
    const migrationClientId = process.env.AZURE_SQL_MIGRATION_CLIENT_ID;

    if (migrationClientId) {
      migrationEnv.AZURE_CLIENT_ID = migrationClientId;
    }

    await runCommand(["run", "db:migrate:deploy"], migrationEnv);
  }

  const serverEnv = { ...process.env };
  delete serverEnv.AZURE_CLIENT_ID;
  delete serverEnv[STARTUP_MIGRATION_DATABASE_URL_ENV_NAME];

  await runCommand(["run", "start:server"], serverEnv);
}

main().catch((error) => {
  console.error("Failed to start Arcade runtime.", error);
  process.exit(1);
});
