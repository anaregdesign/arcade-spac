import { getProfileRecord } from "../infrastructure/repositories/rankings-profile.repository.server";

export type ProfileView = {
  profile: {
    displayName: string;
    visibilityScope: "TENANT_ONLY" | "PRIVATE";
    tagline: string;
    favoriteGame: string;
    themePreference: "LIGHT" | "DARK";
    sharePreviewName: string;
    visibilitySummary: string;
    teamsShareSummary: string;
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

function formatDuration(totalSeconds: number | null) {
  if (totalSeconds === null) {
    return "No record yet";
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export async function getProfileView(userId: string): Promise<ProfileView> {
  const record = await getProfileRecord(userId);

  if (!record) {
    throw new Response("User not found", { status: 404 });
  }

  const gameSummaries = record.gameSummaries.map((summary) => ({
    key: summary.game.key.toLowerCase(),
    name: summary.game.name,
    currentRank: summary.currentRank,
    bestCompetitivePoints: summary.bestCompetitivePoints,
    personalBestMetric: formatDuration(summary.personalBestMetric),
    playCount: summary.playCount,
    completedCount: summary.completedCount,
    recommendationText: summary.recommendationText ?? "Keep pushing this game to improve your overall position.",
  }));
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
      favoriteGame: record.profile?.favoriteGame?.toLowerCase() ?? "",
      themePreference: record.profile?.themePreference === "DARK" ? "DARK" : "LIGHT",
      sharePreviewName: record.displayName,
      visibilitySummary: record.visibilityScope === "PRIVATE" ? "Private profiles stay out of rankings until visibility is changed." : "Rankings and in-app views use this display name inside the tenant.",
      teamsShareSummary: record.visibilityScope === "PRIVATE" ? "Teams shares stay disabled until the result itself is eligible, and private visibility keeps your profile out of public ranking views." : "Teams result shares use the same display name preview that appears in rankings.",
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
