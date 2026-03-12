import { createHash, randomBytes } from "node:crypto";

import { createRemoteJWKSet, jwtVerify } from "jose";

import { getRuntimeConfig } from "../config/runtime-config.server";

type OpenIdConfiguration = {
  authorization_endpoint: string;
  issuer: string;
  jwks_uri: string;
  token_endpoint: string;
};

type EntraIdentity = {
  avatarUrl: string | null;
  displayName: string;
  entraObjectId: string;
};

const metadataCache = new Map<string, Promise<OpenIdConfiguration>>();

function encodeBase64Url(buffer: Buffer) {
  return buffer.toString("base64url");
}

function createRandomToken() {
  return encodeBase64Url(randomBytes(32));
}

function createPkceChallenge(codeVerifier: string) {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}

async function getOpenIdConfiguration() {
  const runtimeConfig = getRuntimeConfig();

  if (runtimeConfig.authMode !== "entra" || !runtimeConfig.entraAuthority) {
    throw new Error("Microsoft Entra ID authentication is not enabled.");
  }

  if (!metadataCache.has(runtimeConfig.entraAuthority)) {
    metadataCache.set(runtimeConfig.entraAuthority, (async () => {
      const response = await fetch(`${runtimeConfig.entraAuthority}/.well-known/openid-configuration`);

      if (!response.ok) {
        throw new Error(`Failed to load Entra OpenID configuration: ${response.status}`);
      }

      return response.json() as Promise<OpenIdConfiguration>;
    })());
  }

  return metadataCache.get(runtimeConfig.entraAuthority)!;
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
    throw new Error(`Failed to exchange Entra authorization code: ${tokenResponse.status}`);
  }

  const tokenPayload = await tokenResponse.json() as { id_token?: string };

  if (!tokenPayload.id_token) {
    throw new Error("Entra token response did not include an id_token.");
  }

  const jwks = createRemoteJWKSet(new URL(metadata.jwks_uri));
  const verified = await jwtVerify(tokenPayload.id_token, jwks, {
    audience: runtimeConfig.entraClientId!,
    issuer: metadata.issuer,
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

  return {
    avatarUrl: null,
    displayName: typeof verified.payload.name === "string"
      ? verified.payload.name
      : typeof verified.payload.preferred_username === "string"
        ? verified.payload.preferred_username
        : "Arcade Player",
    entraObjectId,
  } satisfies EntraIdentity;
}