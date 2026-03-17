import {
  listGames,
  listUsersWithResults,
  replaceLeaderboardEntries,
  replaceUserGameSummaries,
  replaceUserOverallSummaries,
} from "../../infrastructure/repositories/gameplay.repository.server";

function recommendationForGame(gameName: string, rank: number | null, bestPoints: number) {
  if (rank === null) {
    return `Finish a ranked ${gameName} run to enter the leaderboard.`;
  }

  if (rank <= 1) {
    return `Protect the top ${gameName} spot with another clean run.`;
  }

  return `A stronger ${gameName} run can improve both rank and total points.`;
}

export async function rebuildAggregates() {
  const [users, games] = await Promise.all([listUsersWithResults(), listGames()]);

  const gameSummaryRows: Array<{
    userId: string;
    gameId: number;
    currentRank: number | null;
    bestCompetitivePoints: number;
    personalBestMetric: number | null;
    playCount: number;
    completedCount: number;
    lastPlayedAt: Date | null;
    recommendationText: string | null;
  }> = [];
  const overallSummaryRows: Array<{
    userId: string;
    periodType: "SEASON" | "LIFETIME";
    totalPoints: number;
    currentRank: number | null;
    trendDelta: number;
    recentPlaySummary: string | null;
  }> = [];
  const leaderboardRows: Array<{
    periodType: "SEASON" | "LIFETIME";
    gameId?: number;
    userId: string;
    rank: number;
    points: number;
    deltaToLeader: number | null;
    deltaToNext: number | null;
  }> = [];

  const perGameScorecards = games.map((game) => {
    const perUser = users.map((user) => {
      const gameResults = user.playResults.filter((result) => result.gameId === game.id);
      const rankedResults = gameResults.filter((result) => result.leaderboardEligible && result.status === "COMPLETED");
      const bestResult = rankedResults.sort((left, right) => right.competitivePoints - left.competitivePoints)[0] ?? null;

      return {
        userId: user.id,
        gameId: game.id,
        gameName: game.name,
        bestPoints: bestResult?.competitivePoints ?? 0,
        bestMetric: bestResult?.primaryMetric ?? null,
        isTenantVisible: user.visibilityScope === "TENANT_ONLY",
        playCount: gameResults.length,
        completedCount: gameResults.filter((result) => result.status === "COMPLETED").length,
        lastPlayedAt: gameResults[0]?.finishedAt ?? null,
      };
    });

    const rankedUsers = perUser
      .filter((entry) => entry.bestPoints > 0 && entry.isTenantVisible)
      .sort((left, right) => right.bestPoints - left.bestPoints);

    rankedUsers.forEach((entry, index) => {
      leaderboardRows.push({
        periodType: "SEASON",
        gameId: game.id,
        userId: entry.userId,
        rank: index + 1,
        points: entry.bestPoints,
        deltaToLeader: rankedUsers[0] ? rankedUsers[0].bestPoints - entry.bestPoints : 0,
        deltaToNext: rankedUsers[index + 1] ? entry.bestPoints - rankedUsers[index + 1].bestPoints : null,
      });
    });

    return { game, entries: perUser, rankedUsers };
  });

  users.forEach((user) => {
    const allUserResults = user.playResults;
    const latestResult = allUserResults[0] ?? null;
    const totalPoints = perGameScorecards.reduce((sum, scorecard) => {
      const entry = scorecard.entries.find((item) => item.userId === user.id);
      return sum + (entry?.bestPoints ?? 0);
    }, 0);

    perGameScorecards.forEach((scorecard) => {
      const entry = scorecard.entries.find((item) => item.userId === user.id);
      const rankEntry = scorecard.rankedUsers.findIndex((item) => item.userId === user.id);

      if (!entry) {
        return;
      }

      gameSummaryRows.push({
        userId: user.id,
        gameId: scorecard.game.id,
        currentRank: rankEntry >= 0 ? rankEntry + 1 : null,
        bestCompetitivePoints: entry.bestPoints,
        personalBestMetric: entry.bestMetric,
        playCount: entry.playCount,
        completedCount: entry.completedCount,
        lastPlayedAt: entry.lastPlayedAt,
        recommendationText: recommendationForGame(scorecard.game.name, rankEntry >= 0 ? rankEntry + 1 : null, entry.bestPoints),
      });
    });

    overallSummaryRows.push({
      userId: user.id,
      periodType: "SEASON",
      totalPoints,
      currentRank: null,
      trendDelta: latestResult?.rankDelta ?? 0,
      recentPlaySummary: latestResult?.summaryText ?? "No recent activity.",
    });
    overallSummaryRows.push({
      userId: user.id,
      periodType: "LIFETIME",
      totalPoints,
      currentRank: null,
      trendDelta: 0,
      recentPlaySummary: latestResult?.summaryText ?? "No recent activity.",
    });
  });

  const overallRanked = [...overallSummaryRows]
    .filter((entry) => entry.periodType === "SEASON")
    .filter((entry) => users.find((user) => user.id === entry.userId)?.visibilityScope === "TENANT_ONLY")
    .sort((left, right) => right.totalPoints - left.totalPoints);

  overallRanked.forEach((entry, index) => {
    entry.currentRank = index + 1;
    leaderboardRows.push({
      periodType: "SEASON",
      userId: entry.userId,
      rank: index + 1,
      points: entry.totalPoints,
      deltaToLeader: overallRanked[0] ? overallRanked[0].totalPoints - entry.totalPoints : 0,
      deltaToNext: overallRanked[index + 1] ? entry.totalPoints - overallRanked[index + 1].totalPoints : null,
    });
  });

  const lifetimeRanked = [...overallSummaryRows]
    .filter((entry) => entry.periodType === "LIFETIME")
    .filter((entry) => users.find((user) => user.id === entry.userId)?.visibilityScope === "TENANT_ONLY")
    .sort((left, right) => right.totalPoints - left.totalPoints);

  lifetimeRanked.forEach((entry, index) => {
    entry.currentRank = index + 1;
    leaderboardRows.push({
      periodType: "LIFETIME",
      userId: entry.userId,
      rank: index + 1,
      points: entry.totalPoints,
      deltaToLeader: lifetimeRanked[0] ? lifetimeRanked[0].totalPoints - entry.totalPoints : 0,
      deltaToNext: lifetimeRanked[index + 1] ? entry.totalPoints - lifetimeRanked[index + 1].totalPoints : null,
    });
  });

  await Promise.all([
    replaceUserGameSummaries(gameSummaryRows),
    replaceUserOverallSummaries(overallSummaryRows),
    replaceLeaderboardEntries(leaderboardRows),
  ]);
}
