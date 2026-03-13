import { listLeaderboardEntries, listRankingGames } from "../infrastructure/repositories/rankings-profile.repository.server";

type RankingPeriod = "SEASON" | "LIFETIME";
type RankingScope = "overall" | "minesweeper" | "sudoku";

function formatGapPoints(points: number | null) {
  return points === null ? "No nearby rival yet" : `${points} pts`;
}

function buildLeaderGapCopy(points: number | null) {
  if (points === 0) {
    return "You lead this board right now.";
  }

  return points === null ? "Leader gap opens after a ranked result appears." : `${points} pts behind the leader.`;
}

function buildRivalGapCopy(rank: number, points: number | null) {
  if (points === null) {
    return rank === 1 ? "No one directly behind yet." : "No player directly behind on this board.";
  }

  return rank === 1 ? `Leading #2 by ${points} pts.` : `Leading the next player by ${points} pts.`;
}

export async function getRankingsView(userId: string, input: { period: RankingPeriod; scope: RankingScope }) {
  const [entries, games] = await Promise.all([
    listLeaderboardEntries(input.period, input.scope),
    listRankingGames(),
  ]);

  const currentUserEntry = entries.find((entry) => entry.userId === userId) ?? null;
  const selectedGame = input.scope === "overall" ? null : games.find((game) => game.key.toLowerCase() === input.scope) ?? null;

  return {
    filter: input,
    boardMeta: {
      boardLabel: input.scope === "overall" ? "Overall" : selectedGame?.name ?? "Game",
      periodLabel: input.period === "SEASON" ? "Season" : "Lifetime",
      visibilityNote: "Rankings show player display names. Private visibility stays out of shared boards and Teams shares until it is changed on Profile.",
    },
    games: games.map((game) => ({
      key: game.key.toLowerCase(),
      name: game.name,
    })),
    currentUserEntry: currentUserEntry
      ? {
          rank: currentUserEntry.rank,
          points: currentUserEntry.points,
          deltaToLeader: currentUserEntry.deltaToLeader,
          deltaToNext: currentUserEntry.deltaToNext,
          gameName: currentUserEntry.game?.name ?? "Overall",
          leaderGapCopy: buildLeaderGapCopy(currentUserEntry.deltaToLeader),
          rivalGapCopy: buildRivalGapCopy(currentUserEntry.rank, currentUserEntry.deltaToNext),
        }
      : null,
    entries: entries.map((entry) => ({
      id: entry.id,
      rank: entry.rank,
      displayName: entry.user.displayName,
      points: entry.points,
      deltaToLeader: entry.deltaToLeader,
      deltaToNext: entry.deltaToNext,
      gameName: entry.game?.name ?? "Overall",
      isCurrentUser: entry.userId === userId,
      isNearbyRival: currentUserEntry ? Math.abs(entry.rank - currentUserEntry.rank) === 1 : false,
      leaderGapCopy: buildLeaderGapCopy(entry.deltaToLeader),
      rivalGapCopy: buildRivalGapCopy(entry.rank, entry.deltaToNext),
      leaderGapValue: formatGapPoints(entry.deltaToLeader),
      rivalGapValue: formatGapPoints(entry.deltaToNext),
    })),
  };
}