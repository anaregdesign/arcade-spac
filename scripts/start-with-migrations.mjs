import { spawn } from "node:child_process";

const STARTUP_MIGRATION_DATABASE_URL_ENV_NAME = "STARTUP_MIGRATION_DATABASE_URL";
const AZURE_SQL_RUNTIME_CLIENT_ID_ENV_NAME = "AZURE_SQL_RUNTIME_CLIENT_ID";

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
  const runtimeClientId = process.env[AZURE_SQL_RUNTIME_CLIENT_ID_ENV_NAME];
  if (typeof runtimeClientId === "string" && runtimeClientId.trim().length > 0) {
    serverEnv.AZURE_CLIENT_ID = runtimeClientId.trim();
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
