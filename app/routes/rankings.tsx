import { useLoaderData } from "react-router";

import { AppShell } from "../components/app-shell";
import { RankingsScreen } from "../components/rankings-screen";
import { buildSharedHelpSections } from "../components/shared/help-content";
import { isGameKey } from "../lib/domain/entities/game-catalog";
import { requireCurrentUserId } from "../lib/server/infrastructure/auth/session.server";
import { getHomeDashboard } from "../lib/server/usecase/get-home-dashboard.server";
import { getRankingsView } from "../lib/server/usecase/get-rankings-view.server";

export async function loader({ request }: { request: Request }) {
  const userId = await requireCurrentUserId(request);
  const url = new URL(request.url);
  const period = url.searchParams.get("period") === "lifetime" ? "LIFETIME" : "SEASON";
  const scopeParam = url.searchParams.get("scope");
  const scope = scopeParam && isGameKey(scopeParam) ? scopeParam : "overall";
  const [dashboard, rankings] = await Promise.all([
    getHomeDashboard(userId),
    getRankingsView(userId, { period, scope }),
  ]);

  return { dashboard, rankings };
}

export default function Rankings() {
  const { dashboard, rankings } = useLoaderData<typeof loader>();

  return (
    <AppShell
      currentPath="rankings"
      help={{
        intro: "Rankings compare your confirmed best scores across the season or lifetime, while private profiles stay off the shared boards.",
        sections: buildSharedHelpSections([
          {
            eyebrow: "5. Ranking filters",
            title: "Switch between overall progress and one-board gaps",
            body: "Overall rankings show cross-game strength. A game board shows whether one stronger clear can pass the nearest rival or close the gap to the leader.",
          },
        ]),
        title: "Rankings help",
        triggerLabel: "Help",
      }}
      sectionLabel="Leaderboard"
      title="Rankings"
      user={dashboard.user}
    >
      <RankingsScreen {...rankings} />
    </AppShell>
  );
}
