export type OpenIdConfiguration = {
  authorization_endpoint: string;
  issuer: string;
  jwks_uri: string;
  token_endpoint: string;
};

export function buildEntraOpenIdConfiguration(authorityTenant: string): OpenIdConfiguration {
  if (!authorityTenant.trim()) {
    throw new Error("Microsoft Entra authority tenant is required.");
  }

  const authorityRoot = new URL(`https://login.microsoftonline.com/${authorityTenant}/`);

  return {
    authorization_endpoint: new URL("oauth2/v2.0/authorize", authorityRoot).toString(),
    issuer: new URL("v2.0", authorityRoot).toString().replace(/\/$/, ""),
    jwks_uri: new URL("discovery/v2.0/keys", authorityRoot).toString(),
    token_endpoint: new URL("oauth2/v2.0/token", authorityRoot).toString(),
  };
}
