import { listLeaderboardEntries } from "../../infrastructure/repositories/rankings-profile.repository.server";
import { getHomeDashboard } from "../get-home-dashboard.server";
import { getPlayResultById } from "../../infrastructure/repositories/gameplay.repository.server";
import type { PendingResultDraft } from "../../infrastructure/auth/session.server";
import type { GameKey } from "../../../domain/entities/game-catalog";
import { toRouteGameKey } from "../../../domain/entities/game-catalog";
import { formatPrimaryMetric, getDropLineHitRating, getResultPrimaryMetricLabel } from "../../../domain/services/game-metrics";

type PersistedPlayResult = NonNullable<Awaited<ReturnType<typeof getPlayResultById>>>;
type RankingScope = GameKey;
type ResultViewerMode = "owner" | "shared";

export type ResultViewModel = {
  id: string;
  viewerMode: ResultViewerMode;
  status: string;
  statusLabel: string;
  difficulty: string;
  summaryText: string;
  primaryMetricLabel: string;
  primaryMetric: string;
  supportMetricLabel: string;
  supportMetricValue: string;
  supportMetricNote: string;
  selfBestBadge: string;
  selfBestDeltaLabel: string;
  selfBestDetail: string;
  competitivePoints: number;
  impact: {
    gameRank: {
      value: string;
      note: string;
    };
    totalPoints: {
      value: string;
      note: string;
    };
    overallRank: {
      value: string;
      note: string;
    };
  };
  stateExplanation: string | null;
  gameKey: string;
  gameName: string;
  shareUrl: string;
  shareText: string;
  shareAvailabilityNote: string;
  canShare: boolean;
  rankingsHref: string;
};

function formatRank(rank: number | null) {
  return rank ? `#${rank}` : "Unranked";
}

