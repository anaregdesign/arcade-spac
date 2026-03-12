import { randomUUID } from "node:crypto";

import {
  createPlayResultRecord,
  getGameByKey,
  getPlayResultById,
  updatePlayResultStatus,
} from "../../infrastructure/repositories/gameplay.repository.server";
import { rebuildAggregates } from "./rebuild-aggregates.server";

const difficultyBasePoints = {
  EASY: 400,
  NORMAL: 700,
  HARD: 1100,
  EXPERT: 1450,
} as const;

function computeMetrics(gameKey: string, difficulty: keyof typeof difficultyBasePoints, outcome: "clean" | "steady" | "pending") {
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

function formatMetric(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export async function recordGameplayResult(input: {
  userId: string;
  gameKey: string;
  difficulty: "EASY" | "NORMAL" | "HARD" | "EXPERT";
  outcome: "clean" | "steady" | "pending";
}) {
  const game = await getGameByKey(input.gameKey);

  if (!game) {
    throw new Response("Game not found", { status: 404 });
  }

  const metrics = computeMetrics(input.gameKey, input.difficulty, input.outcome);
  const status = input.outcome === "pending" ? "PENDING_SAVE" : "COMPLETED";
  const leaderboardEligible = status === "COMPLETED";
  const resultId = `play-${randomUUID()}`;

  const result = await createPlayResultRecord({
    id: resultId,
    userId: input.userId,
    gameId: game.id,
    difficulty: input.difficulty,
    status,
    cleared: true,
    leaderboardEligible,
    primaryMetric: metrics.primaryMetric,
    hintCount: metrics.hintCount,
    mistakeCount: metrics.mistakeCount,
    competitivePoints: metrics.competitivePoints,
    totalPointsDelta: leaderboardEligible ? metrics.competitivePoints : 0,
    rankDelta: leaderboardEligible ? 1 : null,
    isPersonalBest: input.outcome === "clean",
    summaryText: `${game.name} ${input.difficulty.toLowerCase()} cleared in ${formatMetric(metrics.primaryMetric)}${input.outcome === "pending" ? ", save pending." : "."}`,
    sharePath: `/results/${resultId}`,
  });

  await rebuildAggregates();
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

  await rebuildAggregates();
  return result.id;
}