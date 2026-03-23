import { createCookie } from "react-router";

import type { ArcadeLocaleSelection } from "../../../domain/entities/locale";
import {
  normalizeArcadeLocaleSelection,
  resolveArcadeLocaleFromAcceptLanguage,
} from "../../../domain/entities/locale";
import { getRuntimeConfig } from "../config/runtime-config.server";

const runtimeConfig = getRuntimeConfig();

const localePreferenceCookie = createCookie("arcade_locale", {
  httpOnly: true,
  maxAge: 60 * 60 * 24 * 365,
  path: "/",
  sameSite: "lax",
  secure: runtimeConfig.environment === "production",
});

export async function getLocalePreference(request: Request) {
  const cookieHeader = request.headers.get("Cookie");
  const parsedCookie = await localePreferenceCookie.parse(cookieHeader);
  const localeSelection = normalizeArcadeLocaleSelection(typeof parsedCookie === "string" ? parsedCookie : null) ?? "auto";
  const resolvedLocale = localeSelection === "auto"
    ? resolveArcadeLocaleFromAcceptLanguage(request.headers.get("Accept-Language"))
    : localeSelection;

  return {
    localeSelection,
    resolvedLocale,
  } as const;
}

export function serializeLocalePreference(localeSelection: ArcadeLocaleSelection) {
  return localePreferenceCookie.serialize(localeSelection);
}