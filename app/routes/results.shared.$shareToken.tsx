import { useLoaderData } from "react-router";

import type { Route } from "./+types/results.shared.$shareToken";
import { AppShell } from "../components/app-shell";
import { ResultScreen } from "../components/gameplay/result-screen";
import { buildSharedHelpSections } from "../components/shared/help-content";
import { requireCurrentUserId } from "../lib/server/infrastructure/auth/session.server";
import { getRuntimeConfig } from "../lib/server/infrastructure/config/runtime-config.server";
import { getPlayResultByShareToken } from "../lib/server/infrastructure/repositories/gameplay.repository.server";
import { getHomeDashboard } from "../lib/server/usecase/get-home-dashboard.server";
import { buildPersistedResultView } from "../lib/server/usecase/gameplay/get-result-view.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  const viewerUserId = await requireCurrentUserId(request);
  const runtimeConfig = getRuntimeConfig();
  const requestUrl = new URL(request.url);
  const publicBaseUrl = runtimeConfig.publicAppUrl ?? requestUrl.origin;
  const [dashboard, result] = await Promise.all([
    getHomeDashboard(viewerUserId),
    getPlayResultByShareToken(params.shareToken),
  ]);

  if (!result || result.status !== "COMPLETED" || !result.shareToken || result.user.visibilityScope !== "TENANT_ONLY") {
    throw new Response("Shared result not found", { status: 404 });
  }

  return {
    dashboard,
    result: await buildPersistedResultView({
      publicBaseUrl,
      result,
      viewerMode: "shared",
    }),
  };
}

export default function SharedResultRoute() {
  const { dashboard, result } = useLoaderData<typeof loader>();

  return (
    <AppShell
      currentPath="games"
      help={{
        intro: "Shared results keep the score detail visible to signed-in players while owner-only actions stay hidden.",
        sections: buildSharedHelpSections([
          {
            eyebrow: "5. Shared result",
            title: "Use rankings and replay without exposing profile details",
            body: "A shared result shows the board impact and next moves, but only the owner can post the Teams share again or retry a pending save.",
          },
        ]),
        title: "Result help",
        triggerLabel: "Help",
      }}
      sectionLabel="Shared result"
      title={`${result.gameName} shared result`}
      user={dashboard.user}
    >
      <ResultScreen result={result} />
    </AppShell>
  );
}
