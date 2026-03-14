import { redirect, useLoaderData } from "react-router";

import type { Route } from "./+types/results.$resultId";
import { AppShell } from "../components/AppShell";
import { ResultScreen } from "../components/gameplay/ResultScreen";
import { buildSharedHelpSections } from "../components/shared/help-content";
import { requireCurrentUserId } from "../lib/server/infrastructure/auth/session.server";
import { getRuntimeConfig } from "../lib/server/infrastructure/config/runtime-config.server";
import { retryPendingResult } from "../lib/server/usecase/gameplay/record-gameplay-result.server";
import { getPlayResultById } from "../lib/server/infrastructure/repositories/gameplay.repository.server";
import { getHomeDashboard } from "../lib/server/usecase/get-home-dashboard.server";
import { buildPersistedResultView } from "../lib/server/usecase/gameplay/get-result-view.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireCurrentUserId(request);
  const runtimeConfig = getRuntimeConfig();
  const requestUrl = new URL(request.url);
  const publicBaseUrl = runtimeConfig.publicAppUrl ?? requestUrl.origin;
  const [dashboard, result] = await Promise.all([
    getHomeDashboard(userId),
    getPlayResultById(params.resultId),
  ]);

  if (!result || result.userId !== userId) {
    throw new Response("Result not found", { status: 404 });
  }

  return {
    dashboard,
    result: await buildPersistedResultView({
      publicBaseUrl,
      result,
      viewerMode: "owner",
    }),
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  await requireCurrentUserId(request);
  const formData = await request.formData();

  if (formData.get("intent") === "retryPending") {
    const resultId = await retryPendingResult(params.resultId);
    return redirect(`/results/${resultId}`);
  }

  throw new Response("Unsupported action", { status: 400 });
}

export default function ResultRoute() {
  const { dashboard, result } = useLoaderData<typeof loader>();

  return (
    <AppShell
      currentPath="games"
      help={{
        intro: "Result keeps the run summary, leaderboard impact, and next steps in one place so you can decide whether to replay, share, or move to rankings.",
        sections: buildSharedHelpSections([
          {
            eyebrow: "5. Result actions",
            title: "Replay, rankings, and share each solve a different next step",
            body: "Replay is the fastest path back into the board. Rankings show the gap to close next. Teams share stays available only for completed results from share-enabled profiles.",
          },
        ]),
        title: "Result help",
        triggerLabel: "Help",
      }}
      sectionLabel="Run result"
      title={`${result.gameName} result`}
      user={dashboard.user}
    >
      <ResultScreen result={result} />
    </AppShell>
  );
}
