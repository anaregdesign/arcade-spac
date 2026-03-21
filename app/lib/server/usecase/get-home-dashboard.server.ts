import { toRouteGameKey } from "../../domain/entities/game-catalog";
import {
  buildHomeRecommendationContext,
  toRecommendationScoreMap,
} from "../../domain/services/contextual-recommendation";
import { formatOptionalPrimaryMetric, getBestMetricLabel } from "../../domain/services/game-metrics";
import { getHomeDashboardRecord, getGameRecord, listGameRecords } from "../infrastructure/repositories/arcade-dashboard.repository.server";
import { rankRecommendationsWithSharedModel } from "./recommendation/shared-recommendation-model.server";

function normalizeRecentResultSummary(gameName: string, summaryText: string) {
  if (!summaryText) {
    return summaryText;
  }

  if (summaryText.startsWith(gameName)) {
    return summaryText;
  }

  return `${gameName} ${summaryText.charAt(0).toLowerCase()}${summaryText.slice(1)}`;
}

function computeLegacyHomeRecommendationScore(input: {
  bestCompetitivePoints: number;
  currentRank: number | null;
  playCount: number;
}) {
  return (input.playCount === 0 ? 1_000_000 : 0)
    + (input.currentRank ? 10_000 - input.currentRank : 0)
    + input.bestCompetitivePoints;
}

export async function getHomeDashboard(userId: string) {
  const [record, games] = await Promise.all([
    getHomeDashboardRecord(userId),
    listGameRecords(),
  ]);

  if (!record) {
    throw new Response("User not found", { status: 404 });
  }

  const seasonSummary = record.overallSummaries.find((summary) => summary.periodType === "SEASON");
  const lifetimeSummary = record.overallSummaries.find((summary) => summary.periodType === "LIFETIME");
  const summaryByGameId = new Map(record.gameSummaries.map((summary) => [summary.gameId, summary]));
  const favoriteGameKeys = new Set(record.favorites.map((favorite) => toRouteGameKey(favorite.game.key)));
  const recommendationRanking = await rankRecommendationsWithSharedModel({
    candidates: games.map((game) => {
      const summary = summaryByGameId.get(game.id);
      const playCount = summary?.playCount ?? 0;
      const completedCount = summary?.completedCount ?? 0;
      const currentRank = summary?.currentRank ?? null;
      const bestCompetitivePoints = summary?.bestCompetitivePoints ?? 0;

      return {
        armKey: toRouteGameKey(game.key),
        armIndex: game.id,
        context: buildHomeRecommendationContext({
          completedCount,
          playCount,
        }),
        baseScore: computeLegacyHomeRecommendationScore({
          bestCompetitivePoints,
          currentRank,
          playCount,
        }),
      };
    }),
  });
  const recommendationScoreByGameKey = toRecommendationScoreMap(recommendationRanking);

  return {
    user: {
      displayName: record.displayName,
      avatarUrl: record.avatarUrl,
      tagline: record.profile?.tagline ?? "",
      streakDays: record.profile?.streakDays ?? 0,
      totalPlayCount: record.profile?.totalPlayCount ?? 0,
      onboardingSeenAt: record.onboardingSeenAt?.toISOString() ?? null,
    },
    onboarding: {
      showGuide: !record.onboardingSeenAt,
    },
    summaries: {
      seasonPoints: seasonSummary?.totalPoints ?? 0,
      seasonRank: seasonSummary?.currentRank ?? null,
      lifetimePoints: lifetimeSummary?.totalPoints ?? 0,
      trendDelta: seasonSummary?.trendDelta ?? 0,
      recentPlaySummary: seasonSummary?.recentPlaySummary ?? "No recent summary available.",
    },
    games: games.map((game) => {
      const summary = summaryByGameId.get(game.id);

      return {
        key: toRouteGameKey(game.key),
        name: game.name,
        shortDescription: game.shortDescription,
        accentColor: game.accentColor,
        currentRank: summary?.currentRank ?? null,
        bestCompetitivePoints: summary?.bestCompetitivePoints ?? 0,
        personalBestMetric: summary?.personalBestMetric ?? null,
        playCount: summary?.playCount ?? 0,
        completedCount: summary?.completedCount ?? 0,
        isFavorite: favoriteGameKeys.has(toRouteGameKey(game.key)),
        recommendationText: summary?.recommendationText ?? null,
        recommendationScore: recommendationScoreByGameKey.get(toRouteGameKey(game.key)) ?? 0,
        metricLabel: getBestMetricLabel(game.key),
        metricValue: formatOptionalPrimaryMetric(game.key, summary?.personalBestMetric ?? null),
      };
    }),
    recentResults: record.playResults.map((result) => ({
      id: result.id,
      gameName: result.game.name,
      status: result.status,
      summaryText: normalizeRecentResultSummary(result.game.name, result.summaryText),
      resultPath: `/results/${result.id}`,
      totalPointsDelta: result.totalPointsDelta,
      startedAt: result.startedAt.toISOString(),
    })),
  };
}

export async function getGameWorkspace(gameKey: string) {
  const game = await getGameRecord(gameKey);

  if (!game) {
    throw new Response("Game not found", { status: 404 });
  }

  return {
    key: toRouteGameKey(game.key),
    name: game.name,
    shortDescription: game.shortDescription,
    rulesSummary: game.rulesSummary,
    accentColor: game.accentColor,
  };
}
