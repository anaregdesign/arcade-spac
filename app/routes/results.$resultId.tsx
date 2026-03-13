import { redirect, useLoaderData } from "react-router";

import type { Route } from "./+types/results.$resultId";
import { AppShell } from "../components/app-shell";
import { ResultScreen } from "../components/gameplay/result-screen";
import { requireCurrentUserId } from "../lib/server/infrastructure/auth/session.server";
import { getRuntimeConfig } from "../lib/server/infrastructure/config/runtime-config.server";
import { getHomeDashboard } from "../lib/server/usecase/get-home-dashboard.server";
import { listLeaderboardEntries } from "../lib/server/infrastructure/repositories/rankings-profile.repository.server";
import { retryPendingResult } from "../lib/server/usecase/gameplay/record-gameplay-result.server";
import { getPlayResultById } from "../lib/server/infrastructure/repositories/gameplay.repository.server";

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

function getSupportMetric(result: Awaited<ReturnType<typeof getPlayResultById>> extends infer T ? NonNullable<T> : never) {
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

function getSelfBestSummary(result: Awaited<ReturnType<typeof getPlayResultById>> extends infer T ? NonNullable<T> : never) {
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

export async function loader({ request, params }: Route.LoaderArgs) {
  const userId = await requireCurrentUserId(request);
  const runtimeConfig = getRuntimeConfig();
  const requestUrl = new URL(request.url);
  const publicBaseUrl = runtimeConfig.publicAppUrl ?? requestUrl.origin;
  const [dashboard, result] = await Promise.all([
    getHomeDashboard(userId),
    getPlayResultById(params.resultId),
  ]);

  if (!result || result.userId !== userId) {
    throw new Response("Result not found", { status: 404 });
  }

  const [overallEntries, gameEntries] = await Promise.all([
    listLeaderboardEntries("SEASON", "overall"),
    listLeaderboardEntries("SEASON", result.game.key.toLowerCase() as "minesweeper" | "sudoku"),
  ]);

  const primaryMetricText = formatDuration(result.primaryMetric);
  const supportMetric = getSupportMetric(result);
  const selfBest = getSelfBestSummary(result);
  const overallShift = result.leaderboardEligible ? getRankShift(overallEntries, userId, result.totalPointsDelta) : { currentRank: null, delta: null };
  const gameShift = result.leaderboardEligible ? getRankShift(gameEntries, userId, result.totalPointsDelta) : { currentRank: null, delta: null };
  const currentOverallRank = dashboard.summaries.seasonRank;
  const currentOverallPoints = dashboard.summaries.seasonPoints;
  const shareText = [
    `Arcade: ${result.game.name} ${result.difficulty.toLowerCase()} in ${primaryMetricText}.`,
    `${selfBest.shareLine}.`,
    `Total ${currentOverallPoints} pts, overall ${currentOverallRank ? formatRank(currentOverallRank) : "unranked"}.`,
    `View result: ${publicBaseUrl}/results/${result.id}`,
  ].join(" ");

  return {
    dashboard,
    result: {
      id: result.id,
      status: result.status,
      statusLabel: getStatusLabel(result.status),
      difficulty: result.difficulty,
      summaryText: result.summaryText,
      primaryMetric: primaryMetricText,
      supportMetricLabel: supportMetric.label,
      supportMetricValue: supportMetric.value,
      supportMetricNote: supportMetric.note,
      selfBestBadge: selfBest.badge,
      selfBestDeltaLabel: selfBest.deltaLabel,
      selfBestDetail: selfBest.detail,
      competitivePoints: result.competitivePoints,
      impact: {
        gameRank: result.leaderboardEligible
          ? {
              value: formatRank(gameShift.currentRank),
              note: gameShift.delta && gameShift.delta > 0 ? `Up ${pluralize(gameShift.delta, "spot")} on the ${result.game.name} board.` : "No board movement from this result.",
            }
          : {
              value: result.status === "PENDING_SAVE" ? "Pending" : "Excluded",
              note: result.status === "PENDING_SAVE" ? "This result is visible but does not enter the board until save retry succeeds." : "Abandoned or unconfirmed runs do not enter the game board.",
            },
        totalPoints: {
          value: `${result.totalPointsDelta >= 0 ? "+" : ""}${result.totalPointsDelta} pts`,
          note: `Season total is now ${currentOverallPoints} pts.`,
        },
        overallRank: result.leaderboardEligible
          ? {
              value: formatRank(currentOverallRank),
              note: overallShift.delta && overallShift.delta > 0 ? `Up ${pluralize(overallShift.delta, "spot")} on the overall board.` : currentOverallRank ? "No overall rank movement from this result." : "You still need another ranked result to enter the overall board.",
            }
          : {
              value: formatRank(currentOverallRank),
              note: result.status === "PENDING_SAVE" ? "Overall ranking stays provisional until the save is confirmed." : "Overall ranking does not change for abandoned or excluded runs.",
            },
      },
      stateExplanation: result.status === "PENDING_SAVE"
        ? "This run is stored locally, but rankings and total points stay provisional until the retry succeeds."
        : result.status === "ABANDONED"
          ? "This run was recorded as abandoned, so it stays in history without changing rankings or total points."
          : null,
      gameKey: result.game.key.toLowerCase(),
      gameName: result.game.name,
      shareUrl: `${publicBaseUrl}/results/${result.id}`,
      shareText,
      canShare: result.status === "COMPLETED",
    },
  };
}

export async function action({ request, params }: Route.ActionArgs) {
  await requireCurrentUserId(request);
  const formData = await request.formData();

  if (formData.get("intent") === "retryPending") {
    const resultId = await retryPendingResult(params.resultId);
    return redirect(`/results/${resultId}`);
  }

  throw new Response("Unsupported action", { status: 400 });
}

export default function ResultRoute() {
  const { dashboard, result } = useLoaderData<typeof loader>();

  return (
    <AppShell
      currentPath="games"
      titleEmoji="✨"
      sectionLabel="Run result"
      title={`${result.gameName} result`}
      user={dashboard.user}
    >
      <ResultScreen result={result} />
    </AppShell>
  );
}