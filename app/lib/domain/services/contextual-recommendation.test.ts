import { describe, expect, it } from "vitest";

import {
  buildFeedbackContextForEventType,
  buildHomeRecommendationContext,
  buildRecommendationLearningState,
  buildRecommendationContextKey,
  getRecommendationEventReward,
  getRecommendationEventSentiment,
  learnRecommendationFeedback,
  rankArmsWithContextualThompsonSamplingFromLearningState,
  rankArmsWithContextualThompsonSampling,
  rankArmsWithContextualUcbFromLearningState,
  rankArmsWithContextualUcb,
  recommendationFeedbackEventType,
} from "./contextual-recommendation";

function createSeededRandom(seed: number) {
  let state = seed >>> 0;

  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

describe("contextual-recommendation", () => {
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
    expect(getRecommendationEventReward(recommendationFeedbackEventType.RUN_FAILED)).toBe(-2);
    expect(getRecommendationEventReward(recommendationFeedbackEventType.RUN_QUICK_ABANDONED)).toBe(-4);
    expect(getRecommendationEventReward(recommendationFeedbackEventType.RESULT_COMPLETED)).toBe(3);
    expect(getRecommendationEventReward(recommendationFeedbackEventType.RESULT_REPLAY_REQUESTED)).toBe(3);
    expect(getRecommendationEventReward(recommendationFeedbackEventType.SHARE_LINK_GENERATED)).toBe(4);
    expect(getRecommendationEventReward(recommendationFeedbackEventType.SHARE_TO_TEAMS_CLICKED)).toBe(5);
    expect(getRecommendationEventReward(recommendationFeedbackEventType.SHARED_RESULT_VIEWED)).toBe(4);
    expect(getRecommendationEventReward(recommendationFeedbackEventType.RUN_ABANDONED)).toBe(-3);
    expect(getRecommendationEventReward("UNKNOWN")).toBe(0);

    expect(getRecommendationEventSentiment(recommendationFeedbackEventType.RESULT_COMPLETED)).toBe("positive");
    expect(getRecommendationEventSentiment(recommendationFeedbackEventType.RUN_FAILED)).toBe("negative");
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

  it("ranks candidates with contextual Thompson sampling", () => {
    const ranked = rankArmsWithContextualThompsonSampling({
      candidates: [
        { armKey: "game-a", armIndex: 0, context: "engaged" },
        { armKey: "game-b", armIndex: 1, context: "engaged" },
      ],
      feedbackLogs: [
        { armKey: "game-a", armIndex: 0, context: "engaged", reward: 4 },
        { armKey: "game-a", armIndex: 0, context: "engaged", reward: 3 },
        { armKey: "game-b", armIndex: 1, context: "engaged", reward: -2 },
      ],
      options: {
        random: createSeededRandom(42),
      },
    });

    expect(ranked.map((entry) => entry.armKey)).toEqual(["game-a", "game-b"]);
    expect(ranked[0].score).toBeGreaterThan(ranked[1].score);
  });

  it("keeps cold-start fallback ordering for Thompson sampling", () => {
    const ranked = rankArmsWithContextualThompsonSampling({
      candidates: [
        { armKey: "game-a", armIndex: 0, baseScore: 20 },
        { armKey: "game-b", armIndex: 1, baseScore: 10 },
      ],
      feedbackLogs: [],
      options: {
        baseScoreWeight: 1,
        coldStartBonus: 0,
        random: createSeededRandom(7),
      },
    });

    expect(ranked.map((entry) => entry.armKey)).toEqual(["game-a", "game-b"]);
  });

  it("matches Thompson ranking between feedback-log scan and prebuilt learning state", () => {
    const candidates = [
      { armKey: "game-a", armIndex: 0, context: "engaged" },
      { armKey: "game-b", armIndex: 1, context: "engaged" },
    ];
    const feedbackLogs = [
      { armKey: "game-a", armIndex: 0, context: "engaged", reward: 4 },
      { armKey: "game-a", armIndex: 0, context: "engaged", reward: 3 },
      { armKey: "game-b", armIndex: 1, context: "engaged", reward: -2 },
    ];

    const learningState = buildRecommendationLearningState({
      candidates,
      feedbackLogs,
    });
    const rankedFromState = rankArmsWithContextualThompsonSamplingFromLearningState({
      candidates,
      learningState,
      options: {
        random: createSeededRandom(17),
      },
    });
    const rankedFromLogs = rankArmsWithContextualThompsonSampling({
      candidates,
      feedbackLogs,
      options: {
        random: createSeededRandom(17),
      },
    });

    expect(rankedFromState.map((entry) => entry.armKey)).toEqual(rankedFromLogs.map((entry) => entry.armKey));
    expect(rankedFromState[0].score).toBeCloseTo(rankedFromLogs[0].score, 8);
    expect(rankedFromState[1].score).toBeCloseTo(rankedFromLogs[1].score, 8);
  });

  it("updates UCB ordering with incremental feedback learning", () => {
    const candidates = [
      { armKey: "game-a", armIndex: 0, context: "home" },
      { armKey: "game-b", armIndex: 1, context: "home" },
    ];
    const learningState = buildRecommendationLearningState({
      candidates,
      feedbackLogs: [
        { armKey: "game-a", armIndex: 0, context: "home", reward: 0 },
        { armKey: "game-b", armIndex: 1, context: "home", reward: 2 },
      ],
    });

    const before = rankArmsWithContextualUcbFromLearningState({
      candidates,
      learningState,
      options: {
        coldStartBonus: 0,
        explorationWeight: 0,
      },
    });

    expect(before.map((entry) => entry.armKey)).toEqual(["game-b", "game-a"]);

    learnRecommendationFeedback({
      learningState,
      feedbackLog: { armKey: "game-a", armIndex: 0, context: "home", reward: 5 },
    });

    const after = rankArmsWithContextualUcbFromLearningState({
      candidates,
      learningState,
      options: {
        coldStartBonus: 0,
        explorationWeight: 0,
      },
    });

    expect(after.map((entry) => entry.armKey)).toEqual(["game-a", "game-b"]);
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
    expect(buildFeedbackContextForEventType(recommendationFeedbackEventType.SHARE_TO_TEAMS_CLICKED)).toEqual({
      engagementSegment: "advocacy",
      surface: "result",
    });
    expect(buildFeedbackContextForEventType(recommendationFeedbackEventType.SHARED_RESULT_VIEWED)).toEqual({
      engagementSegment: "advocacy",
      surface: "shared-result",
    });
    expect(buildFeedbackContextForEventType(recommendationFeedbackEventType.RESULT_REPLAY_REQUESTED)).toEqual({
      engagementSegment: "engaged",
      surface: "gameplay",
    });
    expect(buildFeedbackContextForEventType(recommendationFeedbackEventType.RUN_FAILED)).toEqual({
      engagementSegment: "churn-risk",
      surface: "gameplay",
    });
    expect(buildFeedbackContextForEventType(recommendationFeedbackEventType.RUN_QUICK_ABANDONED)).toEqual({
      engagementSegment: "churn-risk",
      surface: "gameplay",
    });
  });
});
