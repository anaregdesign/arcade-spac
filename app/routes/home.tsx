import { Link, useLoaderData } from "react-router";

import type { Route } from "./+types/home";
import { HomeDashboard } from "../components/home/HomeDashboard";
import { AppShell } from "../components/shared/AppShell";
import { buildSharedHelpSections } from "../components/shared/help-content";
import { formatHomeStartWithLabel, getHomeHubCopy } from "../lib/client/usecase/home-hub/home-hub-copy";
import { useHomeHub } from "../lib/client/usecase/home-hub/use-home-hub";
import { useAppLocale } from "../lib/client/usecase/locale/use-app-locale";
import { requireCurrentUserId } from "../lib/server/infrastructure/auth/session.server";
import { getLocalePreference } from "../lib/server/infrastructure/locale/locale-preference.server";
import { toggleUserFavoriteGame } from "../lib/server/infrastructure/repositories/user-favorites.repository.server";
import { getHomeDashboard } from "../lib/server/usecase/get-home-dashboard.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Arcade Home" },
    { name: "description", content: "Arcade game selection hub." },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireCurrentUserId(request);
  const { resolvedLocale } = await getLocalePreference(request);
  return getHomeDashboard(userId, resolvedLocale);
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireCurrentUserId(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const gameKey = formData.get("gameKey");

  if (intent !== "toggleFavorite" || typeof gameKey !== "string") {
    throw new Response("Unsupported action", { status: 400 });
  }

  return toggleUserFavoriteGame({
    userId,
    gameKey,
  });
}

export default function Home() {
  const { locale } = useAppLocale();
  const copy = getHomeHubCopy(locale);
  const dashboard = useLoaderData<typeof loader>();
  const hub = useHomeHub(dashboard.games);

  return (
    <AppShell
      currentPath="home"
      sectionLabel={copy.sectionLabel}
      help={{
        footer: (
          <>
            {hub.highlightedGame ? (
              <Link className="action-link action-link-primary" to={`/games/${hub.highlightedGame.key}`}>
                {formatHomeStartWithLabel(locale, hub.highlightedGame.name)}
              </Link>
            ) : null}
            <Link className="action-link action-link-secondary" to="/rankings">
              {copy.openRankingsLabel}
            </Link>
          </>
        ),
        intro: copy.helpIntro,
        sections: buildSharedHelpSections(),
        title: copy.helpTitle,
      }}
      title={copy.title}
      user={dashboard.user}
    >
      <HomeDashboard
        clearFilters={hub.clearFilters}
        favoritesOnly={hub.favoritesOnly}
        games={hub.visibleGameCards}
        hasMore={hub.hasMore}
        loadMoreTriggerRef={hub.loadMoreTriggerRef}
        matchCount={hub.matchCount}
        search={hub.search}
        showMore={hub.showMore}
        setFavoritesOnly={hub.setFavoritesOnly}
        setSearch={hub.setSearch}
        setSort={hub.setSort}
        setTag={hub.setTag}
        sort={hub.sort}
        sortOptions={hub.sortOptions}
        tag={hub.tag}
        tagOptions={hub.tagOptions}
        visibleFavoriteCount={hub.visibleFavoriteCount}
      />
    </AppShell>
  );
}
