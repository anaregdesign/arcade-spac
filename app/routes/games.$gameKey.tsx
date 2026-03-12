import fluentComponents from "@fluentui/react-components";
import { Link, useLoaderData } from "react-router";

import type { Route } from "./+types/games.$gameKey";
import { AppShell } from "../components/app-shell";
import { requireCurrentUserId } from "../lib/server/infrastructure/auth/session.server";
import { getHomeDashboard, getGameWorkspace } from "../lib/server/usecase/get-home-dashboard.server";

const { Card, Text, Title2 } = fluentComponents;

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireCurrentUserId(request);
  const dashboard = await getHomeDashboard(userId);
  const game = await getGameWorkspace(params.gameKey);

  return { dashboard, game };
}

export default function GameWorkspace() {
  const { dashboard, game } = useLoaderData<typeof loader>();

  return (
    <AppShell
      currentPath="games"
      title={`${game.name} workspace`}
      subtitle="Gameplay implementation lands in the next slice. Navigation and context are ready now."
      user={dashboard.user}
    >
      <Card className="feature-card workspace-card">
        <p className="eyebrow">{game.name}</p>
        <Title2>{game.shortDescription}</Title2>
        <Text>{game.rulesSummary}</Text>
        <div className="hero-actions">
          <Link className="action-link action-link-primary" to="/home">
            Back to home
          </Link>
          <Link className="action-link action-link-secondary" to="/rankings">
            Open rankings
          </Link>
        </div>
      </Card>
    </AppShell>
  );
}