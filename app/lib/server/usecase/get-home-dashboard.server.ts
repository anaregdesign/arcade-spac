import { getHomeDashboardRecord, getGameRecord } from "../infrastructure/repositories/arcade-dashboard.repository.server";

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export async function getHomeDashboard(userId: string) {
  const record = await getHomeDashboardRecord(userId);

  if (!record) {
    throw new Response("User not found", { status: 404 });
  }

  const seasonSummary = record.overallSummaries.find((summary) => summary.periodType === "SEASON");
  const lifetimeSummary = record.overallSummaries.find((summary) => summary.periodType === "LIFETIME");

  return {
    user: {
      displayName: record.displayName,
      avatarUrl: record.avatarUrl,
      tagline: record.profile?.tagline ?? "",
      streakDays: record.profile?.streakDays ?? 0,
      totalPlayCount: record.profile?.totalPlayCount ?? 0,
    },
    summaries: {
      seasonPoints: seasonSummary?.totalPoints ?? 0,
      seasonRank: seasonSummary?.currentRank ?? null,
      lifetimePoints: lifetimeSummary?.totalPoints ?? 0,
      trendDelta: seasonSummary?.trendDelta ?? 0,
      recentPlaySummary: seasonSummary?.recentPlaySummary ?? "No recent summary available.",
    },
    games: record.gameSummaries.map((summary) => ({
      key: summary.game.key.toLowerCase(),
      name: summary.game.name,
      shortDescription: summary.game.shortDescription,
      accentColor: summary.game.accentColor,
      currentRank: summary.currentRank,
      bestCompetitivePoints: summary.bestCompetitivePoints,
      personalBestMetric: summary.personalBestMetric,
      playCount: summary.playCount,
      completedCount: summary.completedCount,
      recommendationText: summary.recommendationText,
      metricLabel: summary.game.key === "MINESWEEPER" ? "Best clear time" : "Best solve time",
      metricValue: summary.personalBestMetric ? formatDuration(summary.personalBestMetric) : "No record yet",
    })),
    recentResults: record.playResults.map((result) => ({
      id: result.id,
      gameName: result.game.name,
      status: result.status,
      summaryText: result.summaryText,
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
    key: game.key.toLowerCase(),
    name: game.name,
    shortDescription: game.shortDescription,
    rulesSummary: game.rulesSummary,
    accentColor: game.accentColor,
  };
}