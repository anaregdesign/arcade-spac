import { redirect, useLoaderData } from "react-router";

import type { Route } from "./+types/results.$resultId";
import { AppShell } from "../components/app-shell";
import { ResultScreen } from "../components/gameplay/result-screen";
import { requireCurrentUserId } from "../lib/server/infrastructure/auth/session.server";
import { getRuntimeConfig } from "../lib/server/infrastructure/config/runtime-config.server";
import { getHomeDashboard } from "../lib/server/usecase/get-home-dashboard.server";
import { retryPendingResult } from "../lib/server/usecase/gameplay/record-gameplay-result.server";
import { getPlayResultById } from "../lib/server/infrastructure/repositories/gameplay.repository.server";

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
    result: {
      id: result.id,
      status: result.status,
      difficulty: result.difficulty,
      summaryText: result.summaryText,
      primaryMetric: result.primaryMetric,
      hintCount: result.hintCount,
      mistakeCount: result.mistakeCount,
      totalPointsDelta: result.totalPointsDelta,
      rankDelta: result.rankDelta,
      competitivePoints: result.competitivePoints,
      gameKey: result.game.key.toLowerCase(),
      gameName: result.game.name,
      shareUrl: `${publicBaseUrl}/results/${result.id}`,
      shareText: `Arcade: ${result.game.name} ${result.difficulty.toLowerCase()} result ${result.summaryText}`,
    },
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
      titleEmoji="✨"
      sectionLabel="Run result"
      title={`${result.gameName} result`}
      subtitle="Impact first. Actions next."
      user={dashboard.user}
    >
      <ResultScreen result={result} />
    </AppShell>
  );
}