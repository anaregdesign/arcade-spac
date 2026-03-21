import { toRouteGameKey } from "../../domain/entities/game-catalog";
import { formatOptionalPrimaryMetric } from "../../domain/services/game-metrics";
import { getProfileRecord, listRankingGames } from "../infrastructure/repositories/rankings-profile.repository.server";

export type ProfileView = {
  profile: {
    displayName: string;
    visibilityScope: "TENANT_ONLY" | "PRIVATE";
    tagline: string;
    favoriteGames: Array<{
      key: string;
      name: string;
    }>;
    favoriteSummary: string;
    themePreference: "LIGHT" | "DARK";
    sharePreviewName: string;
    visibilitySummary: string;
    shareSummary: string;
  };
  activity: {
    streakDays: number;
    totalPlayCount: number;
    lastPlayedAt: string | null;
  };
  overall: Array<{
    period: string;
    totalPoints: number;
    currentRank: number | null;
    trendDelta: number;
    recentPlaySummary: string;
  }>;
  games: Array<{
    key: string;
    name: string;
    isFavorite: boolean;
    currentRank: number | null;
    bestCompetitivePoints: number;
    personalBestMetric: string;
    playCount: number;
    completedCount: number;
    recommendationText: string;
    contributionShare: number;
  }>;
  breakdown: {
    totalPoints: number;
    items: Array<{
      key: string;
      name: string;
      points: number;
      contributionShare: number;
      rankLabel: string;
      recommendationText: string;
    }>;
  };
  growthGuidance: {
    title: string;
    detail: string;
  };
  trend: Array<{
    index: number;
    gameName: string;
    status: string;
    totalPointsDelta: number;
    competitivePoints: number;
    label: string;
  }>;
};

export async function getProfileView(userId: string): Promise<ProfileView> {
  const [record, games] = await Promise.all([
    getProfileRecord(userId),
    listRankingGames(),
  ]);

  if (!record) {
    throw new Response("User not found", { status: 404 });
  }

  const summaryByGameId = new Map(record.gameSummaries.map((summary) => [summary.gameId, summary]));
  const favoriteGameIds = new Set(record.favorites.map((favorite) => favorite.gameId));
  const favoriteGames = record.favorites.map((favorite) => ({
    key: toRouteGameKey(favorite.game.key),
    name: favorite.game.name,
  }));
  const gameSummaries = games.map((game) => {
    const summary = summaryByGameId.get(game.id);

    return {
      key: toRouteGameKey(game.key),
      name: game.name,
      isFavorite: favoriteGameIds.has(game.id),
      currentRank: summary?.currentRank ?? null,
      bestCompetitivePoints: summary?.bestCompetitivePoints ?? 0,
      personalBestMetric: formatOptionalPrimaryMetric(game.key, summary?.personalBestMetric ?? null),
      playCount: summary?.playCount ?? 0,
      completedCount: summary?.completedCount ?? 0,
      recommendationText: summary?.recommendationText ?? "Finish a ranked run to add this game to your overall score.",
    };
  });
  const totalPoints = gameSummaries.reduce((sum, game) => sum + game.bestCompetitivePoints, 0);
  const breakdownItems = gameSummaries.map((game) => ({
    ...game,
    points: game.bestCompetitivePoints,
    contributionShare: totalPoints > 0 ? Math.round((game.bestCompetitivePoints / totalPoints) * 100) : 0,
    rankLabel: game.currentRank ? `Rank #${game.currentRank}` : "Unranked",
  }));
  const focusGame = breakdownItems
    .slice()
    .sort((left, right) => {
      const leftRank = left.currentRank ?? Number.POSITIVE_INFINITY;
      const rightRank = right.currentRank ?? Number.POSITIVE_INFINITY;
      return rightRank - leftRank || left.bestCompetitivePoints - right.bestCompetitivePoints;
    })[0] ?? null;

  return {
    profile: {
      displayName: record.displayName,
      visibilityScope: record.visibilityScope === "PRIVATE" ? "PRIVATE" : "TENANT_ONLY",
      tagline: record.profile?.tagline ?? "",
      favoriteGames,
      favoriteSummary: favoriteGames.length === 0 ? "No favorites yet" : favoriteGames.length === 1 ? favoriteGames[0]?.name ?? "No favorites yet" : `${favoriteGames.length} favorites saved`,
      themePreference: record.profile?.themePreference === "DARK" ? "DARK" : "LIGHT",
      sharePreviewName: record.displayName,
      visibilitySummary: record.visibilityScope === "PRIVATE" ? "Private profiles stay out of rankings until visibility is changed." : "Rankings and in-app views use this display name for signed-in players.",
      shareSummary: record.visibilityScope === "PRIVATE" ? "Share popups still copy game links, but private visibility keeps your scores out of shared ranking views." : "Result share popups copy game links while rankings continue to use this display name preview.",
    },
    activity: {
      streakDays: record.profile?.streakDays ?? 0,
      totalPlayCount: record.profile?.totalPlayCount ?? 0,
      lastPlayedAt: record.profile?.lastPlayedAt?.toISOString() ?? null,
    },
    overall: record.overallSummaries.map((summary) => ({
      period: summary.periodType,
      totalPoints: summary.totalPoints,
      currentRank: summary.currentRank,
      trendDelta: summary.trendDelta,
      recentPlaySummary: summary.recentPlaySummary ?? "No recent summary available.",
    })),
    games: breakdownItems,
    breakdown: {
      totalPoints,
      items: breakdownItems,
    },
    growthGuidance: {
      title: focusGame ? `Next growth lane: ${focusGame.name}` : "Next growth lane",
      detail: focusGame ? focusGame.recommendationText : "Record a completed run to unlock specific improvement guidance.",
    },
    trend: record.playResults
      .slice()
      .reverse()
      .map((result, index) => ({
        index,
        gameName: result.game.name,
        status: result.status,
        totalPointsDelta: result.totalPointsDelta,
        competitivePoints: result.competitivePoints,
        label: result.startedAt.toISOString().slice(5, 10),
      })),
  };
}
