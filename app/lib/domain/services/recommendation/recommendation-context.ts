import { recommendationFeedbackEventType } from "./recommendation-feedback-events";

export type RecommendationContextValue = boolean | number | string | null | undefined;

export type RecommendationContext = Record<string, RecommendationContextValue>;

export function buildRecommendationContextKey(context?: RecommendationContext | string | null) {
  if (typeof context === "string") {
    const normalized = context.trim();
    return normalized.length > 0 ? normalized : "global";
  }

  if (!context) {
    return "global";
  }

  const segments = Object.entries(context)
    .filter(([, value]) => value !== null && value !== undefined && `${value}`.trim() !== "")
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => `${key}=${String(value)}`);

  return segments.length === 0 ? "global" : segments.join("|");
}

export function buildHomeRecommendationContext(input: {
  completedCount: number;
  playCount: number;
}) {
  const segment = input.playCount <= 0
    ? "explore"
    : input.completedCount < input.playCount
      ? "churn-risk"
      : "engaged";

  return {
    engagementSegment: segment,
    surface: "home",
  } as const;
}

export function buildFeedbackContextForEventType(eventType: string) {
  if (
    eventType === recommendationFeedbackEventType.SHARE_LINK_GENERATED
    || eventType === recommendationFeedbackEventType.SHARE_TO_TEAMS_CLICKED
  ) {
    return {
      engagementSegment: "advocacy",
      surface: "result",
    } as const;
  }

  if (eventType === recommendationFeedbackEventType.SHARED_RESULT_VIEWED) {
    return {
      engagementSegment: "advocacy",
      surface: "shared-result",
    } as const;
  }

  if (eventType === recommendationFeedbackEventType.RESULT_REPLAY_REQUESTED) {
    return {
      engagementSegment: "engaged",
      surface: "gameplay",
    } as const;
  }

  if (
    eventType === recommendationFeedbackEventType.RUN_ABANDONED
    || eventType === recommendationFeedbackEventType.RUN_QUICK_ABANDONED
    || eventType === recommendationFeedbackEventType.RUN_FAILED
  ) {
    return {
      engagementSegment: "churn-risk",
      surface: "gameplay",
    } as const;
  }

  return {
    engagementSegment: "engaged",
    surface: "result",
  } as const;
}
