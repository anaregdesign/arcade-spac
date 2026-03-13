import { redirect, useLoaderData } from "react-router";

import { LoginScreen } from "../components/login-screen";
import { isEntraAuthEnabled, getEntraAuthStartHref } from "../lib/server/infrastructure/auth/entra-auth.server";
import { createUserSession, getCurrentUserId, sanitizeReturnToPath } from "../lib/server/infrastructure/auth/session.server";
import { getLoginOptions } from "../lib/server/usecase/get-login-options.server";

function getLoginErrorMessage(errorCode: string | null) {
  switch (errorCode) {
    case "session_expired_result_save":
      return "Your session ended while Arcade was saving a clear. Sign in again to recover the pending result and retry publishing it.";
    case "auth_state_mismatch":
      return "Sign-in state could not be verified. Start the Microsoft Entra sign-in flow again.";
    case "entra_access_denied":
      return "Microsoft Entra sign-in was canceled or denied before Arcade could finish the callback.";
    case "entra_exchange_failed":
      return "Arcade could not finish the Microsoft Entra callback. Retry sign-in, and if it repeats, check the app registration and callback URL.";
    default:
      return null;
  }
}

export async function loader({ request }: { request: Request }) {
  const url = new URL(request.url);
  const returnTo = sanitizeReturnToPath(url.searchParams.get("returnTo")) ?? "/home";
  const errorMessage = getLoginErrorMessage(url.searchParams.get("error"));
  const userId = await getCurrentUserId(request);

  if (userId) {
    return redirect(returnTo);
  }

  const authMode: "local" | "entra" = isEntraAuthEnabled() ? "entra" : "local";

  return {
    authMode,
    errorMessage,
    entraSignInHref: authMode === "entra" ? getEntraAuthStartHref(returnTo) : null,
    returnTo,
    users: authMode === "local" ? await getLoginOptions() : [],
  };
}

export async function action({ request }: { request: Request }) {
  if (isEntraAuthEnabled()) {
    throw redirect(getEntraAuthStartHref("/home"));
  }

  const formData = await request.formData();
  const userId = formData.get("userId");
  const redirectTo = formData.get("redirectTo");

  if (typeof userId !== "string" || !userId) {
    throw new Response("User selection is required", { status: 400 });
  }

  return createUserSession(request, userId, sanitizeReturnToPath(typeof redirectTo === "string" ? redirectTo : null) ?? "/home");
}

export default function Login() {
  const data = useLoaderData<typeof loader>();
  return <LoginScreen {...data} />;
}
