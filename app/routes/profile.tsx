import { redirect, useLoaderData } from "react-router";

import { AppShell } from "../components/app-shell";
import { ProfileScreen } from "../components/profile-screen";
import { requireCurrentUserId } from "../lib/server/infrastructure/auth/session.server";
import { updateProfileRecord } from "../lib/server/infrastructure/repositories/rankings-profile.repository.server";
import { getHomeDashboard } from "../lib/server/usecase/get-home-dashboard.server";
import { getProfileView } from "../lib/server/usecase/get-profile-view.server";

export async function loader({ request }: { request: Request }) {
  const userId = await requireCurrentUserId(request);
  const [dashboard, profile] = await Promise.all([
    getHomeDashboard(userId),
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
  const favoriteGame = formData.get("favoriteGame");

  if (typeof displayName !== "string" || !displayName.trim()) {
    throw new Response("Display name is required", { status: 400 });
  }

  if (visibilityScope !== "TENANT_ONLY" && visibilityScope !== "PRIVATE") {
    throw new Response("Visibility scope is invalid", { status: 400 });
  }

  await updateProfileRecord({
    userId,
    displayName,
    visibilityScope,
    tagline: typeof tagline === "string" ? tagline : "",
    favoriteGame: favoriteGame === "MINESWEEPER" || favoriteGame === "SUDOKU" ? favoriteGame : null,
  });

  return redirect("/profile");
}

export default function Profile() {
  const { dashboard, profile } = useLoaderData<typeof loader>();

  return (
    <AppShell
      currentPath="profile"
      titleEmoji="🪪"
      sectionLabel="Player card"
      title="Profile"
      user={dashboard.user}
    >
      <ProfileScreen {...profile} />
    </AppShell>
  );
}