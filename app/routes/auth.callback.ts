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
  const session = await getSession(request);
  const pendingAuthFlow = getPendingAuthFlow(session);

  if (!pendingAuthFlow || !state || !code || pendingAuthFlow.state !== state) {
    clearPendingAuthFlow(session);

    return redirect("/login", {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    });
  }

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
}