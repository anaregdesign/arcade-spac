import { useLoaderData } from "react-router";

import type { Route } from "./+types/results.shared.$shareToken";
import { AppShell } from "../components/shared/AppShell";
import { ResultScreen } from "../components/gameplay/ResultScreen";
import { buildSharedHelpSections } from "../components/shared/help-content";
import { recommendationFeedbackEventType } from "../lib/domain/services/contextual-recommendation";
import { requireCurrentUserId } from "../lib/server/infrastructure/auth/session.server";
import { getRuntimeConfig } from "../lib/server/infrastructure/config/runtime-config.server";
import { getLocalePreference } from "../lib/server/infrastructure/locale/locale-preference.server";
import { toggleUserFavoriteGame } from "../lib/server/infrastructure/repositories/user-favorites.repository.server";
import { getPlayResultByShareToken } from "../lib/server/infrastructure/repositories/gameplay.repository.server";
import { getHomeDashboard } from "../lib/server/usecase/get-home-dashboard.server";
import { buildPersistedResultView } from "../lib/server/usecase/gameplay/get-result-view.server";
import { recordRecommendationFeedbackEvent } from "../lib/server/usecase/recommendation/record-recommendation-feedback.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  const viewerUserId = await requireCurrentUserId(request);
  const { resolvedLocale } = await getLocalePreference(request);
  const runtimeConfig = getRuntimeConfig();
  const requestUrl = new URL(request.url);
  const publicBaseUrl = runtimeConfig.publicAppUrl ?? requestUrl.origin;
  const [dashboard, result] = await Promise.all([
    getHomeDashboard(viewerUserId, resolvedLocale),
    getPlayResultByShareToken(params.shareToken),
  ]);

  if (!result || result.status !== "COMPLETED" || !result.shareToken || result.user.visibilityScope !== "TENANT_ONLY") {
    throw new Response("Shared result not found", { status: 404 });
  }

  if (viewerUserId !== result.userId) {
    await recordRecommendationFeedbackEvent({
      eventType: recommendationFeedbackEventType.SHARED_RESULT_VIEWED,
      gameId: result.gameId,
      userId: viewerUserId,
    });
  }

  return {
    dashboard,
    result: await buildPersistedResultView({
      locale: resolvedLocale,
      publicBaseUrl,
      result,
      viewerMode: "shared",
    }),
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const userId = await requireCurrentUserId(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const gameKey = formData.get("gameKey");

  if (intent !== "toggleFavorite" || typeof gameKey !== "string") {
    throw new Response("Unsupported action", { status: 400 });
  }

  const result = await getPlayResultByShareToken(params.shareToken);

  if (!result || result.status !== "COMPLETED" || !result.shareToken || result.user.visibilityScope !== "TENANT_ONLY") {
    throw new Response("Shared result not found", { status: 404 });
  }

  return toggleUserFavoriteGame({
    userId,
    gameKey,
  });
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
            body: "A shared result shows the board impact and next moves, while replay and favorite stay available without exposing extra profile detail.",
          },
        ]),
        title: "Result help",
      }}
      sectionLabel="Shared result"
      title={`${result.gameName} shared result`}
      user={dashboard.user}
    >
      <ResultScreen result={result} />
    </AppShell>
  );
}
