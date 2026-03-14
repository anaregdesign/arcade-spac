import { useEffect, useRef } from "react";

import { playPadFlash, playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import { usePositionLockSession } from "./use-position-lock-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function usePositionLockWorkspace(workspace: GameWorkspaceController) {
  const positionLock = usePositionLockSession(workspace.difficulty);
  const isRunIdle = positionLock.state === "idle";
  const isWatching = positionLock.state === "watching";
  const isInputting = positionLock.state === "inputting";
  const isReviewing = positionLock.state === "reviewing";
  const isLiveRun = isWatching || isInputting || isReviewing;
  const isRunCleared = positionLock.state === "cleared";
  const isRunFailed = positionLock.state === "failed";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const resultIntent = positionLock.placementErrorCount === 0 ? "completeClean" : "completeSteady";
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : resultIntent,
          mistakeCount: positionLock.placementErrorCount,
          primaryMetric: Math.max(1, positionLock.elapsedSeconds),
        }
      : null,
    workspace,
  });

  const previousWatchFrameIndexRef = useRef(positionLock.watchFrameIndex);

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (isWatching && positionLock.watchFrameIndex !== previousWatchFrameIndexRef.current) {
      playPadFlash("slate");
    }

    previousWatchFrameIndexRef.current = positionLock.watchFrameIndex;
  }, [isWatching, positionLock.watchFrameIndex]);

  useEffect(() => {
    if (positionLock.state === "cleared") {
      playRunClear();
    } else if (positionLock.state === "failed") {
      playRunFail();
    }
  }, [positionLock.state]);

  return {
    finishDetail: isRunCleared
      ? `The full placement sprint was cleared with ${positionLock.exactCount} exact placements and ${positionLock.nearCount} near placements.`
      : isRunFailed
        ? "The timer expired before the final board was fully reviewed."
        : isWatching
          ? "Watch the tokens settle into their final cells. Placement unlocks after the watch phase ends."
          : isInputting
            ? "Select a token, tap its remembered cell, and place every token before the round review begins."
            : isReviewing
              ? `Round review: ${positionLock.review?.exactCount ?? 0} exact, ${positionLock.review?.nearCount ?? 0} near, ${positionLock.review?.missCount ?? 0} misses.`
              : "Watch the moving tokens, then rebuild the same final arrangement from memory.",
    handleCellPress(rowIndex: number, columnIndex: number) {
      const result = positionLock.placeToken(rowIndex, columnIndex);

      if (result === "placed" || result === "review") {
        playTapCorrect();
      } else if (result === "blocked") {
        playTapWrong();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      positionLock.beginRun();
    },
    handleTokenSelect(tokenId: string) {
      const result = positionLock.selectToken(tokenId);

      if (result === "selected") {
        playTapCorrect();
      }
    },
    isInputting,
    isLiveRun,
    isReviewing,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    isWatching,
    positionLock,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isWatching ? "Watch" : isInputting ? "Place" : isReviewing ? "Review" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : isWatching
          ? "Watch the board"
          : isInputting
            ? "Place the tokens"
            : isReviewing
              ? "Scoring the round"
              : "Start the sprint",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another sprint" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, positionLock.timeLimitSeconds - positionLock.elapsedSeconds)),
  };
}
