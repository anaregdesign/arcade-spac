import {
  buildFeedbackContextForEventType,
  buildRecommendationContextKey,
  getRecommendationEventReward,
  type RecommendationFeedbackEventType,
} from "../../../domain/services/contextual-recommendation";
import { createUserFeedbackLog } from "../../infrastructure/repositories/user-feedback-log.repository.server";
import {
  applyFeedbackToSharedRecommendationModel,
  ensureSharedRecommendationModelInitialized,
} from "./shared-recommendation-model.server";

export async function recordRecommendationFeedbackEvent(input: {
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
    await ensureSharedRecommendationModelInitialized();
    modelReady = true;
  } catch {
    // Feedback logging should proceed even when model initialization is unavailable.
    modelReady = false;
  }

  try {
    const feedbackLog = await createUserFeedbackLog({
      userId: input.userId,
      gameId: input.gameId,
      eventType: input.eventType,
      reward,
      contextKey: buildRecommendationContextKey(buildFeedbackContextForEventType(input.eventType)),
    });

    if (modelReady) {
      applyFeedbackToSharedRecommendationModel({
        contextKey: feedbackLog.contextKey,
        gameId: feedbackLog.gameId,
        gameKey: String(feedbackLog.gameId),
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
