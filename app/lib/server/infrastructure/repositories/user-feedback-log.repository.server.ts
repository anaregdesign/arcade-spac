import type {
  CreateRecommendationFeedbackLogInput,
  RecommendationFeedbackLogRecord,
  RecommendationFeedbackLogRepository,
} from "../../../domain/repositories/recommendation-feedback-log.repository";
import { prisma } from "../prisma.server";
import {
  createUserFeedbackLogFixture,
  listRecentUserFeedbackLogsFixture,
  withDevelopmentFixtures,
} from "./dev-fixtures.server";

type UserFeedbackLogPersistenceRecord = {
  contextKey: string;
  eventType: string;
  gameId: number;
  id: string;
  loggedAt: Date;
  reward: number;
  userId: string;
};

function mapToRecommendationFeedbackLogRecord(record: UserFeedbackLogPersistenceRecord): RecommendationFeedbackLogRecord {
  return {
    contextKey: record.contextKey,
    eventType: record.eventType,
    gameId: record.gameId,
    id: record.id,
    loggedAt: record.loggedAt,
    reward: record.reward,
    userId: record.userId,
  };
}

export class PrismaRecommendationFeedbackLogRepository implements RecommendationFeedbackLogRepository {
  async create(input: CreateRecommendationFeedbackLogInput): Promise<RecommendationFeedbackLogRecord> {
    const record = await withDevelopmentFixtures(
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

    return mapToRecommendationFeedbackLogRecord(record);
  }

  async listRecent(limit = 1000): Promise<RecommendationFeedbackLogRecord[]> {
    const take = Math.max(0, Math.floor(limit));
    const records = await withDevelopmentFixtures(
      () => prisma.userFeedbackLog.findMany({
        orderBy: {
          loggedAt: "desc",
        },
        take,
      }),
      () => listRecentUserFeedbackLogsFixture(take),
    );

    return records.map(mapToRecommendationFeedbackLogRecord);
  }
}

export const recommendationFeedbackLogRepository = new PrismaRecommendationFeedbackLogRepository();
