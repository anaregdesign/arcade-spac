import type { RecommendationFeedbackLogRepository } from "../../../domain/repositories/recommendation-feedback-log.repository";
import {
  buildRecommendationLearningState,
  learnRecommendationFeedback,
  rankArmsWithContextualThompsonSamplingFromLearningState,
  type ContextualThompsonSamplingOptions,
  type RecommendationCandidate,
  type RecommendationFeedbackLog,
  type RecommendationLearningState,
} from "../../../domain/services/contextual-recommendation";
import { recommendationFeedbackLogRepository } from "../../infrastructure/repositories/user-feedback-log.repository.server";

const bootstrapFeedbackLogLimit = 1000;

type SharedRecommendationModelState = {
  initializedAt: Date;
  learningState: RecommendationLearningState;
};

function toRecommendationFeedbackLog(input: {
  contextKey?: string;
  gameId: number;
  loggedAt?: Date;
  reward: number;
}): RecommendationFeedbackLog {
  return {
    armIndex: input.gameId,
    context: input.contextKey ?? "global",
    loggedAt: input.loggedAt,
    reward: input.reward,
  };
}

export class SharedRecommendationModel {
  private modelInitializationPromise: Promise<SharedRecommendationModelState> | null = null;
  private modelState: SharedRecommendationModelState | null = null;

  constructor(
    private readonly feedbackLogRepository: RecommendationFeedbackLogRepository,
    private readonly bootstrapLimit = bootstrapFeedbackLogLimit,
  ) {}

  async ensureInitialized() {
    if (this.modelState) {
      return this.modelState;
    }

    if (!this.modelInitializationPromise) {
      this.modelInitializationPromise = this.initialize()
        .then((nextState) => {
          this.modelState = nextState;
          this.modelInitializationPromise = null;
          return nextState;
        })
        .catch((error) => {
          this.modelInitializationPromise = null;
          throw error;
        });
    }

    return this.modelInitializationPromise;
  }

  async rank(input: {
    candidates: RecommendationCandidate[];
    options?: ContextualThompsonSamplingOptions;
  }) {
    const modelState = await this.ensureInitialized();

    return rankArmsWithContextualThompsonSamplingFromLearningState({
      candidates: input.candidates,
      learningState: modelState.learningState,
      options: input.options,
    });
  }

  applyFeedback(input: {
    contextKey?: string;
    gameId: number;
    loggedAt?: Date;
    reward: number;
  }) {
    if (!this.modelState) {
      return false;
    }

    return learnRecommendationFeedback({
      learningState: this.modelState.learningState,
      feedbackLog: toRecommendationFeedbackLog(input),
    });
  }

  private async initialize() {
    const logs = await this.feedbackLogRepository.listRecent(this.bootstrapLimit);
    const learningState = buildRecommendationLearningState({
      feedbackLogs: logs.map((log) =>
        toRecommendationFeedbackLog({
          contextKey: log.contextKey,
          gameId: log.gameId,
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
}

const sharedRecommendationModel = new SharedRecommendationModel(recommendationFeedbackLogRepository);

export function getSharedRecommendationModel() {
  return sharedRecommendationModel;
}

export async function ensureSharedRecommendationModelInitialized() {
  return sharedRecommendationModel.ensureInitialized();
}

export async function rankRecommendationsWithSharedModel(input: {
  candidates: RecommendationCandidate[];
  options?: ContextualThompsonSamplingOptions;
}) {
  return sharedRecommendationModel.rank(input);
}

export function applyFeedbackToSharedRecommendationModel(input: {
  contextKey?: string;
  gameId: number;
  loggedAt?: Date;
  reward: number;
}) {
  return sharedRecommendationModel.applyFeedback(input);
}
