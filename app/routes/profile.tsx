import { redirect, useLoaderData } from "react-router";

import { ProfileScreen } from "../components/profile/ProfileScreen";
import { AppShell } from "../components/shared/AppShell";
import { buildSharedHelpSections } from "../components/shared/help-content";
import { requireCurrentUserId } from "../lib/server/infrastructure/auth/session.server";
import { getLocalePreference } from "../lib/server/infrastructure/locale/locale-preference.server";
import { updateProfileRecord } from "../lib/server/infrastructure/repositories/rankings-profile.repository.server";
import { getHomeDashboard } from "../lib/server/usecase/get-home-dashboard.server";
import { getProfileView } from "../lib/server/usecase/get-profile-view.server";

export async function loader({ request }: { request: Request }) {
  const userId = await requireCurrentUserId(request);
  const { resolvedLocale } = await getLocalePreference(request);
  const [dashboard, profile] = await Promise.all([
    getHomeDashboard(userId, resolvedLocale),
    getProfileView(userId),
  ]);

  return { dashboard, profile };
}

export async function action({ request }: { request: Request }) {
  const userId = await requireCurrentUserId(request);
  const formData = await request.formData();
  const displayName = formData.get("displayName");
  const visibilityScope = formData.get("visibilityScope");
  const tagline = formData.get("tagline");
  const themePreference = formData.get("themePreference");

  if (typeof displayName !== "string" || !displayName.trim()) {
    throw new Response("Display name is required", { status: 400 });
  }

  if (visibilityScope !== "TENANT_ONLY" && visibilityScope !== "PRIVATE") {
    throw new Response("Visibility scope is invalid", { status: 400 });
  }

  if (themePreference !== "LIGHT" && themePreference !== "DARK") {
    throw new Response("Theme preference is invalid", { status: 400 });
  }

  await updateProfileRecord({
    userId,
    displayName,
    visibilityScope,
    tagline: typeof tagline === "string" ? tagline : "",
    themePreference,
  });

  return redirect("/profile");
}

export default function Profile() {
  const { dashboard, profile } = useLoaderData<typeof loader>();

  return (
    <AppShell
      currentPath="profile"
      help={{
        intro: "Profile controls how your name, visibility, and theme appear across rankings and result sharing.",
        sections: buildSharedHelpSections([
          {
            eyebrow: "5. Profile controls",
            title: "Visibility and theme apply across the app",
            body: "Private visibility removes you from shared leaderboards. Theme preference is saved here and reused on the next sign-in.",
          },
        ]),
        title: "Profile help",
      }}
      sectionLabel="Player card"
      title="Profile"
      user={dashboard.user}
    >
      <ProfileScreen {...profile} />
    </AppShell>
  );
}
