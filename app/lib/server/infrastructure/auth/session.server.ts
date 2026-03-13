import { createCookieSessionStorage, redirect } from "react-router";

import { getRuntimeConfig } from "../config/runtime-config.server";

const runtimeConfig = getRuntimeConfig();

const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "arcade_session",
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secrets: [runtimeConfig.sessionSecret],
    secure: runtimeConfig.environment === "production",
  },
});

const USER_ID_KEY = "userId";
const AUTH_STATE_KEY = "authState";
const AUTH_NONCE_KEY = "authNonce";
const AUTH_CODE_VERIFIER_KEY = "authCodeVerifier";
const AUTH_RETURN_TO_KEY = "authReturnTo";
const PENDING_RESULT_KEY = "pendingResult";

export function sanitizeReturnToPath(returnTo: string | null | undefined) {
  if (!returnTo || !returnTo.startsWith("/") || returnTo.startsWith("//")) {
    return null;
  }

  return returnTo;
}

export type PendingAuthFlow = {
  state: string;
  nonce: string;
  codeVerifier: string;
  returnTo: string;
};

export type PendingResultDraft = {
  id: string;
  actualMetrics: {
    hintCount?: number;
    mistakeCount?: number;
    primaryMetric: number;
  };
  difficulty: "EASY" | "NORMAL" | "HARD" | "EXPERT";
  gameKey: string;
  outcome: "clean" | "steady";
  ownerUserId: string | null;
  recoveryReason: "save_failed" | "session_expired";
};

export async function getSession(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  return sessionStorage.getSession(cookieHeader);
}

export async function getCurrentUserId(request: Request) {
  const session = await getSession(request);
  return session.get(USER_ID_KEY) as string | undefined;
}

export async function requireCurrentUserId(request: Request) {
  const userId = await getCurrentUserId(request);

  if (!userId) {
    const requestUrl = new URL(request.url);
    const returnTo = sanitizeReturnToPath(`${requestUrl.pathname}${requestUrl.search}`) ?? "/home";
    throw redirect(`/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  return userId;
}

export async function commitSession(session: Awaited<ReturnType<typeof getSession>>) {
  return sessionStorage.commitSession(session);
}

export function setCurrentUserId(session: Awaited<ReturnType<typeof getSession>>, userId: string) {
  session.set(USER_ID_KEY, userId);
}

export function setPendingAuthFlow(session: Awaited<ReturnType<typeof getSession>>, pendingAuthFlow: PendingAuthFlow) {
  session.set(AUTH_STATE_KEY, pendingAuthFlow.state);
  session.set(AUTH_NONCE_KEY, pendingAuthFlow.nonce);
  session.set(AUTH_CODE_VERIFIER_KEY, pendingAuthFlow.codeVerifier);
  session.set(AUTH_RETURN_TO_KEY, pendingAuthFlow.returnTo);
}

export function getPendingAuthFlow(session: Awaited<ReturnType<typeof getSession>>): PendingAuthFlow | null {
  const state = session.get(AUTH_STATE_KEY);
  const nonce = session.get(AUTH_NONCE_KEY);
  const codeVerifier = session.get(AUTH_CODE_VERIFIER_KEY);
  const returnTo = session.get(AUTH_RETURN_TO_KEY);

  if (
    typeof state !== "string"
    || typeof nonce !== "string"
    || typeof codeVerifier !== "string"
    || typeof returnTo !== "string"
  ) {
    return null;
  }

  return { state, nonce, codeVerifier, returnTo };
}

export function clearPendingAuthFlow(session: Awaited<ReturnType<typeof getSession>>) {
  session.unset(AUTH_STATE_KEY);
  session.unset(AUTH_NONCE_KEY);
  session.unset(AUTH_CODE_VERIFIER_KEY);
  session.unset(AUTH_RETURN_TO_KEY);
}

export function getPendingResultDraft(session: Awaited<ReturnType<typeof getSession>>): PendingResultDraft | null {
  const draft = session.get(PENDING_RESULT_KEY);

  if (!draft || typeof draft !== "object") {
    return null;
  }

  const candidate = draft as Partial<PendingResultDraft>;
  const actualMetrics = candidate.actualMetrics;

  if (
    typeof candidate.id !== "string"
    || typeof candidate.gameKey !== "string"
    || (candidate.difficulty !== "EASY" && candidate.difficulty !== "NORMAL" && candidate.difficulty !== "HARD" && candidate.difficulty !== "EXPERT")
    || (candidate.outcome !== "clean" && candidate.outcome !== "steady")
    || (candidate.ownerUserId !== null && typeof candidate.ownerUserId !== "string" && candidate.ownerUserId !== undefined)
    || (candidate.recoveryReason !== "save_failed" && candidate.recoveryReason !== "session_expired")
    || !actualMetrics
    || typeof actualMetrics !== "object"
    || typeof actualMetrics.primaryMetric !== "number"
  ) {
    return null;
  }

  return {
    id: candidate.id,
    actualMetrics: {
      primaryMetric: actualMetrics.primaryMetric,
      hintCount: typeof actualMetrics.hintCount === "number" ? actualMetrics.hintCount : undefined,
      mistakeCount: typeof actualMetrics.mistakeCount === "number" ? actualMetrics.mistakeCount : undefined,
    },
    difficulty: candidate.difficulty,
    gameKey: candidate.gameKey,
    outcome: candidate.outcome,
    ownerUserId: candidate.ownerUserId ?? null,
    recoveryReason: candidate.recoveryReason,
  };
}

export function setPendingResultDraft(session: Awaited<ReturnType<typeof getSession>>, draft: PendingResultDraft) {
  session.set(PENDING_RESULT_KEY, draft);
}

export function clearPendingResultDraft(session: Awaited<ReturnType<typeof getSession>>) {
  session.unset(PENDING_RESULT_KEY);
}

export async function createUserSession(request: Request, userId: string, redirectTo = "/home") {
  const session = await getSession(request);
  setCurrentUserId(session, userId);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export async function destroyUserSession(request: Request) {
  const session = await getSession(request);

  return redirect("/login", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
