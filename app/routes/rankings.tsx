import { useLoaderData } from "react-router";

import { AppShell } from "../components/app-shell";
import { requireCurrentUserId } from "../lib/server/infrastructure/auth/session.server";
import { getHomeDashboard } from "../lib/server/usecase/get-home-dashboard.server";

export async function loader({ request }: { request: Request }) {
  const userId = await requireCurrentUserId(request);
  return getHomeDashboard(userId);
}

export default function Rankings() {
  const dashboard = useLoaderData<typeof loader>();

  return (
    <AppShell
      currentPath="rankings"
      title="Rankings"
      subtitle="Leaderboard details arrive in the next slice. The route and navigation contract are already in place."
      user={dashboard.user}
    >
      <section className="feature-card workspace-card">
        <p className="eyebrow">Season preview</p>
        <h2 className="section-title">Your current rank is {dashboard.summaries.seasonRank ? `#${dashboard.summaries.seasonRank}` : "unranked"}</h2>
        <p>{dashboard.summaries.recentPlaySummary}</p>
      </section>
    </AppShell>
  );
}