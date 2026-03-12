import { prisma } from "../prisma.server";

type RankingPeriod = "SEASON" | "LIFETIME";
type RankingScope = "overall" | "minesweeper" | "sudoku";
type FavoriteGame = "MINESWEEPER" | "SUDOKU" | null;
type VisibilityScope = "TENANT_ONLY" | "PRIVATE";

export async function listRankingGames() {
  return prisma.game.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function listLeaderboardEntries(periodType: RankingPeriod, scope: RankingScope) {
  return prisma.leaderboardEntry.findMany({
    where: {
      periodType,
      ...(scope === "overall" ? { gameId: null } : { game: { key: scope.toUpperCase() as "MINESWEEPER" | "SUDOKU" } }),
    },
    include: {
      user: true,
      game: true,
    },
    orderBy: {
      rank: "asc",
    },
  });
}

export async function getProfileRecord(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      overallSummaries: {
        orderBy: {
          periodType: "asc",
        },
      },
      gameSummaries: {
        include: {
          game: true,
        },
        orderBy: {
          game: {
            name: "asc",
          },
        },
      },
      playResults: {
        include: {
          game: true,
        },
        orderBy: {
          startedAt: "desc",
        },
        take: 12,
      },
    },
  });
}

export async function updateProfileRecord(input: {
  userId: string;
  displayName: string;
  visibilityScope: VisibilityScope;
  tagline: string;
  favoriteGame: FavoriteGame;
}) {
  const trimmedDisplayName = input.displayName.trim();
  const trimmedTagline = input.tagline.trim();

  return prisma.user.update({
    where: { id: input.userId },
    data: {
      displayName: trimmedDisplayName,
      visibilityScope: input.visibilityScope,
      profile: {
        upsert: {
          create: {
            tagline: trimmedTagline,
            favoriteGame: input.favoriteGame,
          },
          update: {
            tagline: trimmedTagline,
            favoriteGame: input.favoriteGame,
          },
        },
      },
    },
  });
}