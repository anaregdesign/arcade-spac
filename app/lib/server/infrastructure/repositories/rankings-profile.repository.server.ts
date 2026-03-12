import { prisma } from "../prisma.server";
import {
  getProfileRecordFixture,
  listLeaderboardEntriesFixture,
  listRankingGamesFixture,
  updateProfileRecordFixture,
  withDevelopmentFixtures,
} from "./dev-fixtures.server";

type RankingPeriod = "SEASON" | "LIFETIME";
type RankingScope = "overall" | "minesweeper" | "sudoku";
type FavoriteGame = "MINESWEEPER" | "SUDOKU" | null;
type VisibilityScope = "TENANT_ONLY" | "PRIVATE";

export async function listRankingGames() {
  return withDevelopmentFixtures(
    () => prisma.game.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    () => listRankingGamesFixture(),
  );
}

export async function listLeaderboardEntries(periodType: RankingPeriod, scope: RankingScope) {
  return withDevelopmentFixtures(
    () => prisma.leaderboardEntry.findMany({
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
    }),
    () => listLeaderboardEntriesFixture(periodType, scope),
  );
}

export async function getProfileRecord(userId: string) {
  return withDevelopmentFixtures(
    () => prisma.user.findUnique({
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
    }),
    () => getProfileRecordFixture(userId),
  );
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

  return withDevelopmentFixtures(
    () => prisma.user.update({
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
    }),
    () => updateProfileRecordFixture({
      ...input,
      displayName: trimmedDisplayName,
      tagline: trimmedTagline,
    }),
  );
}