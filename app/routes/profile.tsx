import { useLoaderData } from "react-router";

import { AppShell } from "../components/app-shell";
import { requireCurrentUserId } from "../lib/server/infrastructure/auth/session.server";
import { getHomeDashboard } from "../lib/server/usecase/get-home-dashboard.server";

export async function loader({ request }: { request: Request }) {
  const userId = await requireCurrentUserId(request);
  return getHomeDashboard(userId);
}

export default function Profile() {
  const dashboard = useLoaderData<typeof loader>();

  return (
    <AppShell
      currentPath="profile"
      title="Profile"
      subtitle="Profile analytics and editing land in a later slice, but the navigation path is established now."
      user={dashboard.user}
    >
      <section className="feature-card workspace-card">
        <p className="eyebrow">Player profile</p>
        <h2 className="section-title">{dashboard.user.displayName}</h2>
        <p>{dashboard.user.tagline}</p>
        <p>{dashboard.user.streakDays} day streak and {dashboard.user.totalPlayCount} recorded plays.</p>
      </section>
    </AppShell>
  );
}