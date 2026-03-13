import { Form, Link, redirect, useLoaderData } from "react-router";

import type { Route } from "./+types/home";
import { AppShell } from "../components/app-shell";
import { HomeDashboard } from "../components/home-dashboard";
import { buildSharedHelpSections } from "../components/shared/help-content";
import { useHomeHub } from "../lib/client/usecase/home-hub/use-home-hub";
import { requireCurrentUserId } from "../lib/server/infrastructure/auth/session.server";
import { markOnboardingSeen } from "../lib/server/infrastructure/repositories/arcade-dashboard.repository.server";
import { getHomeDashboard } from "../lib/server/usecase/get-home-dashboard.server";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Arcade Home" },
    { name: "description", content: "Arcade dashboard and game selection." },
  ];
}

export async function loader({ request }: Route.LoaderArgs) {
  const userId = await requireCurrentUserId(request);
  return getHomeDashboard(userId);
}

export async function action({ request }: Route.ActionArgs) {
  const userId = await requireCurrentUserId(request);
  const formData = await request.formData();

  if (formData.get("intent") === "dismissOnboarding") {
    await markOnboardingSeen(userId);
    return redirect("/home");
  }

  throw new Response("Unsupported action", { status: 400 });
}

export default function Home() {
  const dashboard = useLoaderData<typeof loader>();
  const hub = useHomeHub(dashboard.games);

  return (
    <AppShell
      currentPath="home"
      titleEmoji="🎮"
      sectionLabel="Play hub"
      help={{
        defaultOpen: dashboard.onboarding.showGuide,
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
            {dashboard.onboarding.showGuide ? (
              <Form method="post">
                <input type="hidden" name="intent" value="dismissOnboarding" />
                <button className="action-link action-link-secondary" type="submit">
                  Got it
                </button>
              </Form>
            ) : null}
          </>
        ),
        intro: dashboard.onboarding.showGuide
          ? "Your first sign-in opens a focused guide. Close it once you know which game to start first, then use the game grid as the main hub."
          : "Open help when you need a reminder about game choice, total points, rankings, or run states.",
        sections: buildSharedHelpSections(),
        title: dashboard.onboarding.showGuide ? "Start, score, and switch with confidence" : "Arcade help",
        titleEyebrow: dashboard.onboarding.showGuide ? "First-use help" : "Help",
        triggerLabel: "Help",
      }}
      title="Choose your next game"
      subtitle={`Signed in as ${dashboard.user.displayName}. Pick a game first, then use rankings and profile only when you need detail.`}
      user={dashboard.user}
    >
      <HomeDashboard
        games={hub.visibleGames}
        hasMore={hub.hasMore}
        highlightedGame={hub.highlightedGame}
        matchCount={hub.matchCount}
        recentResults={dashboard.recentResults}
        search={hub.search}
        showMore={hub.showMore}
        setSearch={hub.setSearch}
        setSort={hub.setSort}
        setTag={hub.setTag}
        sort={hub.sort}
        sortOptions={hub.sortOptions}
        summaries={dashboard.summaries}
        tag={hub.tag}
        tagOptions={hub.tagOptions}
        user={dashboard.user}
      />
    </AppShell>
  );
}
