import {
  buildFeedbackContextForEventType,
  buildRecommendationContextKey,
  getRecommendationEventReward,
  type RecommendationFeedbackEventType,
} from "../../../domain/services/contextual-ucb-recommendation";
import { createUserFeedbackLog } from "../../infrastructure/repositories/user-feedback-log.repository.server";

export async function recordRecommendationFeedbackEvent(input: {
  eventType: RecommendationFeedbackEventType;
  gameId: number;
  userId: string;
}) {
  const reward = getRecommendationEventReward(input.eventType);

  if (reward === 0) {
    return false;
  }

  try {
    await createUserFeedbackLog({
      userId: input.userId,
      gameId: input.gameId,
      eventType: input.eventType,
      reward,
      contextKey: buildRecommendationContextKey(buildFeedbackContextForEventType(input.eventType)),
    });

    return true;
  } catch {
    // Feedback logging is best-effort and should not block user-facing flows.
    return false;
  }
}
