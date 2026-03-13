import { listLeaderboardEntries } from "../../infrastructure/repositories/rankings-profile.repository.server";
import { getHomeDashboard } from "../get-home-dashboard.server";
import { getPlayResultById } from "../../infrastructure/repositories/gameplay.repository.server";
import type { PendingResultDraft } from "../../infrastructure/auth/session.server";

type PersistedPlayResult = NonNullable<Awaited<ReturnType<typeof getPlayResultById>>>;
type RankingScope = "minesweeper" | "sudoku";
type ResultViewerMode = "owner" | "shared";

export type ResultViewModel = {
  id: string;
  viewerMode: ResultViewerMode;
  status: string;
  statusLabel: string;
  difficulty: string;
  summaryText: string;
  primaryMetric: string;
  supportMetricLabel: string;
  supportMetricValue: number;
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

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

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
    case "PENDING_SAVE":
      return "Pending save";
    case "ABANDONED":
      return "Abandoned";
    default:
      return status;
  }
}

function getSupportMetric(result: PersistedPlayResult) {
  if (result.game.key === "MINESWEEPER") {
    return {
      label: "Mistakes",
      value: result.mistakeCount ?? 0,
      note: result.mistakeCount === 0 ? "Clean board" : `${pluralize(result.mistakeCount ?? 0, "mistake")} recorded`,
    };
  }

  return {
    label: "Hints used",
    value: result.hintCount ?? 0,
    note: result.hintCount === 0 ? "No hints needed" : `${pluralize(result.hintCount ?? 0, "hint")} used`,
  };
}

function getSelfBestSummary(result: PersistedPlayResult) {
  const previousResults = result.user.playResults
    .filter((entry) => entry.id !== result.id && entry.gameId === result.gameId && entry.status === "COMPLETED" && entry.cleared)
    .sort((left, right) => left.primaryMetric - right.primaryMetric);
  const previousBestMetric = previousResults[0]?.primaryMetric ?? null;

  if (result.status !== "COMPLETED") {
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
    return {
      badge: "Personal best",
      deltaLabel: `-${formatDuration(metricDelta)}`,
      detail: `${formatDuration(metricDelta)} faster than your previous best clear time.`,
      shareLine: `this beat the previous best by ${formatDuration(metricDelta)}`,
    };
  }

  if (metricDelta === 0) {
    return {
      badge: "Matched best",
      deltaLabel: "Even",
      detail: "You matched your best clear time in this game.",
      shareLine: "this matched the current personal best",
    };
  }

  return {
    badge: "Chasing best",
    deltaLabel: `+${formatDuration(Math.abs(metricDelta))}`,
    detail: `${formatDuration(Math.abs(metricDelta))} slower than your best clear time.`,
    shareLine: `the best clear is still ${formatDuration(Math.abs(metricDelta))} faster`,
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

export async function buildPersistedResultView(input: {
  publicBaseUrl: string;
  result: PersistedPlayResult;
  viewerMode: ResultViewerMode;
}) {
  const ownerDashboard = await getHomeDashboard(input.result.userId);
  const primaryMetricText = formatDuration(input.result.primaryMetric);
  const supportMetric = getSupportMetric(input.result);
  const selfBest = getSelfBestSummary(input.result);
  const gameScope = input.result.game.key.toLowerCase() as RankingScope;
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
    `Arcade: ${input.result.game.name} ${input.result.difficulty.toLowerCase()} in ${primaryMetricText}.`,
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
        : {
            value: input.result.status === "PENDING_SAVE" ? "Pending" : isTenantVisible ? "Excluded" : "Private",
            note: input.result.status === "PENDING_SAVE"
              ? "This result is visible but does not enter the board until save retry succeeds."
              : isTenantVisible
                ? "Abandoned or unconfirmed runs do not enter the game board."
                : "Private visibility keeps this result out of the shared game board.",
          },
      totalPoints: {
        value: `${input.result.totalPointsDelta >= 0 ? "+" : ""}${input.result.totalPointsDelta} pts`,
        note: `Season total is now ${currentOverallPoints} pts.`,
      },
      overallRank: boardEligible
        ? {
            value: formatRank(currentOverallRank),
            note: overallShift.delta && overallShift.delta > 0 ? `Up ${pluralize(overallShift.delta, "spot")} on the overall board.` : currentOverallRank ? "No overall rank movement from this result." : "You still need another ranked result to enter the overall board.",
          }
        : {
            value: formatRank(currentOverallRank),
            note: input.result.status === "PENDING_SAVE"
              ? "Overall ranking stays provisional until the save is confirmed."
              : isTenantVisible
                ? "Overall ranking does not change for abandoned or excluded runs."
                : "Private visibility keeps overall ranking hidden from shared boards until the profile becomes tenant-visible.",
          },
    },
    stateExplanation: input.result.status === "PENDING_SAVE"
      ? "This run is stored locally, but rankings and total points stay provisional until the retry succeeds."
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
  const primaryMetricText = formatDuration(input.draft.actualMetrics.primaryMetric);
  const isMinesweeper = input.draft.gameKey === "minesweeper";
  const supportMetricValue = isMinesweeper ? input.draft.actualMetrics.mistakeCount ?? 0 : input.draft.actualMetrics.hintCount ?? 0;
  const supportMetricLabel = isMinesweeper ? "Mistakes" : "Hints used";
  const supportMetricNote = isMinesweeper
    ? supportMetricValue === 0 ? "Clean board kept in recovery." : `${pluralize(supportMetricValue, "mistake")} kept in recovery.`
    : supportMetricValue === 0 ? "No hints recorded in recovery." : `${pluralize(supportMetricValue, "hint")} kept in recovery.`;
  const stateExplanation = input.draft.recoveryReason === "session_expired"
    ? "Your session ended while Arcade was saving this clear. Sign in again, then retry once to publish it."
    : "Arcade kept the clear after a save problem. Retry once to publish it to rankings and total points.";

  return {
    id: input.draft.id,
    viewerMode: "owner",
    status: "PENDING_SAVE",
    statusLabel: "Pending save",
    difficulty: input.draft.difficulty,
    summaryText: `${input.gameName} ${input.draft.difficulty.toLowerCase()} clear was preserved for recovery.`,
    primaryMetric: primaryMetricText,
    supportMetricLabel,
    supportMetricValue,
    supportMetricNote,
    selfBestBadge: "Recovery pending",
    selfBestDeltaLabel: "Retry required",
    selfBestDetail: "The clear is preserved locally until a retry publishes it.",
    competitivePoints: 0,
    impact: {
      gameRank: {
        value: "Pending",
        note: "Board rank will update only after the retry succeeds.",
      },
      totalPoints: {
        value: "Pending",
        note: "Total points stay unchanged until publish succeeds.",
      },
      overallRank: {
        value: "Pending",
        note: "Overall rank stays unchanged until publish succeeds.",
      },
    },
    stateExplanation,
    gameKey: input.draft.gameKey as "minesweeper" | "sudoku",
    gameName: input.gameName,
    shareUrl: "",
    shareText: "",
    shareAvailabilityNote: "Teams share stays locked until the retry succeeds and the result becomes a completed published record.",
    canShare: false,
    rankingsHref: `/rankings?period=season&scope=${input.draft.gameKey}`,
  } satisfies ResultViewModel;
}
