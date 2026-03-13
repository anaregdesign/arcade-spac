import { randomUUID } from "node:crypto";

import {
  createPlayResultRecord,
  getGameByKey,
  getPlayResultById,
  updatePlayResultShareToken,
  updatePlayResultStatus,
} from "../../infrastructure/repositories/gameplay.repository.server";
import { rebuildAggregates } from "./rebuild-aggregates.server";

const difficultyBasePoints = {
  EASY: 400,
  NORMAL: 700,
  HARD: 1100,
  EXPERT: 1450,
} as const;

function computeMetrics(gameKey: string, difficulty: keyof typeof difficultyBasePoints, outcome: "clean" | "steady" | "pending" | "failed") {
  const base = difficultyBasePoints[difficulty];
  const modifier = outcome === "clean" ? 1 : outcome === "steady" ? 0.82 : 0.58;
  const primaryMetric = gameKey === "minesweeper"
    ? Math.max(160, Math.round((base / 3) * modifier))
    : Math.max(220, Math.round((base / 2.4) * modifier));

  return {
    primaryMetric,
    competitivePoints: Math.round(base * modifier),
    hintCount: gameKey === "sudoku" ? (outcome === "clean" ? 0 : outcome === "steady" ? 1 : 2) : null,
    mistakeCount: gameKey === "minesweeper" ? (outcome === "clean" ? 0 : outcome === "steady" ? 1 : 2) : null,
  };
}

function computeActualMetrics(input: {
  difficulty: keyof typeof difficultyBasePoints;
  gameKey: string;
  hintCount?: number;
  mistakeCount?: number;
  outcome: "clean" | "steady" | "pending" | "failed";
  primaryMetric: number;
}) {
  const base = difficultyBasePoints[input.difficulty];
  const primaryMetric = Math.max(1, Math.round(input.primaryMetric));
  const hintCount = input.gameKey === "sudoku" ? Math.max(0, Math.round(input.hintCount ?? 0)) : null;
  const mistakeCount = Math.max(0, Math.round(input.mistakeCount ?? 0));

  if (input.outcome === "failed") {
    return {
      primaryMetric,
      competitivePoints: 0,
      hintCount,
      mistakeCount: input.gameKey === "minesweeper" || input.gameKey === "sudoku" ? mistakeCount : null,
    };
  }

  const penalty = input.gameKey === "minesweeper"
    ? Math.round(primaryMetric * 1.35) + (mistakeCount ?? 0) * 120
    : Math.round(primaryMetric * 0.9) + (hintCount ?? 0) * 90 + mistakeCount * 45;
  const pendingModifier = input.outcome === "pending" ? 0.72 : 1;

  return {
    primaryMetric,
    competitivePoints: Math.max(Math.round(base * 0.25), Math.round((base - penalty) * pendingModifier)),
    hintCount,
    mistakeCount: input.gameKey === "minesweeper" || input.gameKey === "sudoku" ? mistakeCount : null,
  };
}

