import fluentComponents from "@fluentui/react-components";
import { useLoaderData } from "react-router";

import { AppShell } from "../components/app-shell";
import { requireCurrentUserId } from "../lib/server/infrastructure/auth/session.server";
import { getHomeDashboard } from "../lib/server/usecase/get-home-dashboard.server";

const { Card, Text, Title2 } = fluentComponents;

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
      <Card className="feature-card workspace-card">
        <p className="eyebrow">Season preview</p>
        <Title2>Your current rank is {dashboard.summaries.seasonRank ? `#${dashboard.summaries.seasonRank}` : "unranked"}</Title2>
        <Text>{dashboard.summaries.recentPlaySummary}</Text>
      </Card>
    </AppShell>
  );
}