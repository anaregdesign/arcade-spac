type LoginScreenInput = {
  authMode: "local" | "entra";
};

export function useLoginScreen(input: LoginScreenInput) {
  return {
    eyebrow: input.authMode === "entra" ? "🔐 Microsoft Entra ID" : "🧪 Local access",
    heroTitle: input.authMode === "entra" ? "Sign in to Arcade" : "Choose a development identity",
    rosterStatusLabel: input.authMode === "entra" ? "Organization sign-in" : "Seeded players",
    showEntraActions: input.authMode === "entra",
    showLocalRoster: input.authMode === "local",
  };
}
