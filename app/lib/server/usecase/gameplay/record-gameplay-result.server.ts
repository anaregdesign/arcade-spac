import { randomUUID } from "node:crypto";

import { recommendationFeedbackEventType } from "../../../domain/services/contextual-recommendation";
import {
  createPlayResultRecord,
  getGameByKey,
  getPlayResultById,
  updatePlayResultShareToken,
  updatePlayResultStatus,
} from "../../infrastructure/repositories/gameplay.repository.server";
import { getGameDefinition, getGameSuccessfulResultLabel } from "../../../domain/entities/game-catalog";
import { formatPrimaryMetric, getPrecisionDropHitRating } from "../../../domain/services/game-metrics";
import { recordRecommendationFeedbackEvent } from "../recommendation/record-recommendation-feedback.server";
import { rebuildAggregates } from "./rebuild-aggregates.server";

const quickAbandonThresholdSeconds = 30;

const difficultyBasePoints = {
  EASY: 400,
  NORMAL: 700,
  HARD: 1100,
  EXPERT: 1450,
} as const;

function pluralize(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function computeMetrics(gameKey: string, difficulty: keyof typeof difficultyBasePoints, outcome: "clean" | "steady" | "pending" | "failed") {
  const base = difficultyBasePoints[difficulty];
  const modifier = outcome === "clean" ? 1 : outcome === "steady" ? 0.82 : 0.58;
  const definition = getGameDefinition(gameKey);
  const primaryMetric = gameKey === "minesweeper"
    ? Math.max(160, Math.round((base / 3) * modifier))
    : gameKey === "sudoku"
      ? Math.max(220, Math.round((base / 2.4) * modifier))
      : definition?.primaryMetric.format === "offset_px"
        ? outcome === "clean"
          ? 6
          : outcome === "steady"
            ? 16
            : 34
        : Math.max(150, Math.round((base / 3.4) * modifier));

  return {
    primaryMetric,
    competitivePoints: Math.round(base * modifier),
    hintCount: definition?.supportMetric.kind === "count" && definition.supportMetric.source === "hintCount"
      ? (outcome === "clean" ? 0 : outcome === "steady" ? 1 : 2)
      : null,
    mistakeCount: definition?.supportMetric.kind === "count" && definition.supportMetric.source === "mistakeCount"
      ? (outcome === "clean" ? 0 : outcome === "steady" ? 1 : 2)
      : null,
  };
}

function computePenalty(input: {
  gameKey: string;
  hintCount: number | null;
  mistakeCount: number | null;
  primaryMetric: number;
}) {
  const definition = getGameDefinition(input.gameKey);

  if (input.gameKey === "minesweeper") {
    return Math.round(input.primaryMetric * 1.35) + (input.mistakeCount ?? 0) * 120;
  }

  if (input.gameKey === "sudoku") {
    return Math.round(input.primaryMetric * 0.9) + (input.hintCount ?? 0) * 90 + (input.mistakeCount ?? 0) * 45;
  }

  if (definition?.primaryMetric.format === "offset_px") {
    return Math.round(input.primaryMetric * 12);
  }

  return Math.round(input.primaryMetric * 1.1) + (input.mistakeCount ?? 0) * 70 + (input.hintCount ?? 0) * 90;
}

function getCountMetricValue(input: {
  gameKey: string;
  hintCount?: number;
  mistakeCount?: number;
}) {
  const definition = getGameDefinition(input.gameKey);

  if (definition?.supportMetric.kind !== "count") {
    return {
      hintCount: null,
      mistakeCount: null,
    };
  }

  if (definition.supportMetric.source === "hintCount") {
    return {
      hintCount: Math.max(0, Math.round(input.hintCount ?? 0)),
      mistakeCount: null,
    };
  }

  return {
    hintCount: null,
    mistakeCount: Math.max(0, Math.round(input.mistakeCount ?? 0)),
  };
}

function buildGenericCountSummaryPart(input: {
  count: number;
  gameKey: string;
}) {
  const definition = getGameDefinition(input.gameKey);

  if (!definition || definition.supportMetric.kind !== "count") {
    return null;
  }

  return input.count === 0
    ? definition.supportMetric.zeroSummaryText
    : `${pluralize(input.count, definition.supportMetric.noun)} ${definition.supportMetric.noteVerb}`;
}

function buildGenericFailedCountSummaryPart(input: {
  count: number;
  gameKey: string;
}) {
  const definition = getGameDefinition(input.gameKey);

  if (!definition || definition.supportMetric.kind !== "count") {
    return null;
  }

  if (definition.supportMetric.source === "hintCount") {
    return input.count === 0 ? "no hints used" : `${pluralize(input.count, definition.supportMetric.noun)} used`;
  }

  return input.count === 0 ? `no ${definition.supportMetric.noun}s` : `${pluralize(input.count, definition.supportMetric.noun)}`;
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
  const { hintCount, mistakeCount } = getCountMetricValue({
    gameKey: input.gameKey,
    hintCount: input.hintCount,
    mistakeCount: input.mistakeCount,
  });

  if (input.outcome === "failed") {
    return {
      primaryMetric,
      competitivePoints: 0,
      hintCount,
      mistakeCount,
    };
  }

  const penalty = computePenalty({
    gameKey: input.gameKey,
    hintCount,
    mistakeCount,
    primaryMetric,
  });
  const pendingModifier = input.outcome === "pending" ? 0.72 : 1;

  return {
    primaryMetric,
    competitivePoints: Math.max(Math.round(base * 0.25), Math.round((base - penalty) * pendingModifier)),
    hintCount,
    mistakeCount,
  };
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
  const formattedMetric = formatPrimaryMetric(input.gameKey, input.primaryMetric);
  const definition = getGameDefinition(input.gameKey);

  if (definition?.primaryMetric.format === "offset_px") {
    if (input.outcome === "failed") {
      return `${input.gameName} ${input.difficulty.toLowerCase()} missed the line after ${formattedMetric} offset. Result saved for history only and excluded from rankings.`;
    }

    const rating = getPrecisionDropHitRating(input.primaryMetric, "COMPLETED");
    const baseSummary = `${input.gameName} ${input.difficulty.toLowerCase()} hit landed at ${formattedMetric} offset with a ${rating.value.toLowerCase()} rating`;
    return input.outcome === "pending" ? `${baseSummary}, save pending.` : `${baseSummary}.`;
  }

  const baseSummary = `${input.gameName} ${input.difficulty.toLowerCase()} ${input.outcome === "failed" ? "ended after" : "cleared in"} ${formattedMetric}`;

  if (input.outcome === "failed") {
    const detailParts: string[] = [];

    if (input.gameKey === "minesweeper") {
      detailParts.push(input.mistakeCount === 1 ? "one mine triggered" : `${input.mistakeCount ?? 0} mines triggered`);
    }

    if (definition?.supportMetric.kind === "count" && definition.supportMetric.source === "hintCount") {
      const hintPart = buildGenericFailedCountSummaryPart({
        count: input.hintCount ?? 0,
        gameKey: input.gameKey,
      });

      if (hintPart) {
        detailParts.push(hintPart);
      }

      if ((input.mistakeCount ?? 0) > 0) {
        detailParts.push(`${input.mistakeCount} mistake${input.mistakeCount === 1 ? "" : "s"}`);
      }
    } else if (
      input.gameKey !== "minesweeper"
      && definition?.supportMetric.kind === "count"
      && definition.supportMetric.source === "mistakeCount"
    ) {
      const mistakePart = buildGenericFailedCountSummaryPart({
        count: input.mistakeCount ?? 0,
        gameKey: input.gameKey,
      });

      if (mistakePart) {
        detailParts.push(mistakePart);
      }
    }

    return detailParts.length > 0
      ? `${baseSummary} with ${detailParts.join(" and ")}. Result saved for history only and excluded from rankings.`
      : `${baseSummary}. Result saved for history only and excluded from rankings.`;
  }

  const detailParts: string[] = [];

  if (definition?.supportMetric.kind === "count") {
    if (definition.supportMetric.source === "hintCount") {
      const hintPart = buildGenericCountSummaryPart({
        count: input.hintCount ?? 0,
        gameKey: input.gameKey,
      });

      if (hintPart) {
        detailParts.push(hintPart);
      }

      if ((input.mistakeCount ?? 0) > 0) {
        detailParts.push(`${input.mistakeCount} mistake${input.mistakeCount === 1 ? "" : "s"}`);
      }
    } else {
      const mistakePart = buildGenericCountSummaryPart({
        count: input.mistakeCount ?? 0,
        gameKey: input.gameKey,
      });

      if (mistakePart) {
        detailParts.push(mistakePart);
      }
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
  let finalizedStatus: typeof status = status;

  try {
    await rebuildAggregates();
  } catch {
    if (status === "COMPLETED") {
      const preservedResultLabel = getGameSuccessfulResultLabel(input.gameKey);

      await updatePlayResultStatus(result.id, {
        status: "PENDING_SAVE",
        leaderboardEligible: false,
        totalPointsDelta: 0,
        rankDelta: null,
        summaryText: `${game.name} ${preservedResultLabel} was preserved, but publish failed. Retry save to add it to rankings and total points.`,
      });
      finalizedStatus = "PENDING_SAVE";
    }
  }

  if (finalizedStatus === "COMPLETED") {
    await recordRecommendationFeedbackEvent({
      eventType: recommendationFeedbackEventType.RESULT_COMPLETED,
      gameId: game.id,
      userId: input.userId,
    });

    if (shareToken) {
      await recordRecommendationFeedbackEvent({
        eventType: recommendationFeedbackEventType.SHARE_LINK_GENERATED,
        gameId: game.id,
        userId: input.userId,
      });
    }
  }

  if (finalizedStatus === "FAILED") {
    await recordRecommendationFeedbackEvent({
      eventType: recommendationFeedbackEventType.RUN_FAILED,
      gameId: game.id,
      userId: input.userId,
    });
  }

  return result.id;
}

export async function recordAbandonedRun(input: {
  userId: string;
  gameKey: string;
  difficulty: "EASY" | "NORMAL" | "HARD" | "EXPERT";
  elapsedSeconds?: number;
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
  const isQuickAbandon = typeof input.elapsedSeconds === "number"
    && Number.isFinite(input.elapsedSeconds)
    && input.elapsedSeconds >= 0
    && input.elapsedSeconds <= quickAbandonThresholdSeconds;

  await recordRecommendationFeedbackEvent({
    eventType: isQuickAbandon
      ? recommendationFeedbackEventType.RUN_QUICK_ABANDONED
      : recommendationFeedbackEventType.RUN_ABANDONED,
    gameId: game.id,
    userId: input.userId,
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

  await recordRecommendationFeedbackEvent({
    eventType: recommendationFeedbackEventType.RESULT_COMPLETED,
    gameId: result.gameId,
    userId: result.userId,
  });

  await recordRecommendationFeedbackEvent({
    eventType: recommendationFeedbackEventType.SHARE_LINK_GENERATED,
    gameId: result.gameId,
    userId: result.userId,
  });

  await rebuildAggregates();
  return result.id;
}
