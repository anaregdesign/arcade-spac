import { prisma } from "../prisma.server";

export async function listSignInUsers() {
  return prisma.user.findMany({
    include: {
      profile: true,
      overallSummaries: {
        where: { periodType: "SEASON" },
      },
      gameSummaries: {
        include: {
          game: true,
        },
      },
    },
    orderBy: {
      displayName: "asc",
    },
  });
}

export async function getHomeDashboardRecord(userId: string) {
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
        take: 5,
      },
    },
  });
}

export async function getGameRecord(gameKey: string) {
  return prisma.game.findFirst({
    where: { key: gameKey.toUpperCase() as "MINESWEEPER" | "SUDOKU" },
  });
}

export async function listGameRecords() {
  return prisma.game.findMany({
    orderBy: {
      name: "asc",
    },
  });
}