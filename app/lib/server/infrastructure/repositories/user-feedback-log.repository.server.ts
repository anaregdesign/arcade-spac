import { toRouteGameKey } from "../../../domain/entities/game-catalog";
import { prisma } from "../prisma.server";
import {
  createUserFeedbackLogFixture,
  listRecentUserFeedbackLogsFixture,
  withDevelopmentFixtures,
} from "./dev-fixtures.server";

export type UserFeedbackLogRecord = {
  contextKey: string;
  eventType: string;
  gameId: number;
  gameKey: string;
  id: string;
  loggedAt: Date;
  reward: number;
  userId: string;
};

export async function createUserFeedbackLog(input: {
  contextKey?: string;
  eventType: string;
  gameId: number;
  loggedAt?: Date;
  reward: number;
  userId: string;
}) {
  return withDevelopmentFixtures(
    () => prisma.userFeedbackLog.create({
      data: {
        contextKey: input.contextKey ?? "global",
        eventType: input.eventType,
        gameId: input.gameId,
        loggedAt: input.loggedAt,
        reward: input.reward,
        userId: input.userId,
      },
    }),
    () => createUserFeedbackLogFixture({
      contextKey: input.contextKey,
      eventType: input.eventType,
      gameId: input.gameId,
      loggedAt: input.loggedAt,
      reward: input.reward,
      userId: input.userId,
    }),
  );
}

export async function listRecentUserFeedbackLogs(limit = 1000): Promise<UserFeedbackLogRecord[]> {
  const records = await withDevelopmentFixtures(
    () => prisma.userFeedbackLog.findMany({
      include: {
        game: {
          select: {
            key: true,
          },
        },
      },
      orderBy: {
        loggedAt: "desc",
      },
      take: limit,
    }),
    () => listRecentUserFeedbackLogsFixture(limit),
  );

  return records.map((record) => ({
    contextKey: record.contextKey,
    eventType: record.eventType,
    gameId: record.gameId,
    gameKey: toRouteGameKey(record.game.key),
    id: record.id,
    loggedAt: record.loggedAt,
    reward: record.reward,
    userId: record.userId,
  }));
}
