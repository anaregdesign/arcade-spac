import { useLoaderData } from "react-router";

import { AppShell } from "../components/app-shell";
import { RankingsScreen } from "../components/rankings-screen";
import { requireCurrentUserId } from "../lib/server/infrastructure/auth/session.server";
import { getHomeDashboard } from "../lib/server/usecase/get-home-dashboard.server";
import { getRankingsView } from "../lib/server/usecase/get-rankings-view.server";

export async function loader({ request }: { request: Request }) {
  const userId = await requireCurrentUserId(request);
  const url = new URL(request.url);
  const period = url.searchParams.get("period") === "lifetime" ? "LIFETIME" : "SEASON";
  const scopeParam = url.searchParams.get("scope");
  const scope = scopeParam === "minesweeper" || scopeParam === "sudoku" ? scopeParam : "overall";
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
      title="Rankings"
      subtitle="Switch overall versus game boards and keep your own standing in view while choosing the next game to push."
      user={dashboard.user}
    >
      <RankingsScreen {...rankings} />
    </AppShell>
  );
}