import { redirect } from "react-router";

import { exchangeCodeForEntraIdentity, isEntraAuthEnabled } from "../lib/server/infrastructure/auth/entra-auth.server";
import { getOrCreateUserFromEntraIdentity } from "../lib/server/infrastructure/repositories/auth-user.repository.server";
import { clearPendingAuthFlow, commitSession, getPendingAuthFlow, getSession, setCurrentUserId } from "../lib/server/infrastructure/auth/session.server";

export async function loader({ request }: { request: Request }) {
  if (!isEntraAuthEnabled()) {
    return redirect("/login");
  }

  const url = new URL(request.url);
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");
  const providerError = url.searchParams.get("error");
  const session = await getSession(request);
  const pendingAuthFlow = getPendingAuthFlow(session);
  const returnTo = pendingAuthFlow?.returnTo ?? "/home";

  if (providerError) {
    clearPendingAuthFlow(session);
    return redirect(`/login?${new URLSearchParams({ error: "entra_access_denied", returnTo }).toString()}`, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  if (!pendingAuthFlow || !state || !code || pendingAuthFlow.state !== state) {
    clearPendingAuthFlow(session);
    return redirect(`/login?${new URLSearchParams({ error: "auth_state_mismatch", returnTo }).toString()}`, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  let entraIdentity;

  try {
    entraIdentity = await exchangeCodeForEntraIdentity({
      code,
      codeVerifier: pendingAuthFlow.codeVerifier,
      nonce: pendingAuthFlow.nonce,
    });
  } catch (error) {
    console.error("Failed to exchange Microsoft Entra authorization code.", {
      error: error instanceof Error ? error.message : String(error),
      returnTo,
      state,
    });
    clearPendingAuthFlow(session);
    return redirect(`/login?${new URLSearchParams({ error: "entra_token_exchange_failed", returnTo }).toString()}`, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

  try {
    const user = await getOrCreateUserFromEntraIdentity(entraIdentity);

    clearPendingAuthFlow(session);
    setCurrentUserId(session, user.id);

    return redirect(pendingAuthFlow.returnTo, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch (error) {
    console.error("Failed to synchronize Microsoft Entra identity into Arcade user state.", {
      displayName: entraIdentity.displayName,
      entraObjectId: entraIdentity.entraObjectId,
      entraTenantId: entraIdentity.entraTenantId,
      error: error instanceof Error ? error.message : String(error),
      returnTo,
    });
    clearPendingAuthFlow(session);
    return redirect(`/login?${new URLSearchParams({ error: "auth_user_sync_failed", returnTo }).toString()}`, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
}
