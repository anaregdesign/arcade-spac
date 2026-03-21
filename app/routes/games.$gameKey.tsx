import { randomUUID } from "node:crypto";

import { redirect, useLoaderData } from "react-router";

import type { Route } from "./+types/games.$gameKey";
import { AppShell } from "../components/shared/AppShell";
import { GameWorkspaceScreen } from "../components/gameplay/GameWorkspaceScreen";
import { buildSharedHelpSections } from "../components/shared/help-content";
import { resolveGameKey } from "../lib/domain/entities/game-catalog";
import { commitSession, getCurrentUserId, getSession, requireCurrentUserId, setPendingResultDraft } from "../lib/server/infrastructure/auth/session.server";
import { toggleUserFavoriteGame } from "../lib/server/infrastructure/repositories/user-favorites.repository.server";
import { getHomeDashboard, getGameWorkspace } from "../lib/server/usecase/get-home-dashboard.server";
import { recordAbandonedRun, recordGameplayResult } from "../lib/server/usecase/gameplay/record-gameplay-result.server";

export async function loader({ request, params }: Route.LoaderArgs) {
  const canonicalGameKey = resolveGameKey(params.gameKey);

  if (canonicalGameKey && canonicalGameKey !== params.gameKey) {
    return redirect(`/games/${canonicalGameKey}`);
  }

  const userId = await requireCurrentUserId(request);
  const dashboard = await getHomeDashboard(userId);
  const game = await getGameWorkspace(canonicalGameKey ?? params.gameKey);
  const gameSummary = dashboard.games.find((entry) => entry.key === game.key);

  return {
    dashboard,
    game: {
      ...game,
      isFavorite: gameSummary?.isFavorite ?? false,
      standing: {
        bestCompetitivePoints: gameSummary?.bestCompetitivePoints ?? 0,
        currentRank: gameSummary?.currentRank ?? null,
        personalBestMetric: gameSummary?.personalBestMetric ?? null,
        playCount: gameSummary?.playCount ?? 0,
        seasonPoints: dashboard.summaries.seasonPoints,
        seasonRank: dashboard.summaries.seasonRank,
      },
    },
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  const canonicalGameKey = resolveGameKey(params.gameKey);

  if (!canonicalGameKey) {
    throw new Response("Game not found", { status: 404 });
  }

  const session = await getSession(request);
  const userId = await getCurrentUserId(request);
  const formData = await request.formData();
  const intent = formData.get("intent");
  const favoriteGameKey = formData.get("gameKey");
  const difficulty = formData.get("difficulty");
  const elapsedSecondsInput = formData.get("elapsedSeconds");
  const primaryMetricInput = formData.get("primaryMetric");
  const mistakeCountInput = formData.get("mistakeCount");
  const hintCountInput = formData.get("hintCount");

  if (intent === "toggleFavorite") {
    if (!userId) {
      throw new Response("Sign-in required", { status: 401 });
    }

    if (typeof favoriteGameKey !== "string") {
      throw new Response("Game key is required", { status: 400 });
    }

    return toggleUserFavoriteGame({
      userId,
      gameKey: favoriteGameKey,
    });
  }

  if (typeof difficulty !== "string" || !["EASY", "NORMAL", "HARD", "EXPERT"].includes(difficulty)) {
    throw new Response("Difficulty is required", { status: 400 });
  }

  if (intent === "completeClean" || intent === "completeSteady" || intent === "completePending" || intent === "fail") {
    const primaryMetric = typeof primaryMetricInput === "string" && primaryMetricInput ? Number(primaryMetricInput) : undefined;
    const mistakeCount = typeof mistakeCountInput === "string" && mistakeCountInput ? Number(mistakeCountInput) : undefined;
    const hintCount = typeof hintCountInput === "string" && hintCountInput ? Number(hintCountInput) : undefined;
    const actualMetrics = primaryMetric !== undefined && Number.isFinite(primaryMetric)
      ? {
          primaryMetric,
          mistakeCount: mistakeCount !== undefined && Number.isFinite(mistakeCount) ? mistakeCount : undefined,
          hintCount: hintCount !== undefined && Number.isFinite(hintCount) ? hintCount : undefined,
        }
      : undefined;
    const pendingDraftId = `pending-${randomUUID()}`;

    if (!actualMetrics) {
      throw new Response("Primary metric is required", { status: 400 });
    }

    if (!userId) {
      setPendingResultDraft(session, {
        id: pendingDraftId,
        actualMetrics,
        difficulty: difficulty as "EASY" | "NORMAL" | "HARD" | "EXPERT",
        gameKey: canonicalGameKey,
        outcome: intent === "completeClean" ? "clean" : intent === "fail" ? "failed" : "steady",
        ownerUserId: null,
        recoveryReason: "session_expired",
      });

      return redirect(`/login?${new URLSearchParams({
        error: "session_expired_result_save",
        returnTo: `/results/pending/${pendingDraftId}`,
      }).toString()}`, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }

    try {
      const resultId = await recordGameplayResult({
        userId,
        gameKey: canonicalGameKey,
        difficulty: difficulty as "EASY" | "NORMAL" | "HARD" | "EXPERT",
        outcome: intent === "completeClean"
          ? "clean"
          : intent === "completeSteady"
            ? "steady"
            : intent === "fail"
              ? "failed"
              : "pending",
        actualMetrics,
      });

      return redirect(`/results/${resultId}`);
    } catch {
      setPendingResultDraft(session, {
        id: pendingDraftId,
        actualMetrics,
        difficulty: difficulty as "EASY" | "NORMAL" | "HARD" | "EXPERT",
        gameKey: canonicalGameKey,
        outcome: intent === "completeClean" ? "clean" : intent === "fail" ? "failed" : "steady",
        ownerUserId: userId,
        recoveryReason: "save_failed",
      });

      return redirect(`/results/pending/${pendingDraftId}`, {
        headers: {
          "Set-Cookie": await commitSession(session),
        },
      });
    }
  }

  if (intent === "abandon") {
    if (!userId) {
      const redirectTo = formData.get("redirectTo");
      return redirect(`/login?${new URLSearchParams({
        returnTo: typeof redirectTo === "string" ? redirectTo : "/home",
      }).toString()}`);
    }

    const redirectTo = formData.get("redirectTo");

    const elapsedSeconds = typeof elapsedSecondsInput === "string" && elapsedSecondsInput
      ? Number(elapsedSecondsInput)
      : undefined;

    await recordAbandonedRun({
      userId,
      gameKey: canonicalGameKey,
      difficulty: difficulty as "EASY" | "NORMAL" | "HARD" | "EXPERT",
      elapsedSeconds: elapsedSeconds !== undefined && Number.isFinite(elapsedSeconds)
        ? elapsedSeconds
        : undefined,
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
      help={{
        intro: "The game screen keeps the live board primary. Rules, recovery details, and cross-game guidance stay in this shared help layer so the board can stay clear.",
        sections: buildSharedHelpSections([
          {
            eyebrow: "5. Stay focused",
            title: "Keep only the board and core actions in view",
            body: "Use the board, run status, difficulty, and finish action as the main controls. Open Help only when you need rules or recovery details.",
          },
        ]),
        title: "Game help",
        triggerLabel: "Help",
      }}
      sectionLabel="Game room"
      title={`${game.name}`}
      user={dashboard.user}
    >
      <GameWorkspaceScreen game={game} />
    </AppShell>
  );
}
