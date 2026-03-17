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

export type RecommendationContextValue = boolean | number | string | null | undefined;

export type RecommendationContext = Record<string, RecommendationContextValue>;

export type RecommendationCandidate = {
  armKey: string;
  armIndex: number;
  context?: RecommendationContext | string | null;
  baseScore?: number;
};

export type RecommendationFeedbackLog = {
  armKey: string;
  armIndex: number;
  context?: RecommendationContext | string | null;
  loggedAt?: Date | string;
  reward: number;
};

export type RankedRecommendationArm = {
  armKey: string;
  armIndex: number;
  contextKey: string;
  explorationBonus: number;
  meanReward: number;
  observationCount: number;
  score: number;
};

export type ContextualUcbRankingOptions = {
  baseScoreWeight?: number;
  coldStartBonus?: number;
  contextWeight?: number;
  explorationWeight?: number;
  globalWeight?: number;
  rewardMax?: number;
  rewardMin?: number;
};

export type ContextualThompsonSamplingOptions = {
  baseScoreWeight?: number;
  coldStartBonus?: number;
  contextWeight?: number;
  globalWeight?: number;
  priorAlpha?: number;
  priorBeta?: number;
  rewardMax?: number;
  rewardMin?: number;
  random?: () => number;
};

type ContextStats = {
  counts: number[];
  sums: number[];
};

export type RecommendationLearningState = {
  contextStatsByKey: Map<string, {
    counts: number[];
    sums: number[];
  }>;
  globalCounts: number[];
  globalSums: number[];
  totalObservations: number;
  vectorLength: number;
};

const defaultUcbOptions: Required<ContextualUcbRankingOptions> = {
  baseScoreWeight: 1e-6,
  coldStartBonus: 0.65,
  contextWeight: 0.72,
  explorationWeight: 1.15,
  globalWeight: 0.28,
  rewardMax: 5,
  rewardMin: -5,
};

const defaultThompsonOptions: Omit<Required<ContextualThompsonSamplingOptions>, "random"> = {
  baseScoreWeight: 1e-6,
  coldStartBonus: 0.65,
  contextWeight: 0.72,
  globalWeight: 0.28,
  priorAlpha: 1,
  priorBeta: 1,
  rewardMax: 5,
  rewardMin: -5,
};

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

