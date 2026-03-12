import { getProfileRecord } from "../infrastructure/repositories/rankings-profile.repository.server";

function formatDuration(totalSeconds: number | null) {
  if (totalSeconds === null) {
    return "No record yet";
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export async function getProfileView(userId: string) {
  const record = await getProfileRecord(userId);

  if (!record) {
    throw new Response("User not found", { status: 404 });
  }

  return {
    profile: {
      displayName: record.displayName,
      visibilityScope: record.visibilityScope,
      tagline: record.profile?.tagline ?? "",
      favoriteGame: record.profile?.favoriteGame?.toLowerCase() ?? "",
      sharePreviewName: record.displayName,
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
    games: record.gameSummaries.map((summary) => ({
      key: summary.game.key.toLowerCase(),
      name: summary.game.name,
      currentRank: summary.currentRank,
      bestCompetitivePoints: summary.bestCompetitivePoints,
      personalBestMetric: formatDuration(summary.personalBestMetric),
      playCount: summary.playCount,
      completedCount: summary.completedCount,
      recommendationText: summary.recommendationText ?? "Keep pushing this game to improve your overall position.",
    })),
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