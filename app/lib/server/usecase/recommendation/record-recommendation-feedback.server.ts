import type { RecommendationFeedbackLogRepository } from "../../../domain/repositories/recommendation-feedback-log.repository";
import {
  buildFeedbackContextForEventType,
  buildRecommendationContextKey,
  getRecommendationEventReward,
  type RecommendationFeedbackEventType,
} from "../../../domain/services/contextual-recommendation";
import { recommendationFeedbackLogRepository } from "../../infrastructure/repositories/user-feedback-log.repository.server";
import {
  getSharedRecommendationModel,
  type SharedRecommendationModel,
} from "./shared-recommendation-model.server";

export class RecordRecommendationFeedbackUseCase {
  constructor(
    private readonly feedbackLogRepository: RecommendationFeedbackLogRepository,
    private readonly sharedRecommendationModel: SharedRecommendationModel,
  ) {}

  async execute(input: {
    eventType: RecommendationFeedbackEventType;
    gameId: number;
    userId: string;
  }) {
    const reward = getRecommendationEventReward(input.eventType);

    if (reward === 0) {
      return false;
    }

    let modelReady = false;

    try {
      await this.sharedRecommendationModel.ensureInitialized();
      modelReady = true;
    } catch {
      // Feedback logging should proceed even when model initialization is unavailable.
      modelReady = false;
    }

    try {
      const feedbackLog = await this.feedbackLogRepository.create({
        userId: input.userId,
        gameId: input.gameId,
        eventType: input.eventType,
        reward,
        contextKey: buildRecommendationContextKey(buildFeedbackContextForEventType(input.eventType)),
      });

      if (modelReady) {
        this.sharedRecommendationModel.applyFeedback({
          contextKey: feedbackLog.contextKey,
          gameId: feedbackLog.gameId,
          loggedAt: feedbackLog.loggedAt,
          reward: feedbackLog.reward,
        });
      }

      return true;
    } catch {
      // Feedback logging is best-effort and should not block user-facing flows.
      return false;
    }
  }
}

const recordRecommendationFeedbackUseCase = new RecordRecommendationFeedbackUseCase(
  recommendationFeedbackLogRepository,
  getSharedRecommendationModel(),
);

export async function recordRecommendationFeedbackEvent(input: {
  eventType: RecommendationFeedbackEventType;
  gameId: number;
  userId: string;
}) {
  return recordRecommendationFeedbackUseCase.execute(input);
}