function clampReward(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function toArmIndex(value: number) {
  if (!Number.isFinite(value)) {
    return null;
  }

  const normalized = Math.floor(value);
  return normalized >= 0 ? normalized : null;
}

function toFiniteBaseScore(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function toFiniteReward(value: number, options: Required<ContextualUcbRankingOptions>) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return clampReward(value, options.rewardMin, options.rewardMax);
}

function toNormalizedReward(value: number, rewardMin: number, rewardMax: number) {
  if (rewardMax <= rewardMin) {
    return 0.5;
  }

  return clampReward((value - rewardMin) / (rewardMax - rewardMin), 0, 1);
}

function fromNormalizedReward(value: number, rewardMin: number, rewardMax: number) {
  return rewardMin + (rewardMax - rewardMin) * clampReward(value, 0, 1);
}

function createZeroVector(length: number) {
  return Array.from({ length }, () => 0);
}

function ensureContextStats(statsByContext: Map<string, ContextStats>, contextKey: string, vectorLength: number) {
  const existing = statsByContext.get(contextKey);

  if (!existing) {
    const created = {
      counts: createZeroVector(vectorLength),
      sums: createZeroVector(vectorLength),
    };
    statsByContext.set(contextKey, created);
    return created;
  }

  if (existing.counts.length < vectorLength) {
    const missingLength = vectorLength - existing.counts.length;

    existing.counts.push(...createZeroVector(missingLength));
    existing.sums.push(...createZeroVector(missingLength));
  }

  return existing;
}

function ensureLearningStateVectorLength(learningState: RecommendationLearningState, vectorLength: number) {
  if (learningState.vectorLength >= vectorLength) {
    return;
  }

  const missingLength = vectorLength - learningState.vectorLength;
  learningState.globalCounts.push(...createZeroVector(missingLength));
  learningState.globalSums.push(...createZeroVector(missingLength));

  for (const contextStats of learningState.contextStatsByKey.values()) {
    contextStats.counts.push(...createZeroVector(missingLength));
    contextStats.sums.push(...createZeroVector(missingLength));
  }

  learningState.vectorLength = vectorLength;
}

function getRequiredVectorLengthFromCandidates(candidates: RecommendationCandidate[]) {
  const indexes = candidates
    .map((candidate) => toArmIndex(candidate.armIndex))
    .filter((index): index is number => index !== null);

  return indexes.length > 0 ? Math.max(...indexes) + 1 : 0;
}

function sampleStandardNormal(random: () => number) {
  const unit = () => {
    const value = random();
    return value > 0 && value < 1 ? value : 0.5;
  };
  const u1 = Math.max(Number.EPSILON, unit());
  const u2 = unit();

  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
}

function sampleGamma(shape: number, random: () => number): number {
  if (shape <= 0) {
    return 0;
  }

  if (shape < 1) {
    const u = Math.max(Number.EPSILON, Math.min(1 - Number.EPSILON, random()));
    return sampleGamma(shape + 1, random) * Math.pow(u, 1 / shape);
  }

  const d = shape - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);

  for (;;) {
    const x = sampleStandardNormal(random);
    const vCandidate = 1 + c * x;

    if (vCandidate <= 0) {
      continue;
    }

    const v = vCandidate * vCandidate * vCandidate;
    const u = Math.max(Number.EPSILON, Math.min(1 - Number.EPSILON, random()));

    if (u < 1 - 0.0331 * x * x * x * x) {
      return d * v;
    }

    if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) {
      return d * v;
    }
  }
}

function sampleBeta(alpha: number, beta: number, random: () => number) {
  const x = sampleGamma(alpha, random);
  const y = sampleGamma(beta, random);
  const total = x + y;

  return total > 0 ? x / total : 0.5;
}

function derivePosteriorStats(input: {
  count: number;
  sum: number;
  priorAlpha: number;
  priorBeta: number;
  rewardMax: number;
  rewardMin: number;
}) {
  const normalizedSum = input.count <= 0
    ? 0
    : input.count * toNormalizedReward(input.sum / input.count, input.rewardMin, input.rewardMax);

  return {
    alpha: input.priorAlpha + normalizedSum,
    beta: input.priorBeta + (input.count - normalizedSum),
  };
}

export class ContextualRecommendationService {
  buildRecommendationContextKey(context?: RecommendationContext | string | null) {
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

    if (segments.length === 0) {
      return "global";
    }

    return segments.join("|");
  }

  getRecommendationEventReward(eventType: string) {
    return rewardByEventType[eventType as RecommendationFeedbackEventType] ?? 0;
  }

  getRecommendationEventSentiment(eventType: string): RecommendationFeedbackSentiment {
    const reward = this.getRecommendationEventReward(eventType);

    if (reward > 0) {
      return "positive";
    }

    if (reward < 0) {
      return "negative";
    }

    return "neutral";
  }

