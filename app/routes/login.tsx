import { redirect, useLoaderData } from "react-router";

import { LoginScreen } from "../components/login-screen";
import { createUserSession, getCurrentUserId } from "../lib/server/infrastructure/auth/session.server";
import { getLoginOptions } from "../lib/server/usecase/get-login-options.server";

export async function loader({ request }: { request: Request }) {
  const userId = await getCurrentUserId(request);

  if (userId) {
    return redirect("/home");
  }

  return { users: await getLoginOptions() };
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const userId = formData.get("userId");

  if (typeof userId !== "string" || !userId) {
    throw new Response("User selection is required", { status: 400 });
  }

  return createUserSession(userId);
}

export default function Login() {
  const { users } = useLoaderData<typeof loader>();
  return <LoginScreen users={users} />;
}