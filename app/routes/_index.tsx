import { redirect } from "react-router";

import { getCurrentUserId } from "../lib/server/infrastructure/auth/session.server";

export async function loader({ request }: { request: Request }) {
  const userId = await getCurrentUserId(request);
  return redirect(userId ? "/home" : "/login");
}