type ThemePreference = "LIGHT" | "DARK";

export function applyDocumentThemePreference(themePreference: ThemePreference): void {
  if (typeof document === "undefined") {
    return;
  }

  document.body.dataset.theme = themePreference === "DARK" ? "dark" : "light";
}
