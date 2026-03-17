export const recommendationFeedbackEventType = {
  RUN_FAILED: "RUN_FAILED",
  RUN_QUICK_ABANDONED: "RUN_QUICK_ABANDONED",
  RESULT_COMPLETED: "RESULT_COMPLETED",
  RESULT_REPLAY_REQUESTED: "RESULT_REPLAY_REQUESTED",
  RESULT_VIEWED: "RESULT_VIEWED",
  RUN_ABANDONED: "RUN_ABANDONED",
  SHARED_RESULT_VIEWED: "SHARED_RESULT_VIEWED",
  SHARE_LINK_GENERATED: "SHARE_LINK_GENERATED",
  SHARE_TO_TEAMS_CLICKED: "SHARE_TO_TEAMS_CLICKED",
} as const;

export type RecommendationFeedbackEventType =
  (typeof recommendationFeedbackEventType)[keyof typeof recommendationFeedbackEventType];

export type RecommendationFeedbackSentiment = "negative" | "neutral" | "positive";

const rewardByEventType: Record<RecommendationFeedbackEventType, number> = {
  RUN_FAILED: -2,
  RUN_QUICK_ABANDONED: -4,
  RESULT_COMPLETED: 3,
  RESULT_REPLAY_REQUESTED: 3,
  RESULT_VIEWED: 2,
  RUN_ABANDONED: -3,
  SHARED_RESULT_VIEWED: 4,
  SHARE_LINK_GENERATED: 4,
  SHARE_TO_TEAMS_CLICKED: 5,
};

export function getRecommendationEventReward(eventType: string) {
  return rewardByEventType[eventType as RecommendationFeedbackEventType] ?? 0;
}

export function getRecommendationEventSentiment(eventType: string): RecommendationFeedbackSentiment {
  const reward = getRecommendationEventReward(eventType);

  if (reward > 0) {
    return "positive";
  }

  if (reward < 0) {
    return "negative";
  }

  return "neutral";
}
