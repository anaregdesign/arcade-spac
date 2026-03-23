import { redirect } from "react-router";

import { normalizeArcadeLocaleSelection } from "../lib/domain/entities/locale";
import { getCurrentUserId } from "../lib/server/infrastructure/auth/session.server";
import { sanitizeReturnToPath } from "../lib/server/infrastructure/auth/session.server";
import { serializeLocalePreference } from "../lib/server/infrastructure/locale/locale-preference.server";

export async function loader({ request }: { request: Request }) {
  const userId = await getCurrentUserId(request);
  return redirect(userId ? "/home" : "/login");
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const localeValue = formData.get("locale");
  const returnToValue = formData.get("returnTo");

  if (formData.get("intent") !== "setLocale") {
    throw new Response("Unsupported action", { status: 400 });
  }

  const localeSelection = normalizeArcadeLocaleSelection(typeof localeValue === "string" ? localeValue : null);

  if (!localeSelection) {
    throw new Response("Locale is invalid", { status: 400 });
  }

  const returnTo = sanitizeReturnToPath(typeof returnToValue === "string" ? returnToValue : null) ?? "/";

  return redirect(returnTo, {
    headers: {
      "Set-Cookie": await serializeLocalePreference(localeSelection),
    },
  });
}