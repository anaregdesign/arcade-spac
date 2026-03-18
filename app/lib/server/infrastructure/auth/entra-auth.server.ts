import { createHash, randomBytes } from "node:crypto";

import { createRemoteJWKSet, decodeJwt, jwtVerify } from "jose";

import { buildEntraOpenIdConfiguration, type OpenIdConfiguration } from "./entra-openid";
import { getRuntimeConfig } from "../config/runtime-config.server";

type EntraIdentity = {
  avatarUrl: string | null;
  displayName: string;
  entraObjectId: string;
  entraTenantId: string;
};

function encodeBase64Url(buffer: Buffer) {
  return buffer.toString("base64url");
}

function createRandomToken() {
  return encodeBase64Url(randomBytes(32));
}

function createPkceChallenge(codeVerifier: string) {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}

function usesSharedTenantAuthority(authorityTenant: string | null) {
  return authorityTenant === "organizations" || authorityTenant === "common";
}

function getExpectedIssuer(input: {
  authorityTenant: string | null;
  idToken: string;
  metadataIssuer: string;
}) {
  if (!usesSharedTenantAuthority(input.authorityTenant)) {
    return {
      issuer: input.metadataIssuer,
      tenantId: null,
    };
  }

  const decoded = decodeJwt(input.idToken);
  const tenantId = typeof decoded.tid === "string" ? decoded.tid : null;

  if (!tenantId) {
    throw new Error("Entra identity token did not include a tenant identifier.");
  }

  return {
    issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
    tenantId,
  };
}

async function getOpenIdConfiguration() {
  const runtimeConfig = getRuntimeConfig();

  if (runtimeConfig.authMode !== "entra" || !runtimeConfig.entraAuthorityTenant) {
    throw new Error("Microsoft Entra ID authentication is not enabled.");
  }

  return buildEntraOpenIdConfiguration(runtimeConfig.entraAuthorityTenant);
}

export function isEntraAuthEnabled() {
  return getRuntimeConfig().authMode === "entra";
}

export function getEntraAuthStartHref(returnTo: string | null) {
  const params = new URLSearchParams();

  if (returnTo) {
    params.set("returnTo", returnTo);
  }

  const search = params.toString();
  return search ? `/auth/start?${search}` : "/auth/start";
}

export async function buildEntraAuthorizationRequest(returnTo: string) {
  const runtimeConfig = getRuntimeConfig();
  const metadata = await getOpenIdConfiguration();
  const state = createRandomToken();
  const nonce = createRandomToken();
  const codeVerifier = createRandomToken();
  const redirectUri = new URL("/auth/callback", runtimeConfig.publicAppUrl!).toString();
  const authorizationUrl = new URL(metadata.authorization_endpoint);

  authorizationUrl.searchParams.set("client_id", runtimeConfig.entraClientId!);
  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("response_mode", "query");
  authorizationUrl.searchParams.set("scope", "openid profile email offline_access");
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("nonce", nonce);
  authorizationUrl.searchParams.set("code_challenge", createPkceChallenge(codeVerifier));
  authorizationUrl.searchParams.set("code_challenge_method", "S256");

  return {
    authorizationUrl: authorizationUrl.toString(),
    codeVerifier,
    nonce,
    returnTo,
    state,
  };
}

export async function exchangeCodeForEntraIdentity(input: {
  code: string;
  codeVerifier: string;
  nonce: string;
}) {
  const runtimeConfig = getRuntimeConfig();
  const metadata = await getOpenIdConfiguration();
  const redirectUri = new URL("/auth/callback", runtimeConfig.publicAppUrl!).toString();
  const tokenResponse = await fetch(metadata.token_endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: runtimeConfig.entraClientId!,
      client_secret: runtimeConfig.entraClientSecret!,
      code: input.code,
      code_verifier: input.codeVerifier,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenResponse.ok) {
    const errorPayload = await tokenResponse.text();
    throw new Error(`Failed to exchange Entra authorization code: ${tokenResponse.status} ${errorPayload}`);
  }

  const tokenPayload = await tokenResponse.json() as { id_token?: string };

  if (!tokenPayload.id_token) {
    throw new Error("Entra token response did not include an id_token.");
  }

  const expectedIssuer = getExpectedIssuer({
    authorityTenant: runtimeConfig.entraAuthorityTenant,
    idToken: tokenPayload.id_token,
    metadataIssuer: metadata.issuer,
  });
  const jwks = createRemoteJWKSet(new URL(metadata.jwks_uri));
  const verified = await jwtVerify(tokenPayload.id_token, jwks, {
    audience: runtimeConfig.entraClientId!,
    issuer: expectedIssuer.issuer,
  });

  if (verified.payload.nonce !== input.nonce) {
    throw new Error("Entra identity token nonce did not match the pending login flow.");
  }

  const entraObjectId = typeof verified.payload.oid === "string"
    ? verified.payload.oid
    : typeof verified.payload.sub === "string"
      ? verified.payload.sub
      : null;

  if (!entraObjectId) {
    throw new Error("Entra identity token did not include a stable object identifier.");
  }

  const entraTenantId = typeof verified.payload.tid === "string"
    ? verified.payload.tid
    : expectedIssuer.tenantId;

  if (!entraTenantId) {
    throw new Error("Entra identity token did not include a tenant identifier.");
  }

  return {
    avatarUrl: null,
    displayName: typeof verified.payload.name === "string"
      ? verified.payload.name
      : typeof verified.payload.preferred_username === "string"
        ? verified.payload.preferred_username
        : "Arcade Player",
    entraObjectId,
    entraTenantId,
  } satisfies EntraIdentity;
}
