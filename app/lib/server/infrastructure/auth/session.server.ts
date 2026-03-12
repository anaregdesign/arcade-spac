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
    throw redirect("/login");
  }

  return userId;
}

export async function createUserSession(userId: string, redirectTo = "/home") {
  const session = await sessionStorage.getSession();
  session.set(USER_ID_KEY, userId);

  return redirect(redirectTo, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
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