import { load } from "@azure/app-configuration-provider";
import { DefaultAzureCredential, ManagedIdentityCredential, type TokenCredential } from "@azure/identity";

export type RuntimeConfig = {
  authMode: "local" | "entra";
  databaseUrl: string;
  environment: "development" | "test" | "production";
  hostingTarget: "local" | "azure";
  sessionSecret: string;
  publicAppUrl: string | null;
  azureAppConfigurationEndpoint: string | null;
  azureKeyVaultUri: string | null;
  entraTenantId: string | null;
  entraAuthorityTenant: string | null;
  entraClientId: string | null;
  entraClientSecret: string | null;
  entraAuthority: string | null;
};

type RuntimeSettingName =
  | "ARCADE_AUTH_MODE"
  | "ARCADE_SESSION_SECRET"
  | "DATABASE_URL"
  | "ENTRA_AUTHORITY_TENANT"
  | "ENTRA_CLIENT_ID"
  | "ENTRA_CLIENT_SECRET"
  | "ENTRA_TENANT_ID"
  | "PUBLIC_APP_URL";

const APP_CONFIGURATION_KEY_PREFIX = "Arcade:";
const STORE_BACKED_SETTING_NAMES: RuntimeSettingName[] = [
  "ARCADE_AUTH_MODE",
  "ARCADE_SESSION_SECRET",
  "DATABASE_URL",
  "ENTRA_AUTHORITY_TENANT",
  "ENTRA_CLIENT_ID",
  "ENTRA_CLIENT_SECRET",
  "ENTRA_TENANT_ID",
  "PUBLIC_APP_URL",
];
const DEFAULT_DEV_DATABASE_URL = "sqlserver://localhost:1433;database=arcade;user=sa;password=Passw0rd!;encrypt=false;trustServerCertificate=true";
const DEFAULT_DEV_SESSION_SECRET = "arcade-local-session-secret";

function requireAzureSetting(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(`${name} must be configured for Azure hosting.`);
  }

  return value;
}

function getHostingTarget(): RuntimeConfig["hostingTarget"] {
  return process.env.AZURE_CONTAINER_APP_NAME ? "azure" : "local";
}

function selectAzureCredential(hostingTarget: RuntimeConfig["hostingTarget"]): TokenCredential {
  return hostingTarget === "azure"
    ? new ManagedIdentityCredential()
    : new DefaultAzureCredential();
}

