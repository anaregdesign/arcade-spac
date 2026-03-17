import {
  buildRecommendationLearningState,
  learnRecommendationFeedback,
  rankArmsWithContextualThompsonSamplingFromLearningState,
  type ContextualThompsonSamplingOptions,
  type RecommendationCandidate,
  type RecommendationFeedbackLog,
  type RecommendationLearningState,
} from "../../../domain/services/contextual-recommendation";
import { listRecentUserFeedbackLogs } from "../../infrastructure/repositories/user-feedback-log.repository.server";

const bootstrapFeedbackLogLimit = 1000;

type SharedRecommendationModelState = {
  initializedAt: Date;
  learningState: RecommendationLearningState;
};

let modelInitializationPromise: Promise<SharedRecommendationModelState> | null = null;
let sharedRecommendationModelState: SharedRecommendationModelState | null = null;

function toRecommendationFeedbackLog(input: {
  contextKey?: string;
  gameId: number;
  gameKey: string;
  loggedAt?: Date;
  reward: number;
}) {
  return {
    armKey: input.gameKey,
    armIndex: input.gameId,
    context: input.contextKey ?? "global",
    loggedAt: input.loggedAt,
    reward: input.reward,
  } satisfies RecommendationFeedbackLog;
}

async function initializeSharedRecommendationModel() {
  const logs = await listRecentUserFeedbackLogs(bootstrapFeedbackLogLimit);
  const learningState = buildRecommendationLearningState({
    feedbackLogs: logs.map((log) =>
      toRecommendationFeedbackLog({
        contextKey: log.contextKey,
        gameId: log.gameId,
        gameKey: log.gameKey,
        loggedAt: log.loggedAt,
        reward: log.reward,
      })
    ),
  });

  return {
    initializedAt: new Date(),
    learningState,
  } satisfies SharedRecommendationModelState;
}

export async function ensureSharedRecommendationModelInitialized() {
  if (sharedRecommendationModelState) {
    return sharedRecommendationModelState;
  }

  if (!modelInitializationPromise) {
    modelInitializationPromise = initializeSharedRecommendationModel()
      .then((modelState) => {
        sharedRecommendationModelState = modelState;
        modelInitializationPromise = null;
        return modelState;
      })
      .catch((error) => {
        modelInitializationPromise = null;
        throw error;
      });
  }

  return modelInitializationPromise;
}

export async function rankRecommendationsWithSharedModel(input: {
  candidates: RecommendationCandidate[];
  options?: ContextualThompsonSamplingOptions;
}) {
  const modelState = await ensureSharedRecommendationModelInitialized();

  return rankArmsWithContextualThompsonSamplingFromLearningState({
    candidates: input.candidates,
    learningState: modelState.learningState,
    options: input.options,
  });
}

export function applyFeedbackToSharedRecommendationModel(input: {
  contextKey?: string;
  gameId: number;
  gameKey: string;
  loggedAt?: Date;
  reward: number;
}) {
  if (!sharedRecommendationModelState) {
    return false;
  }

  return learnRecommendationFeedback({
    learningState: sharedRecommendationModelState.learningState,
    feedbackLog: toRecommendationFeedbackLog(input),
  });
}
