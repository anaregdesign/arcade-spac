import { getHomeDashboardRecord, getGameRecord, listGameRecords } from "../infrastructure/repositories/arcade-dashboard.repository.server";

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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
    games: games.map((game) => {
      const summary = summaryByGameId.get(game.id);

      return {
        key: game.key.toLowerCase(),
        name: game.name,
        shortDescription: game.shortDescription,
        accentColor: game.accentColor,
        currentRank: summary?.currentRank ?? null,
        bestCompetitivePoints: summary?.bestCompetitivePoints ?? 0,
        personalBestMetric: summary?.personalBestMetric ?? null,
        playCount: summary?.playCount ?? 0,
        completedCount: summary?.completedCount ?? 0,
        recommendationText: summary?.recommendationText ?? null,
        metricLabel: game.key === "MINESWEEPER" ? "Best clear time" : "Best solve time",
        metricValue: summary?.personalBestMetric ? formatDuration(summary.personalBestMetric) : "No record yet",
      };
    }),
    recentResults: record.playResults.map((result) => ({
      id: result.id,
      gameName: result.game.name,
      status: result.status,
      summaryText: result.summaryText,
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
    key: game.key.toLowerCase(),
    name: game.name,
    shortDescription: game.shortDescription,
    rulesSummary: game.rulesSummary,
    accentColor: game.accentColor,
  };
}