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

  try {
    const entraIdentity = await exchangeCodeForEntraIdentity({
      code,
      codeVerifier: pendingAuthFlow.codeVerifier,
      nonce: pendingAuthFlow.nonce,
    });
    const user = await getOrCreateUserFromEntraIdentity(entraIdentity);

    clearPendingAuthFlow(session);
    setCurrentUserId(session, user.id);

    return redirect(pendingAuthFlow.returnTo, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  } catch {
    clearPendingAuthFlow(session);
    return redirect(`/login?${new URLSearchParams({ error: "entra_exchange_failed", returnTo }).toString()}`, {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }
}
