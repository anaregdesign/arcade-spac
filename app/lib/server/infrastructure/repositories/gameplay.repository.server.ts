import { prisma } from "../prisma.server";
import { toStoredGameKey } from "../../../domain/entities/game-catalog";
import {
  createPlayResultRecordFixture,
  getPlayResultByIdFixture,
  getPlayResultByShareTokenFixture,
  getGameRecordFixture,
  listGameRecordsFixture,
  listUsersWithResultsFixture,
  replaceLeaderboardEntriesFixture,
  replaceUserGameSummariesFixture,
  replaceUserOverallSummariesFixture,
  updatePlayResultStatusFixture,
  updatePlayResultShareTokenFixture,
  withDevelopmentFixtures,
} from "./dev-fixtures.server";
import { ensureCanonicalGameCatalog } from "./game-catalog.repository.server";

type UpsertGameSummaryInput = {
  userId: string;
  gameId: number;
  currentRank: number | null;
  bestCompetitivePoints: number;
  personalBestMetric: number | null;
  playCount: number;
  completedCount: number;
  lastPlayedAt: Date | null;
  recommendationText: string | null;
};

type UpsertOverallSummaryInput = {
  userId: string;
  periodType: "SEASON" | "LIFETIME";
  totalPoints: number;
  currentRank: number | null;
  trendDelta: number;
  recentPlaySummary: string | null;
};

export async function getGameByKey(gameKey: string) {
  return withDevelopmentFixtures(
    async () => {
      await ensureCanonicalGameCatalog();
      return prisma.game.findFirst({
        where: { key: toStoredGameKey(gameKey) },
      });
    },
    () => getGameRecordFixture(gameKey),
  );
}

export async function createPlayResultRecord(input: {
  id: string;
  userId: string;
  gameId: number;
  difficulty: "EASY" | "NORMAL" | "HARD" | "EXPERT";
  status: "COMPLETED" | "FAILED" | "ABANDONED" | "PENDING_SAVE";
  cleared: boolean;
  leaderboardEligible: boolean;
  primaryMetric: number;
  secondaryMetric?: number | null;
  hintCount?: number | null;
  mistakeCount?: number | null;
  competitivePoints: number;
  totalPointsDelta?: number;
  rankDelta?: number | null;
  isPersonalBest?: boolean;
  summaryText: string;
  sharePath?: string | null;
  shareToken?: string | null;
}) {
  const now = new Date();

  return withDevelopmentFixtures(
    () => prisma.playResult.create({
      data: {
        ...input,
        startedAt: now,
        finishedAt: now,
        totalPointsDelta: input.totalPointsDelta ?? 0,
        rankDelta: input.rankDelta ?? null,
        isPersonalBest: input.isPersonalBest ?? false,
        sharePath: input.sharePath ?? null,
        shareToken: input.shareToken ?? null,
      },
    }),
    () => createPlayResultRecordFixture({
      ...input,
      totalPointsDelta: input.totalPointsDelta ?? 0,
      rankDelta: input.rankDelta ?? null,
      isPersonalBest: input.isPersonalBest ?? false,
      sharePath: input.sharePath ?? null,
      shareToken: input.shareToken ?? null,
    }),
  );
}

export async function updatePlayResultStatus(resultId: string, input: {
  status: "COMPLETED" | "FAILED" | "ABANDONED" | "PENDING_SAVE";
  leaderboardEligible: boolean;
  totalPointsDelta: number;
  rankDelta: number | null;
  summaryText: string;
}) {
  return withDevelopmentFixtures(
    () => prisma.playResult.update({
      where: { id: resultId },
      data: {
        status: input.status,
        leaderboardEligible: input.leaderboardEligible,
        totalPointsDelta: input.totalPointsDelta,
        rankDelta: input.rankDelta,
        summaryText: input.summaryText,
        finishedAt: new Date(),
      },
    }),
    () => updatePlayResultStatusFixture(resultId, input),
  );
}

export async function listUsersWithResults() {
  return withDevelopmentFixtures(
    () => prisma.user.findMany({
      include: {
        playResults: {
          where: {
            status: {
              in: ["COMPLETED", "PENDING_SAVE"],
            },
          },
          orderBy: {
            finishedAt: "desc",
          },
        },
      },
    }),
    () => listUsersWithResultsFixture(),
  );
}

export async function listGames() {
  return withDevelopmentFixtures(
    async () => {
      await ensureCanonicalGameCatalog();
      return prisma.game.findMany({
        orderBy: {
          name: "asc",
        },
      });
    },
    () => listGameRecordsFixture(),
  );
}

export async function replaceLeaderboardEntries(entries: Array<{
  periodType: "SEASON" | "LIFETIME";
  gameId?: number;
  userId: string;
  rank: number;
  points: number;
  deltaToLeader: number | null;
  deltaToNext: number | null;
}>) {
  return withDevelopmentFixtures(
    async () => {
      await prisma.leaderboardEntry.deleteMany();

      if (entries.length > 0) {
        await prisma.leaderboardEntry.createMany({
          data: entries,
        });
      }
    },
    () => replaceLeaderboardEntriesFixture(entries),
  );
}

export async function replaceUserGameSummaries(summaries: UpsertGameSummaryInput[]) {
  return withDevelopmentFixtures(
    async () => {
      await prisma.userGameSummary.deleteMany();

      if (summaries.length > 0) {
        await prisma.userGameSummary.createMany({
          data: summaries,
        });
      }
    },
    () => replaceUserGameSummariesFixture(summaries),
  );
}

export async function replaceUserOverallSummaries(summaries: UpsertOverallSummaryInput[]) {
  return withDevelopmentFixtures(
    async () => {
      await prisma.userOverallSummary.deleteMany();

      if (summaries.length > 0) {
        await prisma.userOverallSummary.createMany({
          data: summaries,
        });
      }
    },
    () => replaceUserOverallSummariesFixture(summaries),
  );
}

export async function getPlayResultById(resultId: string) {
  return withDevelopmentFixtures(
    () => prisma.playResult.findUnique({
      where: { id: resultId },
      include: {
        game: true,
        user: {
          include: {
            profile: true,
            playResults: {
              include: {
                game: true,
              },
              orderBy: {
                startedAt: "desc",
              },
            },
          },
        },
      },
    }),
    () => getPlayResultByIdFixture(resultId),
  );
}

export async function getPlayResultByShareToken(shareToken: string) {
  return withDevelopmentFixtures(
    () => prisma.playResult.findFirst({
      where: { shareToken },
      include: {
        game: true,
        user: {
          include: {
            profile: true,
            playResults: {
              include: {
                game: true,
              },
              orderBy: {
                startedAt: "desc",
              },
            },
          },
        },
      },
    }),
    () => getPlayResultByShareTokenFixture(shareToken),
  );
}

export async function updatePlayResultShareToken(resultId: string, shareToken: string) {
  return withDevelopmentFixtures(
    () => prisma.playResult.update({
      where: { id: resultId },
      data: {
        shareToken,
        sharePath: `/results/shared/${shareToken}`,
      },
    }),
    () => updatePlayResultShareTokenFixture(resultId, shareToken),
  );
}

export async function getLeaderboardSnapshot() {
  return prisma.leaderboardEntry.findMany({
    include: {
      user: true,
      game: true,
    },
    orderBy: [{ periodType: "asc" }, { rank: "asc" }],
  });
}
