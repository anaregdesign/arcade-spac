import { prisma } from "../prisma.server";
import {
  getGameRecordFixture,
  getHomeDashboardRecordFixture,
  listGameRecordsFixture,
  listSignInUsersFixture,
  markOnboardingSeenFixture,
  withDevelopmentFixtures,
} from "./dev-fixtures.server";

export async function listSignInUsers() {
  return withDevelopmentFixtures(
    () => prisma.user.findMany({
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
    }),
    () => listSignInUsersFixture(),
  );
}

export async function getHomeDashboardRecord(userId: string) {
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
          take: 5,
        },
      },
    }),
    () => getHomeDashboardRecordFixture(userId),
  );
}

export async function getGameRecord(gameKey: string) {
  return withDevelopmentFixtures(
    () => prisma.game.findFirst({
      where: { key: gameKey.toUpperCase() as "MINESWEEPER" | "SUDOKU" },
    }),
    () => getGameRecordFixture(gameKey),
  );
}

export async function listGameRecords() {
  return withDevelopmentFixtures(
    () => prisma.game.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    () => listGameRecordsFixture(),
  );
}

export async function markOnboardingSeen(userId: string) {
  return withDevelopmentFixtures(
    () => prisma.user.update({
      where: { id: userId },
      data: {
        onboardingSeenAt: new Date(),
      },
    }),
    () => markOnboardingSeenFixture(userId),
  );
}