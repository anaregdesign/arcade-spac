export const supportedArcadeLocales = ["en", "ja", "zh", "fr"] as const;

export type SupportedArcadeLocale = (typeof supportedArcadeLocales)[number];
export type ArcadeLocaleSelection = SupportedArcadeLocale | "auto";

function normalizeLocaleTag(input: string) {
  return input.trim().toLowerCase();
}

export function normalizeArcadeLocale(input: string | null | undefined): SupportedArcadeLocale | null {
  if (!input) {
    return null;
  }

  const normalizedInput = normalizeLocaleTag(input);

  if (normalizedInput.startsWith("ja")) {
    return "ja";
  }

  if (normalizedInput.startsWith("zh")) {
    return "zh";
  }

  if (normalizedInput.startsWith("fr")) {
    return "fr";
  }

  if (normalizedInput.startsWith("en")) {
    return "en";
  }

  return null;
}

export function normalizeArcadeLocaleSelection(input: string | null | undefined): ArcadeLocaleSelection | null {
  if (!input) {
    return null;
  }

  const normalizedInput = normalizeLocaleTag(input);

  if (normalizedInput === "auto") {
    return "auto";
  }

  return normalizeArcadeLocale(normalizedInput);
}

function parseAcceptLanguageEntry(entry: string) {
  const [tagPart, ...parameterParts] = entry.split(";");
  const tag = tagPart?.trim();

  if (!tag) {
    return null;
  }

  const qualityParameter = parameterParts.find((parameter) => parameter.trim().startsWith("q="));
  const qualityValue = qualityParameter ? Number(qualityParameter.trim().slice(2)) : 1;

  return {
    quality: Number.isFinite(qualityValue) ? qualityValue : 1,
    tag,
  };
}

export function resolveArcadeLocaleFromAcceptLanguage(headerValue: string | null | undefined): SupportedArcadeLocale {
  if (!headerValue) {
    return "en";
  }

  const parsedEntries = headerValue
    .split(",")
    .map(parseAcceptLanguageEntry)
    .filter((entry): entry is NonNullable<ReturnType<typeof parseAcceptLanguageEntry>> => Boolean(entry))
    .sort((left, right) => right.quality - left.quality);

  for (const entry of parsedEntries) {
    const locale = normalizeArcadeLocale(entry.tag);

    if (locale) {
      return locale;
    }
  }

  return "en";
}