import { describe, expect, it } from "vitest";

import { useLoginScreen } from "./use-login-screen";

describe("useLoginScreen", () => {
  it("builds the local login view model", () => {
    expect(useLoginScreen({ authMode: "local" })).toEqual({
      eyebrow: "🧪 Local access",
      heroTitle: "Choose a development identity",
      rosterStatusLabel: "Seeded players",
      showEntraActions: false,
      showLocalRoster: true,
    });
  });

  it("builds the Entra login view model", () => {
    expect(useLoginScreen({ authMode: "entra" })).toEqual({
      eyebrow: "🔐 Microsoft Entra ID",
      heroTitle: "Sign in to Arcade",
      rosterStatusLabel: "Organization sign-in",
      showEntraActions: true,
      showLocalRoster: false,
    });
  });
});