async function loadStoreBackedSettings() {
  const azureAppConfigurationEndpoint = process.env.AZURE_APPCONFIG_ENDPOINT ?? null;
  const azureAppConfigurationLabel = process.env.AZURE_APPCONFIG_LABEL ?? null;
  const hostingTarget = getHostingTarget();

  if (!azureAppConfigurationEndpoint) {
    if (hostingTarget === "azure") {
      throw new Error("AZURE_APPCONFIG_ENDPOINT must be configured for Azure hosting.");
    }

    return new Map<RuntimeSettingName, string>();
  }

  try {
    const credential = selectAzureCredential(hostingTarget);
    const settings = await load(azureAppConfigurationEndpoint, credential, {
      keyVaultOptions: {
        credential,
        parallelSecretResolutionEnabled: true,
      },
      selectors: [
        azureAppConfigurationLabel
          ? {
              keyFilter: `${APP_CONFIGURATION_KEY_PREFIX}*`,
              labelFilter: azureAppConfigurationLabel,
            }
          : {
              keyFilter: `${APP_CONFIGURATION_KEY_PREFIX}*`,
            },
      ],
      startupOptions: {
        timeoutInMs: 30_000,
      },
      trimKeyPrefixes: [APP_CONFIGURATION_KEY_PREFIX],
    });
    const resolvedSettings = new Map<RuntimeSettingName, string>();

    for (const settingName of STORE_BACKED_SETTING_NAMES) {
      const settingValue = settings.get<string>(settingName);

      if (typeof settingValue === "string" && settingValue.length > 0) {
        resolvedSettings.set(settingName, settingValue);
      }
    }

    return resolvedSettings;
  } catch (error) {
    if (hostingTarget === "azure") {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to load Arcade runtime config from Azure App Configuration: ${message}`);
    }

    const message = error instanceof Error ? error.message : String(error);
    console.warn(`Falling back to process.env runtime config because Azure App Configuration bootstrap failed: ${message}`);
    return new Map<RuntimeSettingName, string>();
  }
}

function getResolvedSetting(
  settingName: RuntimeSettingName,
  storeBackedSettings: Map<RuntimeSettingName, string>,
  allowEnvironmentFallback: boolean,
) {
  const storeBackedValue = storeBackedSettings.get(settingName);

  if (storeBackedValue) {
    return storeBackedValue;
  }

  if (allowEnvironmentFallback) {
    return process.env[settingName];
  }

  return undefined;
}

async function resolveRuntimeConfig() {
  const environment = (process.env.NODE_ENV as RuntimeConfig["environment"] | undefined) ?? "development";
  const hostingTarget = getHostingTarget();
  const allowEnvironmentFallback = hostingTarget === "local";
  const storeBackedSettings = await loadStoreBackedSettings();
  const requestedAuthModeSetting = getResolvedSetting("ARCADE_AUTH_MODE", storeBackedSettings, allowEnvironmentFallback);
  const requestedAuthMode: RuntimeConfig["authMode"] = requestedAuthModeSetting === "local" || requestedAuthModeSetting === "entra"
    ? requestedAuthModeSetting
    : hostingTarget === "azure"
      ? "entra"
      : "local";
  const sessionSecret = hostingTarget === "azure"
    ? requireAzureSetting("ARCADE_SESSION_SECRET", getResolvedSetting("ARCADE_SESSION_SECRET", storeBackedSettings, false))
    : getResolvedSetting("ARCADE_SESSION_SECRET", storeBackedSettings, true) ?? DEFAULT_DEV_SESSION_SECRET;
  const databaseUrl = hostingTarget === "azure"
    ? requireAzureSetting("DATABASE_URL", getResolvedSetting("DATABASE_URL", storeBackedSettings, false))
    : getResolvedSetting("DATABASE_URL", storeBackedSettings, true) ?? DEFAULT_DEV_DATABASE_URL;
  const publicAppUrl = getResolvedSetting("PUBLIC_APP_URL", storeBackedSettings, allowEnvironmentFallback) ?? null;
  const entraTenantId = getResolvedSetting("ENTRA_TENANT_ID", storeBackedSettings, allowEnvironmentFallback) ?? process.env.AZURE_TENANT_ID ?? null;
  const entraAuthorityTenant = getResolvedSetting("ENTRA_AUTHORITY_TENANT", storeBackedSettings, allowEnvironmentFallback) ?? entraTenantId;
  const entraClientId = getResolvedSetting("ENTRA_CLIENT_ID", storeBackedSettings, allowEnvironmentFallback) ?? null;
  const entraClientSecret = getResolvedSetting("ENTRA_CLIENT_SECRET", storeBackedSettings, allowEnvironmentFallback) ?? null;
  const azureAppConfigurationEndpoint = process.env.AZURE_APPCONFIG_ENDPOINT ?? null;
  const azureKeyVaultUri = process.env.AZURE_KEY_VAULT_URI ?? null;

  if (hostingTarget === "azure") {
    requireAzureSetting("AZURE_APPCONFIG_ENDPOINT", azureAppConfigurationEndpoint ?? undefined);
    requireAzureSetting("AZURE_KEY_VAULT_URI", azureKeyVaultUri ?? undefined);
  }

  if (requestedAuthMode === "entra") {
    requireAzureSetting("PUBLIC_APP_URL", publicAppUrl ?? undefined);
    requireAzureSetting("ENTRA_TENANT_ID", entraTenantId ?? undefined);
    requireAzureSetting("ENTRA_CLIENT_ID", entraClientId ?? undefined);
    requireAzureSetting("ENTRA_CLIENT_SECRET", entraClientSecret ?? undefined);
  }

  return {
    authMode: requestedAuthMode,
    databaseUrl,
    environment,
    hostingTarget,
    sessionSecret,
    publicAppUrl,
    azureAppConfigurationEndpoint,
    azureKeyVaultUri,
    entraTenantId,
    entraAuthorityTenant,
    entraClientId,
    entraClientSecret,
    entraAuthority: entraAuthorityTenant ? `https://login.microsoftonline.com/${entraAuthorityTenant}/v2.0` : null,
  };
}

const runtimeConfig = await resolveRuntimeConfig();

export function getRuntimeConfig(): RuntimeConfig {
  return runtimeConfig;
}