  buildHomeRecommendationContext(input: {
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

  buildFeedbackContextForEventType(eventType: string) {
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

  buildRecommendationLearningState(input: {
    candidates?: RecommendationCandidate[];
    feedbackLogs: RecommendationFeedbackLog[];
    rewardMax?: number;
    rewardMin?: number;
  }) {
    return this.buildRecommendationStats({
      candidates: input.candidates ?? [],
      feedbackLogs: input.feedbackLogs,
      rewardMin: input.rewardMin ?? defaultThompsonOptions.rewardMin,
      rewardMax: input.rewardMax ?? defaultThompsonOptions.rewardMax,
    });
  }

  learnRecommendationFeedback(input: {
    feedbackLog: RecommendationFeedbackLog;
    learningState: RecommendationLearningState;
    rewardMax?: number;
    rewardMin?: number;
  }) {
    const armIndex = toArmIndex(input.feedbackLog.armIndex);

    if (armIndex === null) {
      return false;
    }

    const rewardMin = input.rewardMin ?? defaultThompsonOptions.rewardMin;
    const rewardMax = input.rewardMax ?? defaultThompsonOptions.rewardMax;
    const reward = clampReward(input.feedbackLog.reward, rewardMin, rewardMax);
    const vectorLength = Math.max(input.learningState.vectorLength, armIndex + 1);

    ensureLearningStateVectorLength(input.learningState, vectorLength);

    const contextKey = this.buildRecommendationContextKey(input.feedbackLog.context);
    const contextStats = ensureContextStats(input.learningState.contextStatsByKey, contextKey, input.learningState.vectorLength);

    input.learningState.globalCounts[armIndex] += 1;
    input.learningState.globalSums[armIndex] += reward;
    contextStats.counts[armIndex] += 1;
    contextStats.sums[armIndex] += reward;
    input.learningState.totalObservations += 1;

    return true;
  }

  rankArmsWithContextualUcb(input: {
    candidates: RecommendationCandidate[];
    feedbackLogs: RecommendationFeedbackLog[];
    options?: ContextualUcbRankingOptions;
  }) {
    const mergedOptions = {
      ...defaultUcbOptions,
      ...input.options,
    };
    const learningState = this.buildRecommendationStats({
      candidates: input.candidates,
      feedbackLogs: input.feedbackLogs.map((log) => ({
        ...log,
        reward: toFiniteReward(log.reward, mergedOptions),
      })),
      rewardMin: mergedOptions.rewardMin,
      rewardMax: mergedOptions.rewardMax,
    });

    return this.rankArmsWithContextualUcbFromLearningState({
      candidates: input.candidates,
      learningState,
      options: mergedOptions,
    });
  }

  rankArmsWithContextualUcbFromLearningState(input: {
    candidates: RecommendationCandidate[];
    learningState: RecommendationLearningState;
    options?: ContextualUcbRankingOptions;
  }) {
    const options = {
      ...defaultUcbOptions,
      ...input.options,
    };

    return this.rankArmsWithContextualUcbUsingLearningState({
      candidates: input.candidates,
      learningState: input.learningState,
      options,
    });
  }

  rankArmsWithContextualThompsonSampling(input: {
    candidates: RecommendationCandidate[];
    feedbackLogs: RecommendationFeedbackLog[];
    options?: ContextualThompsonSamplingOptions;
  }) {
    const mergedOptions = {
      ...defaultThompsonOptions,
      ...input.options,
    };
    const learningState = this.buildRecommendationStats({
      candidates: input.candidates,
      feedbackLogs: input.feedbackLogs.map((log) => ({
        ...log,
        reward: clampReward(log.reward, mergedOptions.rewardMin, mergedOptions.rewardMax),
      })),
      rewardMin: mergedOptions.rewardMin,
      rewardMax: mergedOptions.rewardMax,
    });

    return this.rankArmsWithContextualThompsonSamplingFromLearningState({
      candidates: input.candidates,
      learningState,
      options: {
        ...mergedOptions,
        random: input.options?.random,
      },
    });
  }

  rankArmsWithContextualThompsonSamplingFromLearningState(input: {
    candidates: RecommendationCandidate[];
    learningState: RecommendationLearningState;
    options?: ContextualThompsonSamplingOptions;
  }) {
    const options = {
      ...defaultThompsonOptions,
      ...input.options,
    };
    const random = input.options?.random ?? Math.random;

    return this.rankArmsWithContextualThompsonSamplingUsingLearningState({
      candidates: input.candidates,
      learningState: input.learningState,
      options,
      random,
    });
  }

  toRecommendationScoreMap(ranked: RankedRecommendationArm[]) {
    return new Map(ranked.map((entry) => [entry.armKey, entry.score]));
  }

  private rankArmsWithContextualUcbUsingLearningState(input: {
    candidates: RecommendationCandidate[];
    learningState: RecommendationLearningState;
    options: Required<ContextualUcbRankingOptions>;
  }) {
    const requiredVectorLength = getRequiredVectorLengthFromCandidates(input.candidates);

    ensureLearningStateVectorLength(input.learningState, requiredVectorLength);

    const ranked: RankedRecommendationArm[] = input.candidates.map((candidate) => {
      const contextKey = this.buildRecommendationContextKey(candidate.context);
      const contextStats = ensureContextStats(
        input.learningState.contextStatsByKey,
        contextKey,
        input.learningState.vectorLength,
      );
      const armIndex = toArmIndex(candidate.armIndex);
      const globalCount = armIndex === null ? 0 : input.learningState.globalCounts[armIndex] ?? 0;
      const globalSum = armIndex === null ? 0 : input.learningState.globalSums[armIndex] ?? 0;
      const contextCount = armIndex === null ? 0 : contextStats.counts[armIndex] ?? 0;
      const contextSum = armIndex === null ? 0 : contextStats.sums[armIndex] ?? 0;
      const contextMean = contextCount > 0 ? contextSum / contextCount : null;
      const globalMean = globalCount > 0 ? globalSum / globalCount : null;

      let meanReward = 0;

      if (contextMean !== null && globalMean !== null) {
        meanReward = contextMean * input.options.contextWeight + globalMean * input.options.globalWeight;
      } else if (contextMean !== null) {
        meanReward = contextMean;
      } else if (globalMean !== null) {
        meanReward = globalMean;
      }

      const observationCount = contextCount > 0 ? contextCount : globalCount;
      const explorationBonus = input.options.explorationWeight
        * Math.sqrt(Math.log(Math.max(1, input.learningState.totalObservations) + 1) / Math.max(1, observationCount));
      const coldStartBonus = observationCount === 0 ? input.options.coldStartBonus : 0;
      const baseScoreBonus = toFiniteBaseScore(candidate.baseScore) * input.options.baseScoreWeight;

      return {
        armKey: candidate.armKey,
        armIndex: armIndex ?? -1,
        contextKey,
        explorationBonus,
        meanReward,
        observationCount,
        score: meanReward + explorationBonus + coldStartBonus + baseScoreBonus,
      };
    });

    return ranked.sort((left, right) => {
      const scoreDelta = right.score - left.score;

      if (scoreDelta !== 0) {
        return scoreDelta;
      }

      const countDelta = right.observationCount - left.observationCount;

      if (countDelta !== 0) {
        return countDelta;
      }

      return left.armKey.localeCompare(right.armKey);
    });
  }

  private rankArmsWithContextualThompsonSamplingUsingLearningState(input: {
    candidates: RecommendationCandidate[];
    learningState: RecommendationLearningState;
    options: Omit<Required<ContextualThompsonSamplingOptions>, "random">;
    random: () => number;
  }) {
    const requiredVectorLength = getRequiredVectorLengthFromCandidates(input.candidates);

    ensureLearningStateVectorLength(input.learningState, requiredVectorLength);

    const ranked: RankedRecommendationArm[] = input.candidates.map((candidate) => {
      const contextKey = this.buildRecommendationContextKey(candidate.context);
      const contextStats = ensureContextStats(
        input.learningState.contextStatsByKey,
        contextKey,
        input.learningState.vectorLength,
      );
      const armIndex = toArmIndex(candidate.armIndex);
      const globalCount = armIndex === null ? 0 : input.learningState.globalCounts[armIndex] ?? 0;
      const globalSum = armIndex === null ? 0 : input.learningState.globalSums[armIndex] ?? 0;
      const contextCount = armIndex === null ? 0 : contextStats.counts[armIndex] ?? 0;
      const contextSum = armIndex === null ? 0 : contextStats.sums[armIndex] ?? 0;
      const observationCount = contextCount > 0 ? contextCount : globalCount;

      const contextPosterior = derivePosteriorStats({
        count: contextCount,
        sum: contextSum,
        priorAlpha: input.options.priorAlpha,
        priorBeta: input.options.priorBeta,
        rewardMin: input.options.rewardMin,
        rewardMax: input.options.rewardMax,
      });
      const globalPosterior = derivePosteriorStats({
        count: globalCount,
        sum: globalSum,
        priorAlpha: input.options.priorAlpha,
        priorBeta: input.options.priorBeta,
        rewardMin: input.options.rewardMin,
        rewardMax: input.options.rewardMax,
      });
      const hasContext = contextCount > 0;
      const hasGlobal = globalCount > 0;

      let alpha = input.options.priorAlpha;
      let beta = input.options.priorBeta;

      if (hasContext && hasGlobal) {
        alpha += (contextPosterior.alpha - input.options.priorAlpha) * input.options.contextWeight
          + (globalPosterior.alpha - input.options.priorAlpha) * input.options.globalWeight;
        beta += (contextPosterior.beta - input.options.priorBeta) * input.options.contextWeight
          + (globalPosterior.beta - input.options.priorBeta) * input.options.globalWeight;
      } else if (hasContext) {
        alpha = contextPosterior.alpha;
        beta = contextPosterior.beta;
      } else if (hasGlobal) {
        alpha = globalPosterior.alpha;
        beta = globalPosterior.beta;
      }

      const sampledSuccess = sampleBeta(alpha, beta, input.random);
      const sampledReward = fromNormalizedReward(sampledSuccess, input.options.rewardMin, input.options.rewardMax);
      const posteriorMeanSuccess = alpha / Math.max(Number.EPSILON, alpha + beta);
      const meanReward = fromNormalizedReward(posteriorMeanSuccess, input.options.rewardMin, input.options.rewardMax);
      const coldStartBonus = observationCount === 0 ? input.options.coldStartBonus : 0;
      const baseScoreBonus = toFiniteBaseScore(candidate.baseScore) * input.options.baseScoreWeight;

      return {
        armKey: candidate.armKey,
        armIndex: armIndex ?? -1,
        contextKey,
        explorationBonus: 0,
        meanReward,
        observationCount,
        score: sampledReward + coldStartBonus + baseScoreBonus,
      };
    });

    return ranked.sort((left, right) => {
      const scoreDelta = right.score - left.score;

      if (scoreDelta !== 0) {
        return scoreDelta;
      }

      const countDelta = right.observationCount - left.observationCount;

      if (countDelta !== 0) {
        return countDelta;
      }

      return left.armKey.localeCompare(right.armKey);
    });
  }

  private buildRecommendationStats(input: {
    candidates: RecommendationCandidate[];
    feedbackLogs: RecommendationFeedbackLog[];
    rewardMax: number;
    rewardMin: number;
  }): RecommendationLearningState {
    const allIndexes = [
      ...input.candidates.map((candidate) => toArmIndex(candidate.armIndex)),
      ...input.feedbackLogs.map((log) => toArmIndex(log.armIndex)),
    ].filter((index): index is number => index !== null);
    const vectorLength = allIndexes.length > 0 ? Math.max(...allIndexes) + 1 : 0;
    const learningState: RecommendationLearningState = {
      contextStatsByKey: new Map<string, ContextStats>(),
      globalCounts: createZeroVector(vectorLength),
      globalSums: createZeroVector(vectorLength),
      totalObservations: 0,
      vectorLength,
    };

    for (const feedbackLog of input.feedbackLogs) {
      this.learnRecommendationFeedback({
        learningState,
        feedbackLog,
        rewardMin: input.rewardMin,
        rewardMax: input.rewardMax,
      });
    }

    return learningState;
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