function formatMetric(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

function buildResultSummary(input: {
  difficulty: "EASY" | "NORMAL" | "HARD" | "EXPERT";
  gameName: string;
  gameKey: string;
  hintCount: number | null;
  mistakeCount: number | null;
  outcome: "clean" | "steady" | "pending" | "failed";
  primaryMetric: number;
}) {
  const baseSummary = `${input.gameName} ${input.difficulty.toLowerCase()} ${input.outcome === "failed" ? "ended after" : "cleared in"} ${formatMetric(input.primaryMetric)}`;

  if (input.outcome === "failed") {
    const detailParts: string[] = [];

    if (input.gameKey === "minesweeper") {
      detailParts.push(input.mistakeCount === 1 ? "one mine triggered" : `${input.mistakeCount ?? 0} mines triggered`);
    }

    if (input.gameKey === "sudoku") {
      detailParts.push(input.hintCount === 0 ? "no hints used" : `${input.hintCount ?? 0} hints used`);

      if ((input.mistakeCount ?? 0) > 0) {
        detailParts.push(`${input.mistakeCount} mistake${input.mistakeCount === 1 ? "" : "s"}`);
      }
    }

    return detailParts.length > 0
      ? `${baseSummary} with ${detailParts.join(" and ")}. Result saved for history only and excluded from rankings.`
      : `${baseSummary}. Result saved for history only and excluded from rankings.`;
  }

  const detailParts: string[] = [];

  if (input.gameKey === "minesweeper") {
    detailParts.push(input.mistakeCount === 0 ? "no mistakes" : `${input.mistakeCount} mistake${input.mistakeCount === 1 ? "" : "s"}`);
  }

  if (input.gameKey === "sudoku") {
    detailParts.push(input.hintCount === 0 ? "no hints" : `${input.hintCount} hint${input.hintCount === 1 ? "" : "s"}`);

    if ((input.mistakeCount ?? 0) > 0) {
      detailParts.push(`${input.mistakeCount} mistake${input.mistakeCount === 1 ? "" : "s"}`);
    }
  }

  const sentence = detailParts.length > 0
    ? `${baseSummary} with ${detailParts.join(" and ")}`
    : baseSummary;
  return input.outcome === "pending" ? `${sentence}, save pending.` : `${sentence}.`;
}

export async function recordGameplayResult(input: {
  actualMetrics?: {
    hintCount?: number;
    mistakeCount?: number;
    primaryMetric: number;
  };
  userId: string;
  gameKey: string;
  difficulty: "EASY" | "NORMAL" | "HARD" | "EXPERT";
  outcome: "clean" | "steady" | "pending" | "failed";
}) {
  const game = await getGameByKey(input.gameKey);

  if (!game) {
    throw new Response("Game not found", { status: 404 });
  }

  const metrics = input.actualMetrics
    ? computeActualMetrics({
        difficulty: input.difficulty,
        gameKey: input.gameKey,
        hintCount: input.actualMetrics.hintCount,
        mistakeCount: input.actualMetrics.mistakeCount,
        outcome: input.outcome,
        primaryMetric: input.actualMetrics.primaryMetric,
      })
    : computeMetrics(input.gameKey, input.difficulty, input.outcome);
  const status = input.outcome === "pending" ? "PENDING_SAVE" : input.outcome === "failed" ? "FAILED" : "COMPLETED";
  const leaderboardEligible = status === "COMPLETED";
  const resultId = `play-${randomUUID()}`;
  const shareToken = status === "COMPLETED" ? `share-${randomUUID()}` : null;

  const result = await createPlayResultRecord({
    id: resultId,
    userId: input.userId,
    gameId: game.id,
    difficulty: input.difficulty,
    status,
    cleared: status !== "FAILED",
    leaderboardEligible,
    primaryMetric: metrics.primaryMetric,
    hintCount: metrics.hintCount,
    mistakeCount: metrics.mistakeCount,
    competitivePoints: metrics.competitivePoints,
    totalPointsDelta: leaderboardEligible ? metrics.competitivePoints : 0,
    rankDelta: leaderboardEligible ? 1 : null,
    isPersonalBest: input.outcome === "clean",
    summaryText: buildResultSummary({
      difficulty: input.difficulty,
      gameKey: input.gameKey,
      gameName: game.name,
      hintCount: metrics.hintCount,
      mistakeCount: metrics.mistakeCount,
      outcome: input.outcome,
      primaryMetric: metrics.primaryMetric,
    }),
    sharePath: shareToken ? `/results/shared/${shareToken}` : null,
    shareToken,
  });

  try {
    await rebuildAggregates();
  } catch {
    if (status === "COMPLETED") {
      await updatePlayResultStatus(result.id, {
        status: "PENDING_SAVE",
        leaderboardEligible: false,
        totalPointsDelta: 0,
        rankDelta: null,
        summaryText: `${game.name} clear was preserved, but publish failed. Retry save to add it to rankings and total points.`,
      });
    }
  }

  return result.id;
}

export async function recordAbandonedRun(input: {
  userId: string;
  gameKey: string;
  difficulty: "EASY" | "NORMAL" | "HARD" | "EXPERT";
}) {
  const game = await getGameByKey(input.gameKey);

  if (!game) {
    throw new Response("Game not found", { status: 404 });
  }

  await createPlayResultRecord({
    id: `play-${randomUUID()}`,
    userId: input.userId,
    gameId: game.id,
    difficulty: input.difficulty,
    status: "ABANDONED",
    cleared: false,
    leaderboardEligible: false,
    primaryMetric: 0,
    competitivePoints: 0,
    totalPointsDelta: 0,
    rankDelta: null,
    summaryText: `${game.name} run was abandoned before completion.`,
    sharePath: null,
  });

  await rebuildAggregates();
}

export async function retryPendingResult(resultId: string) {
  const result = await getPlayResultById(resultId);

  if (!result) {
    throw new Response("Result not found", { status: 404 });
  }

  if (result.status !== "PENDING_SAVE") {
    return result.id;
  }

  await updatePlayResultStatus(result.id, {
    status: "COMPLETED",
    leaderboardEligible: true,
    totalPointsDelta: result.competitivePoints,
    rankDelta: 1,
    summaryText: `${result.game.name} save retry succeeded and the result is now counted.`,
  });

  if (!result.shareToken) {
    await updatePlayResultShareToken(result.id, `share-${randomUUID()}`);
  }

  await rebuildAggregates();
  return result.id;
}
