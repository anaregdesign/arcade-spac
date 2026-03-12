import { listLeaderboardEntries, listRankingGames } from "../infrastructure/repositories/rankings-profile.repository.server";

type RankingPeriod = "SEASON" | "LIFETIME";
type RankingScope = "overall" | "minesweeper" | "sudoku";

export async function getRankingsView(userId: string, input: { period: RankingPeriod; scope: RankingScope }) {
  const [entries, games] = await Promise.all([
    listLeaderboardEntries(input.period, input.scope),
    listRankingGames(),
  ]);

  const currentUserEntry = entries.find((entry) => entry.userId === userId) ?? null;

  return {
    filter: input,
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
    })),
  };
}