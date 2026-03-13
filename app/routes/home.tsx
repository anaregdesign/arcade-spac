import { Link, useLoaderData } from "react-router";

import type { Route } from "./+types/home";
import { AppShell } from "../components/app-shell";
import { HomeDashboard } from "../components/home-dashboard";
import { buildSharedHelpSections } from "../components/shared/help-content";
import { useHomeHub } from "../lib/client/usecase/home-hub/use-home-hub";
import { requireCurrentUserId } from "../lib/server/infrastructure/auth/session.server";
import { getHomeDashboard } from "../lib/server/usecase/get-home-dashboard.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Arcade Home" },
    { name: "description", content: "Arcade game selection hub." },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireCurrentUserId(request);
  return getHomeDashboard(userId);
}

export default function Home() {
  const dashboard = useLoaderData<typeof loader>();
  const hub = useHomeHub(dashboard.games);

  return (
    <AppShell
      currentPath="home"
      sectionLabel="Play hub"
      help={{
        footer: (
          <>
            {hub.highlightedGame ? (
              <Link className="action-link action-link-primary" to={`/games/${hub.highlightedGame.key}`}>
                Start with {hub.highlightedGame.name}
              </Link>
            ) : null}
            <Link className="action-link action-link-secondary" to="/rankings">
              Open rankings
            </Link>
          </>
        ),
        intro: "Open help when you need a reminder about game choice, total points, rankings, or run states.",
        sections: buildSharedHelpSections(),
        title: "Arcade help",
        titleEyebrow: "Help",
        triggerLabel: "Help",
      }}
      title="Choose your next game"
      user={dashboard.user}
    >
      <HomeDashboard
        games={hub.visibleGames}
        hasMore={hub.hasMore}
        highlightedGame={hub.highlightedGame}
        matchCount={hub.matchCount}
        search={hub.search}
        showMore={hub.showMore}
        setSearch={hub.setSearch}
        setSort={hub.setSort}
        setTag={hub.setTag}
        sort={hub.sort}
        sortOptions={hub.sortOptions}
        tag={hub.tag}
        tagOptions={hub.tagOptions}
      />
    </AppShell>
  );
}
