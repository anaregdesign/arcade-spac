export type RecommendationFeedbackLogRecord = {
  contextKey: string;
  eventType: string;
  gameId: number;
  id: string;
  loggedAt: Date;
  reward: number;
  userId: string;
};

export type CreateRecommendationFeedbackLogInput = {
  contextKey?: string;
  eventType: string;
  gameId: number;
  loggedAt?: Date;
  reward: number;
  userId: string;
};

export interface RecommendationFeedbackLogRepository {
  create(input: CreateRecommendationFeedbackLogInput): Promise<RecommendationFeedbackLogRecord>;
  listRecent(limit: number): Promise<RecommendationFeedbackLogRecord[]>;
}
