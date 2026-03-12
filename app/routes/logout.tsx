import { destroyUserSession } from "../lib/server/infrastructure/auth/session.server";

export async function action({ request }: { request: Request }) {
  return destroyUserSession(request);
}