import { describe, expect, it } from "vitest";

import {
  buildFeedbackContextForEventType,
  buildHomeRecommendationContext,
  buildRecommendationContextKey,
  getRecommendationEventReward,
  getRecommendationEventSentiment,
  rankArmsWithContextualUcb,
  recommendationFeedbackEventType,
} from "./contextual-ucb-recommendation";

describe("contextual-ucb-recommendation", () => {
  it("builds stable context keys", () => {
    expect(buildRecommendationContextKey()).toBe("global");
    expect(buildRecommendationContextKey("  ")).toBe("global");
    expect(buildRecommendationContextKey("result")).toBe("result");
    expect(
      buildRecommendationContextKey({
        b: "x",
        a: 1,
        d: null,
        c: undefined,
      }),
    ).toBe("a=1|b=x");
  });

  it("maps recommendation event reward and sentiment", () => {
    expect(getRecommendationEventReward(recommendationFeedbackEventType.RESULT_COMPLETED)).toBe(3);
    expect(getRecommendationEventReward(recommendationFeedbackEventType.SHARE_LINK_GENERATED)).toBe(4);
    expect(getRecommendationEventReward(recommendationFeedbackEventType.RUN_ABANDONED)).toBe(-3);
    expect(getRecommendationEventReward("UNKNOWN")).toBe(0);

    expect(getRecommendationEventSentiment(recommendationFeedbackEventType.RESULT_COMPLETED)).toBe("positive");
    expect(getRecommendationEventSentiment(recommendationFeedbackEventType.RUN_ABANDONED)).toBe("negative");
    expect(getRecommendationEventSentiment("UNKNOWN")).toBe("neutral");
  });

  it("ranks candidates by contextual mean reward when exploration is disabled", () => {
    const ranked = rankArmsWithContextualUcb({
      candidates: [
        { armKey: "game-a", armIndex: 0, context: "home" },
        { armKey: "game-b", armIndex: 1, context: "home" },
      ],
      feedbackLogs: [
        { armKey: "game-a", armIndex: 0, context: "home", reward: 3 },
        { armKey: "game-a", armIndex: 0, context: "home", reward: 2 },
        { armKey: "game-b", armIndex: 1, context: "home", reward: 1 },
      ],
      options: {
        coldStartBonus: 0,
        explorationWeight: 0,
      },
    });

    expect(ranked.map((entry) => entry.armKey)).toEqual(["game-a", "game-b"]);
    expect(ranked[0].meanReward).toBeGreaterThan(ranked[1].meanReward);
  });

  it("uses base score fallback for cold start ordering", () => {
    const ranked = rankArmsWithContextualUcb({
      candidates: [
        { armKey: "game-a", armIndex: 0, baseScore: 10 },
        { armKey: "game-b", armIndex: 1, baseScore: 2 },
      ],
      feedbackLogs: [],
      options: {
        baseScoreWeight: 1,
        coldStartBonus: 0,
        explorationWeight: 0,
      },
    });

    expect(ranked.map((entry) => entry.armKey)).toEqual(["game-a", "game-b"]);
  });

  it("prefers matching context over global history when context weight is dominant", () => {
    const ranked = rankArmsWithContextualUcb({
      candidates: [
        { armKey: "game-a", armIndex: 0, context: "engaged" },
        { armKey: "game-b", armIndex: 1, context: "engaged" },
      ],
      feedbackLogs: [
        { armKey: "game-a", armIndex: 0, context: "engaged", reward: 4 },
        { armKey: "game-a", armIndex: 0, context: "churn-risk", reward: -4 },
        { armKey: "game-b", armIndex: 1, context: "engaged", reward: 2 },
      ],
      options: {
        coldStartBonus: 0,
        contextWeight: 1,
        explorationWeight: 0,
        globalWeight: 0,
      },
    });

    expect(ranked.map((entry) => entry.armKey)).toEqual(["game-a", "game-b"]);
  });

  it("builds home and event contexts with stable segments", () => {
    expect(buildHomeRecommendationContext({ completedCount: 0, playCount: 0 })).toEqual({
      engagementSegment: "explore",
      surface: "home",
    });
    expect(buildHomeRecommendationContext({ completedCount: 1, playCount: 2 })).toEqual({
      engagementSegment: "churn-risk",
      surface: "home",
    });
    expect(buildFeedbackContextForEventType(recommendationFeedbackEventType.SHARE_LINK_GENERATED)).toEqual({
      engagementSegment: "advocacy",
      surface: "result",
    });
  });
});