function pluralize(count: number, noun: string) {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

function getStatusLabel(status: string) {
  switch (status) {
    case "COMPLETED":
      return "Cleared";
    case "FAILED":
      return "Not cleared";
    case "PENDING_SAVE":
      return "Pending save";
    case "ABANDONED":
      return "Abandoned";
    default:
      return status;
  }
}

function getSupportMetric(result: PersistedPlayResult) {
  const gameKey = toRouteGameKey(result.game.key);

  if (gameKey === "minesweeper") {
    return {
      label: "Mistakes",
      value: String(result.mistakeCount ?? 0),
      note: result.mistakeCount === 0 ? "Clean board" : `${pluralize(result.mistakeCount ?? 0, "mistake")} recorded`,
    };
  }

  if (gameKey === "sudoku") {
    return {
      label: "Hints used",
      value: String(result.hintCount ?? 0),
      note: result.hintCount === 0 ? "No hints needed" : `${pluralize(result.hintCount ?? 0, "hint")} used`,
    };
  }

  const rating = getDropLineHitRating(result.primaryMetric, result.status);

  return {
    label: "Hit rating",
    value: rating.value,
    note: rating.note,
  };
}

function describeBestDelta(gameKey: GameKey, delta: number, direction: "better" | "worse") {
  const formattedDelta = formatPrimaryMetric(gameKey, delta);

  if (gameKey === "drop-line") {
    return direction === "better"
      ? {
          deltaLabel: `-${formattedDelta}`,
          detail: `${formattedDelta} tighter than your previous best hit.`,
          shareLine: `this tightened the previous best by ${formattedDelta}`,
        }
      : {
          deltaLabel: `+${formattedDelta}`,
          detail: `${formattedDelta} wider than your best hit offset.`,
          shareLine: `the best hit is still ${formattedDelta} tighter`,
        };
  }

  return direction === "better"
    ? {
        deltaLabel: `-${formattedDelta}`,
        detail: `${formattedDelta} faster than your previous best clear time.`,
        shareLine: `this beat the previous best by ${formattedDelta}`,
      }
    : {
        deltaLabel: `+${formattedDelta}`,
        detail: `${formattedDelta} slower than your best clear time.`,
        shareLine: `the best clear is still ${formattedDelta} faster`,
      };
}

function getSelfBestSummary(result: PersistedPlayResult) {
  const gameKey = toRouteGameKey(result.game.key) as GameKey;
  const previousResults = result.user.playResults
    .filter((entry) => entry.id !== result.id && entry.gameId === result.gameId && entry.status === "COMPLETED" && entry.cleared)
    .sort((left, right) => left.primaryMetric - right.primaryMetric);
  const previousBestMetric = previousResults[0]?.primaryMetric ?? null;

  if (result.status !== "COMPLETED") {
    if (result.status === "FAILED") {
      return {
        badge: "Retry run",
        deltaLabel: "No leaderboard entry",
        detail: "This run ended without a clear, so it stays in history only and does not change rankings or total points.",
        shareLine: "this run did not clear the board",
      };
    }

    return {
      badge: "Provisional",
      deltaLabel: "Wait for save",
      detail: "The run is visible, but self-best comparison waits until the save is confirmed.",
      shareLine: "save confirmation is still pending",
    };
  }

  if (previousBestMetric === null) {
    return {
      badge: "First ranked best",
      deltaLabel: "No earlier clear",
      detail: "This is your first completed result in this game.",
      shareLine: "this set a first ranked best",
    };
  }

  const metricDelta = previousBestMetric - result.primaryMetric;

  if (metricDelta > 0) {
    const bestDelta = describeBestDelta(gameKey, metricDelta, "better");

    return {
      badge: "Personal best",
      deltaLabel: bestDelta.deltaLabel,
      detail: bestDelta.detail,
      shareLine: bestDelta.shareLine,
    };
  }

  if (metricDelta === 0) {
    return {
      badge: "Matched best",
      deltaLabel: "Even",
      detail: gameKey === "drop-line" ? "You matched your best hit offset in this game." : "You matched your best clear time in this game.",
      shareLine: "this matched the current personal best",
    };
  }

  const bestDelta = describeBestDelta(gameKey, Math.abs(metricDelta), "worse");

  return {
    badge: "Chasing best",
    deltaLabel: bestDelta.deltaLabel,
    detail: bestDelta.detail,
    shareLine: bestDelta.shareLine,
  };
}

function getRankShift(entries: Array<{ userId: string; rank: number; points: number }>, userId: string, pointsDelta: number) {
  const currentEntry = entries.find((entry) => entry.userId === userId) ?? null;

  if (!currentEntry) {
    return {
      currentRank: null,
      delta: null,
    };
  }

  const previousPoints = currentEntry.points - pointsDelta;
  const previousRank = 1 + entries.filter((entry) => entry.userId !== userId && entry.points > previousPoints).length;

  return {
    currentRank: currentEntry.rank,
    delta: previousRank - currentEntry.rank,
  };
}

function getShareAvailabilityNote(result: PersistedPlayResult, canShare: boolean) {
  if (canShare) {
    return "Completed results from tenant-visible profiles can be shared in Microsoft Teams.";
  }

  if (result.user.visibilityScope !== "TENANT_ONLY") {
    return "Private visibility disables Microsoft Teams sharing and removes this score from shared leaderboards.";
  }

  if (result.status === "PENDING_SAVE") {
    return "Sharing unlocks after the pending save succeeds.";
  }

  return "Only completed results can be shared.";
}

function getExcludedBoardValue(result: PersistedPlayResult, isTenantVisible: boolean) {
  if (result.status === "PENDING_SAVE") {
    return {
      value: "Pending",
      note: "This result is visible but does not enter the board until save retry succeeds.",
    };
  }

  if (result.status === "FAILED") {
    return {
      value: "Excluded",
      note: "Uncleared runs stay in history only and do not enter the game board.",
    };
  }

  if (isTenantVisible) {
    return {
      value: "Excluded",
      note: "Abandoned or unconfirmed runs do not enter the game board.",
    };
  }

  return {
    value: "Private",
    note: "Private visibility keeps this result out of the shared game board.",
  };
}

function getExcludedOverallValue(result: PersistedPlayResult, currentOverallRank: number | null, isTenantVisible: boolean) {
  if (result.status === "PENDING_SAVE") {
    return {
      value: formatRank(currentOverallRank),
      note: "Overall ranking stays provisional until the save is confirmed.",
    };
  }

  if (result.status === "FAILED") {
    return {
      value: formatRank(currentOverallRank),
      note: "Overall ranking does not change for uncleared runs.",
    };
  }

  if (isTenantVisible) {
    return {
      value: formatRank(currentOverallRank),
      note: "Overall ranking does not change for abandoned or excluded runs.",
    };
  }

  return {
    value: formatRank(currentOverallRank),
    note: "Private visibility keeps overall ranking hidden from shared boards until the profile becomes tenant-visible.",
  };
}

export async function buildPersistedResultView(input: {
  publicBaseUrl: string;
  result: PersistedPlayResult;
  viewerMode: ResultViewerMode;
}) {
  const ownerDashboard = await getHomeDashboard(input.result.userId);
  const gameScope = toRouteGameKey(input.result.game.key) as RankingScope;
  const primaryMetricText = formatPrimaryMetric(gameScope, input.result.primaryMetric);
  const supportMetric = getSupportMetric(input.result);
  const selfBest = getSelfBestSummary(input.result);
  const isTenantVisible = input.result.user.visibilityScope === "TENANT_ONLY";
  const boardEligible = input.result.leaderboardEligible && isTenantVisible;
  const [overallEntries, gameEntries] = await Promise.all([
    listLeaderboardEntries("SEASON", "overall"),
    listLeaderboardEntries("SEASON", gameScope),
  ]);
  const overallShift = boardEligible ? getRankShift(overallEntries, input.result.userId, input.result.totalPointsDelta) : { currentRank: null, delta: null };
  const gameShift = boardEligible ? getRankShift(gameEntries, input.result.userId, input.result.totalPointsDelta) : { currentRank: null, delta: null };
  const currentOverallRank = ownerDashboard.summaries.seasonRank;
  const currentOverallPoints = ownerDashboard.summaries.seasonPoints;
  const sharePath = input.result.shareToken ? `/results/shared/${input.result.shareToken}` : null;
  const shareUrl = sharePath ? `${input.publicBaseUrl}${sharePath}` : `${input.publicBaseUrl}/results/${input.result.id}`;
  const canShare = input.viewerMode === "owner" && input.result.status === "COMPLETED" && isTenantVisible && Boolean(input.result.shareToken);
  const shareText = [
    gameScope === "drop-line"
      ? `Arcade: ${input.result.game.name} ${input.result.difficulty.toLowerCase()} at ${primaryMetricText} offset.`
      : `Arcade: ${input.result.game.name} ${input.result.difficulty.toLowerCase()} in ${primaryMetricText}.`,
    `${selfBest.shareLine}.`,
    `Season total ${currentOverallPoints} pts, overall ${currentOverallRank ? formatRank(currentOverallRank) : "unranked"}.`,
    `View result: ${shareUrl}`,
  ].join(" ");

  return {
    id: input.result.id,
    viewerMode: input.viewerMode,
    status: input.result.status,
    statusLabel: getStatusLabel(input.result.status),
    difficulty: input.result.difficulty,
    summaryText: input.result.summaryText,
    primaryMetricLabel: getResultPrimaryMetricLabel(gameScope, input.result.status),
    primaryMetric: primaryMetricText,
    supportMetricLabel: supportMetric.label,
    supportMetricValue: supportMetric.value,
    supportMetricNote: supportMetric.note,
    selfBestBadge: selfBest.badge,
    selfBestDeltaLabel: selfBest.deltaLabel,
    selfBestDetail: selfBest.detail,
    competitivePoints: input.result.competitivePoints,
    impact: {
      gameRank: boardEligible
        ? {
            value: formatRank(gameShift.currentRank),
            note: gameShift.delta && gameShift.delta > 0 ? `Up ${pluralize(gameShift.delta, "spot")} on the ${input.result.game.name} board.` : "No board movement from this result.",
          }
        : getExcludedBoardValue(input.result, isTenantVisible),
      totalPoints: {
        value: `${input.result.totalPointsDelta >= 0 ? "+" : ""}${input.result.totalPointsDelta} pts`,
        note: `Season total is now ${currentOverallPoints} pts.`,
      },
      overallRank: boardEligible
        ? {
            value: formatRank(currentOverallRank),
            note: overallShift.delta && overallShift.delta > 0 ? `Up ${pluralize(overallShift.delta, "spot")} on the overall board.` : currentOverallRank ? "No overall rank movement from this result." : "You still need another ranked result to enter the overall board.",
          }
        : getExcludedOverallValue(input.result, currentOverallRank, isTenantVisible),
    },
    stateExplanation: input.result.status === "PENDING_SAVE"
      ? "This run is stored locally, but rankings and total points stay provisional until the retry succeeds."
      : input.result.status === "FAILED"
        ? "This run ended without a clear, so it stays in history without changing rankings or total points."
      : input.result.status === "ABANDONED"
        ? "This run was recorded as abandoned, so it stays in history without changing rankings or total points."
        : null,
    gameKey: gameScope,
    gameName: input.result.game.name,
    shareUrl,
    shareText,
    shareAvailabilityNote: getShareAvailabilityNote(input.result, canShare),
    canShare,
    rankingsHref: `/rankings?period=season&scope=${gameScope}`,
  } satisfies ResultViewModel;
}

export function buildPendingResultDraftView(input: {
  draft: PendingResultDraft;
  gameName: string;
}) {
  const gameKey = input.draft.gameKey as GameKey;
  const primaryMetricText = formatPrimaryMetric(gameKey, input.draft.actualMetrics.primaryMetric);
  const supportMetric = input.draft.gameKey === "minesweeper"
    ? {
        label: "Mistakes",
        value: String(input.draft.actualMetrics.mistakeCount ?? 0),
        note: (input.draft.actualMetrics.mistakeCount ?? 0) === 0
          ? "Clean board kept in recovery."
          : `${pluralize(input.draft.actualMetrics.mistakeCount ?? 0, "mistake")} kept in recovery.`,
      }
    : input.draft.gameKey === "sudoku"
      ? {
          label: "Hints used",
          value: String(input.draft.actualMetrics.hintCount ?? 0),
          note: (input.draft.actualMetrics.hintCount ?? 0) === 0
            ? "No hints recorded in recovery."
            : `${pluralize(input.draft.actualMetrics.hintCount ?? 0, "hint")} kept in recovery.`,
        }
      : {
          label: "Hit rating",
          ...getDropLineHitRating(input.draft.actualMetrics.primaryMetric, input.draft.outcome === "failed" ? "FAILED" : "COMPLETED"),
        };
  const willPublishToLeaderboard = input.draft.outcome !== "failed";
  const savedResultLabel = input.draft.outcome === "failed" ? "run" : input.draft.gameKey === "drop-line" ? "hit" : "clear";
  const stateExplanation = input.draft.recoveryReason === "session_expired"
    ? `Your session ended while Arcade was saving this ${savedResultLabel}. Sign in again, then retry once to publish it.`
    : willPublishToLeaderboard
      ? `Arcade kept this ${savedResultLabel} after a save problem. Retry once to publish it to rankings and total points.`
      : "Arcade kept this failed run after a save problem. Retry once to publish it to history.";

  return {
    id: input.draft.id,
    viewerMode: "owner",
    status: "PENDING_SAVE",
    statusLabel: "Pending save",
    difficulty: input.draft.difficulty,
    summaryText: `${input.gameName} ${input.draft.difficulty.toLowerCase()} ${savedResultLabel} was preserved for recovery.`,
    primaryMetricLabel: getResultPrimaryMetricLabel(gameKey, "PENDING_SAVE"),
    primaryMetric: primaryMetricText,
    supportMetricLabel: supportMetric.label,
    supportMetricValue: supportMetric.value,
    supportMetricNote: supportMetric.note,
    selfBestBadge: "Recovery pending",
    selfBestDeltaLabel: "Retry required",
    selfBestDetail: `The ${savedResultLabel} is preserved locally until a retry publishes it.`,
    competitivePoints: 0,
    impact: {
      gameRank: {
        value: "Pending",
        note: willPublishToLeaderboard ? "Board rank will update only after the retry succeeds." : "Failed runs stay outside the game board even after the retry succeeds.",
      },
      totalPoints: {
        value: "Pending",
        note: willPublishToLeaderboard ? "Total points stay unchanged until publish succeeds." : "Total points will remain unchanged for a failed run.",
      },
      overallRank: {
        value: "Pending",
        note: willPublishToLeaderboard ? "Overall rank stays unchanged until publish succeeds." : "Overall rank will remain unchanged for a failed run.",
      },
    },
    stateExplanation,
    gameKey,
    gameName: input.gameName,
    shareUrl: "",
    shareText: "",
    shareAvailabilityNote: "Teams share stays locked until the retry succeeds and the result becomes a completed published record.",
    canShare: false,
    rankingsHref: `/rankings?period=season&scope=${input.draft.gameKey}`,
  } satisfies ResultViewModel;
}
