import {
  ContextualBanditRecommendationService,
  type ContextualThompsonSamplingOptions,
  type ContextualUcbRankingOptions,
  type RankedRecommendationArm,
  type RecommendationCandidate,
  type RecommendationFeedbackLog,
  type RecommendationLearningState,
} from "./recommendation/contextual-bandit";
import {
  buildFeedbackContextForEventType as buildFeedbackContextForEventTypeInternal,
  buildHomeRecommendationContext as buildHomeRecommendationContextInternal,
  buildRecommendationContextKey as buildRecommendationContextKeyInternal,
  type RecommendationContext,
  type RecommendationContextValue,
} from "./recommendation/recommendation-context";
import {
  getRecommendationEventReward as getRecommendationEventRewardInternal,
  getRecommendationEventSentiment as getRecommendationEventSentimentInternal,
  recommendationFeedbackEventType,
  type RecommendationFeedbackEventType,
  type RecommendationFeedbackSentiment,
} from "./recommendation/recommendation-feedback-events";

export { recommendationFeedbackEventType };

export type {
  ContextualThompsonSamplingOptions,
  ContextualUcbRankingOptions,
  RankedRecommendationArm,
  RecommendationCandidate,
  RecommendationContext,
  RecommendationContextValue,
  RecommendationFeedbackEventType,
  RecommendationFeedbackLog,
  RecommendationFeedbackSentiment,
  RecommendationLearningState,
};

export class ContextualRecommendationService {
  private readonly banditService: ContextualBanditRecommendationService;

  constructor(banditService = new ContextualBanditRecommendationService()) {
    this.banditService = banditService;
  }

  buildRecommendationContextKey(context?: RecommendationContext | string | null) {
    return buildRecommendationContextKeyInternal(context);
  }

  getRecommendationEventReward(eventType: string) {
    return getRecommendationEventRewardInternal(eventType);
  }

  getRecommendationEventSentiment(eventType: string): RecommendationFeedbackSentiment {
    return getRecommendationEventSentimentInternal(eventType);
  }

  buildHomeRecommendationContext(input: {
    completedCount: number;
    playCount: number;
  }) {
    return buildHomeRecommendationContextInternal(input);
  }

  buildFeedbackContextForEventType(eventType: string) {
    return buildFeedbackContextForEventTypeInternal(eventType);
  }

  buildRecommendationLearningState(input: {
    candidates?: RecommendationCandidate[];
    feedbackLogs: RecommendationFeedbackLog[];
    rewardMax?: number;
    rewardMin?: number;
  }) {
    return this.banditService.buildRecommendationLearningState(input);
  }

  learnRecommendationFeedback(input: {
    feedbackLog: RecommendationFeedbackLog;
    learningState: RecommendationLearningState;
    rewardMax?: number;
    rewardMin?: number;
  }) {
    return this.banditService.learnRecommendationFeedback(input);
  }

  rankArmsWithContextualUcb(input: {
    candidates: RecommendationCandidate[];
    feedbackLogs: RecommendationFeedbackLog[];
    options?: ContextualUcbRankingOptions;
  }) {
    return this.banditService.rankArmsWithContextualUcb(input);
  }

  rankArmsWithContextualUcbFromLearningState(input: {
    candidates: RecommendationCandidate[];
    learningState: RecommendationLearningState;
    options?: ContextualUcbRankingOptions;
  }) {
    return this.banditService.rankArmsWithContextualUcbFromLearningState(input);
  }

  rankArmsWithContextualThompsonSampling(input: {
    candidates: RecommendationCandidate[];
    feedbackLogs: RecommendationFeedbackLog[];
    options?: ContextualThompsonSamplingOptions;
  }) {
    return this.banditService.rankArmsWithContextualThompsonSampling(input);
  }

  rankArmsWithContextualThompsonSamplingFromLearningState(input: {
    candidates: RecommendationCandidate[];
    learningState: RecommendationLearningState;
    options?: ContextualThompsonSamplingOptions;
  }) {
    return this.banditService.rankArmsWithContextualThompsonSamplingFromLearningState(input);
  }

  toRecommendationScoreMap(ranked: RankedRecommendationArm[]) {
    return this.banditService.toRecommendationScoreMap(ranked);
  }
}

const contextualRecommendationService = new ContextualRecommendationService();

export function buildRecommendationContextKey(context?: RecommendationContext | string | null) {
  return contextualRecommendationService.buildRecommendationContextKey(context);
}

export function getRecommendationEventReward(eventType: string) {
  return contextualRecommendationService.getRecommendationEventReward(eventType);
}

export function getRecommendationEventSentiment(eventType: string): RecommendationFeedbackSentiment {
  return contextualRecommendationService.getRecommendationEventSentiment(eventType);
}

export function buildHomeRecommendationContext(input: {
  completedCount: number;
  playCount: number;
}) {
  return contextualRecommendationService.buildHomeRecommendationContext(input);
}

export function buildFeedbackContextForEventType(eventType: string) {
  return contextualRecommendationService.buildFeedbackContextForEventType(eventType);
}

export function buildRecommendationLearningState(input: {
  candidates?: RecommendationCandidate[];
  feedbackLogs: RecommendationFeedbackLog[];
  rewardMax?: number;
  rewardMin?: number;
}) {
  return contextualRecommendationService.buildRecommendationLearningState(input);
}

export function learnRecommendationFeedback(input: {
  feedbackLog: RecommendationFeedbackLog;
  learningState: RecommendationLearningState;
  rewardMax?: number;
  rewardMin?: number;
}) {
  return contextualRecommendationService.learnRecommendationFeedback(input);
}

export function rankArmsWithContextualUcb(input: {
  candidates: RecommendationCandidate[];
  feedbackLogs: RecommendationFeedbackLog[];
  options?: ContextualUcbRankingOptions;
}) {
  return contextualRecommendationService.rankArmsWithContextualUcb(input);
}

export function rankArmsWithContextualUcbFromLearningState(input: {
  candidates: RecommendationCandidate[];
  learningState: RecommendationLearningState;
  options?: ContextualUcbRankingOptions;
}) {
  return contextualRecommendationService.rankArmsWithContextualUcbFromLearningState(input);
}

export function rankArmsWithContextualThompsonSampling(input: {
  candidates: RecommendationCandidate[];
  feedbackLogs: RecommendationFeedbackLog[];
  options?: ContextualThompsonSamplingOptions;
}) {
  return contextualRecommendationService.rankArmsWithContextualThompsonSampling(input);
}

export function rankArmsWithContextualThompsonSamplingFromLearningState(input: {
  candidates: RecommendationCandidate[];
  learningState: RecommendationLearningState;
  options?: ContextualThompsonSamplingOptions;
}) {
  return contextualRecommendationService.rankArmsWithContextualThompsonSamplingFromLearningState(input);
}

export function toRecommendationScoreMap(ranked: RankedRecommendationArm[]) {
  return contextualRecommendationService.toRecommendationScoreMap(ranked);
}
