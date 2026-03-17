export const recommendationFeedbackEventType = {
  RESULT_COMPLETED: "RESULT_COMPLETED",
  RESULT_VIEWED: "RESULT_VIEWED",
  RUN_ABANDONED: "RUN_ABANDONED",
  SHARE_LINK_GENERATED: "SHARE_LINK_GENERATED",
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

type ContextStats = {
  counts: number[];
  sums: number[];
};

const defaultOptions: Required<ContextualUcbRankingOptions> = {
  baseScoreWeight: 1e-6,
  coldStartBonus: 0.65,
  contextWeight: 0.72,
  explorationWeight: 1.15,
  globalWeight: 0.28,
  rewardMax: 5,
  rewardMin: -5,
};

const rewardByEventType: Record<RecommendationFeedbackEventType, number> = {
  RESULT_COMPLETED: 3,
  RESULT_VIEWED: 2,
  RUN_ABANDONED: -3,
  SHARE_LINK_GENERATED: 4,
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

  if (segments.length === 0) {
    return "global";
  }

  return segments.join("|");
}

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
  if (eventType === recommendationFeedbackEventType.SHARE_LINK_GENERATED) {
    return {
      engagementSegment: "advocacy",
      surface: "result",
    } as const;
  }

  if (eventType === recommendationFeedbackEventType.RUN_ABANDONED) {
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

export function rankArmsWithContextualUcb(input: {
  candidates: RecommendationCandidate[];
  feedbackLogs: RecommendationFeedbackLog[];
  options?: ContextualUcbRankingOptions;
}) {
  const options = {
    ...defaultOptions,
    ...input.options,
  };
  const allIndexes = [
    ...input.candidates.map((candidate) => toArmIndex(candidate.armIndex)),
    ...input.feedbackLogs.map((log) => toArmIndex(log.armIndex)),
  ].filter((index): index is number => index !== null);
  const vectorLength = allIndexes.length > 0 ? Math.max(...allIndexes) + 1 : 0;
  const globalCounts = createZeroVector(vectorLength);
  const globalSums = createZeroVector(vectorLength);
  const contextStatsByKey = new Map<string, ContextStats>();
  let totalObservations = 0;

  for (const log of input.feedbackLogs) {
    const armIndex = toArmIndex(log.armIndex);

    if (armIndex === null) {
      continue;
    }

    const reward = toFiniteReward(log.reward, options);
    const contextKey = buildRecommendationContextKey(log.context);
    const contextStats = ensureContextStats(contextStatsByKey, contextKey, vectorLength);

    globalCounts[armIndex] += 1;
    globalSums[armIndex] += reward;
    contextStats.counts[armIndex] += 1;
    contextStats.sums[armIndex] += reward;
    totalObservations += 1;
  }

  const ranked: RankedRecommendationArm[] = input.candidates.map((candidate) => {
    const contextKey = buildRecommendationContextKey(candidate.context);
    const contextStats = ensureContextStats(contextStatsByKey, contextKey, vectorLength);
    const armIndex = toArmIndex(candidate.armIndex);
    const globalCount = armIndex === null ? 0 : globalCounts[armIndex] ?? 0;
    const globalSum = armIndex === null ? 0 : globalSums[armIndex] ?? 0;
    const contextCount = armIndex === null ? 0 : contextStats.counts[armIndex] ?? 0;
    const contextSum = armIndex === null ? 0 : contextStats.sums[armIndex] ?? 0;
    const contextMean = contextCount > 0 ? contextSum / contextCount : null;
    const globalMean = globalCount > 0 ? globalSum / globalCount : null;

    let meanReward = 0;

    if (contextMean !== null && globalMean !== null) {
      meanReward = contextMean * options.contextWeight + globalMean * options.globalWeight;
    } else if (contextMean !== null) {
      meanReward = contextMean;
    } else if (globalMean !== null) {
      meanReward = globalMean;
    }

    const observationCount = contextCount > 0 ? contextCount : globalCount;
    const explorationBonus = options.explorationWeight
      * Math.sqrt(Math.log(Math.max(1, totalObservations) + 1) / Math.max(1, observationCount));
    const coldStartBonus = observationCount === 0 ? options.coldStartBonus : 0;
    const baseScoreBonus = toFiniteBaseScore(candidate.baseScore) * options.baseScoreWeight;

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

export function toRecommendationScoreMap(ranked: RankedRecommendationArm[]) {
  return new Map(ranked.map((entry) => [entry.armKey, entry.score]));
}
