import { redirect, useLoaderData } from "react-router";

import type { Route } from "./+types/games.$gameKey";
import { AppShell } from "../components/app-shell";
import { GameWorkspaceScreen } from "../components/gameplay/game-workspace-screen";
import { requireCurrentUserId } from "../lib/server/infrastructure/auth/session.server";
import { getHomeDashboard, getGameWorkspace } from "../lib/server/usecase/get-home-dashboard.server";
import { recordAbandonedRun, recordGameplayResult } from "../lib/server/usecase/gameplay/record-gameplay-result.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireCurrentUserId(request);
  const dashboard = await getHomeDashboard(userId);
  const game = await getGameWorkspace(params.gameKey);

  return { dashboard, game };
}

export async function action({ request, params }: Route.ActionArgs) {
  const userId = await requireCurrentUserId(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const difficulty = formData.get("difficulty");

  if (typeof difficulty !== "string" || !["EASY", "NORMAL", "HARD", "EXPERT"].includes(difficulty)) {
    throw new Response("Difficulty is required", { status: 400 });
  }

  if (intent === "completeClean" || intent === "completeSteady" || intent === "completePending") {
    const resultId = await recordGameplayResult({
      userId,
      gameKey: params.gameKey,
      difficulty: difficulty as "EASY" | "NORMAL" | "HARD" | "EXPERT",
      outcome: intent === "completeClean" ? "clean" : intent === "completeSteady" ? "steady" : "pending",
    });

    return redirect(`/results/${resultId}`);
  }

  if (intent === "abandon") {
    const redirectTo = formData.get("redirectTo");

    await recordAbandonedRun({
      userId,
      gameKey: params.gameKey,
      difficulty: difficulty as "EASY" | "NORMAL" | "HARD" | "EXPERT",
    });

    return redirect(typeof redirectTo === "string" ? redirectTo : "/home");
  }

  throw new Response("Unsupported action", { status: 400 });
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
      <GameWorkspaceScreen game={game} />
    </AppShell>
  );
}