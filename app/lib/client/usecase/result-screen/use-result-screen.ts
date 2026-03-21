type ResultView = {
  canShare: boolean;
  competitivePoints: number;
  difficulty: string;
  gameDescription: string;
  gameKey: string;
  gameName: string;
  isFavorite: boolean;
  impact: {
    gameRank: {
      note: string;
      value: string;
    };
    overallRank: {
      note: string;
      value: string;
    };
    totalPoints: {
      note: string;
      value: string;
    };
  };
  primaryMetric: string;
  primaryMetricLabel: string;
  rankingsHref: string;
  selfBestBadge: string;
  selfBestDeltaLabel: string;
  selfBestDetail: string;
  shareAvailabilityNote: string;
  shareText: string;
  shareUrl: string;
  recommendations: Array<{
    key: string;
    name: string;
    recommendationText: string;
    shortDescription: string;
  }>;
  stateExplanation: string | null;
  status: string;
  statusLabel: string;
  summaryText: string;
  supportMetricLabel: string;
  supportMetricNote: string;
  supportMetricValue: string;
  viewerMode: "owner" | "shared";
};

function getCompactStateCopy(result: ResultView) {
  if (result.status === "PENDING_SAVE") {
    return "Provisional until save retry";
  }

  if (result.status === "FAILED") {
    return "History only, no ranking update";
  }

  if (result.status === "ABANDONED") {
    return "Abandoned run, no ranking update";
  }

  return null;
}

export function useResultScreen(result: ResultView) {
  return {
    compactStateCopy: getCompactStateCopy(result),
    impactCards: [
      { key: "game-rank", label: "Game rank", value: result.impact.gameRank.value },
      { key: "total-points", label: "Total points", value: result.impact.totalPoints.value },
      { key: "overall-rank", label: "Overall rank", value: result.impact.overallRank.value },
    ],
    quickStats: [
      { label: result.supportMetricLabel, value: result.supportMetricValue },
      { label: "Vs best", value: result.selfBestDeltaLabel },
      { label: "Board score", value: String(result.competitivePoints) },
    ],
    recommendationCards: result.recommendations,
    sharePreviewLines: [result.gameName, result.gameDescription, result.shareUrl],
    statusBadgeClass: result.status === "COMPLETED"
      ? "status-badge status-badge-success"
      : result.status === "PENDING_SAVE"
        ? "status-badge status-badge-pending"
        : "status-badge status-badge-neutral",
  };
}
