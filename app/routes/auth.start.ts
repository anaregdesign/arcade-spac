import { redirect } from "react-router";

import { buildEntraAuthorizationRequest, isEntraAuthEnabled } from "../lib/server/infrastructure/auth/entra-auth.server";
import { commitSession, getSession, sanitizeReturnToPath, setPendingAuthFlow } from "../lib/server/infrastructure/auth/session.server";

export async function loader({ request }: { request: Request }) {
  if (!isEntraAuthEnabled()) {
    return redirect("/login");
  }

  const url = new URL(request.url);
  const returnTo = sanitizeReturnToPath(url.searchParams.get("returnTo")) ?? "/home";
  const authorizationRequest = await buildEntraAuthorizationRequest(returnTo);
  const session = await getSession(request);

  setPendingAuthFlow(session, {
    codeVerifier: authorizationRequest.codeVerifier,
    nonce: authorizationRequest.nonce,
    returnTo: authorizationRequest.returnTo,
    state: authorizationRequest.state,
  });

  return redirect(authorizationRequest.authorizationUrl, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}