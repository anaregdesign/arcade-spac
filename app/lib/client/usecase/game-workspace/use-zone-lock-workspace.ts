import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";
import { useZoneLockSession } from "./use-zone-lock-session";

export function useZoneLockWorkspace(workspace: GameWorkspaceController) {
  const zoneLock = useZoneLockSession(workspace.difficulty);
  const isRunIdle = zoneLock.state === "idle";
  const isLiveRun = zoneLock.state === "playing";
  const isRunCleared = zoneLock.state === "cleared";
  const isRunFailed = zoneLock.state === "failed";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const resultIntent = zoneLock.resetCount === 0 ? "completeClean" : "completeSteady";
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : resultIntent,
          mistakeCount: zoneLock.resetCount,
          primaryMetric: Math.max(1, zoneLock.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (zoneLock.state === "cleared") {
      playRunClear();
    } else if (zoneLock.state === "failed") {
      playRunFail();
    }
  }, [zoneLock.state]);

  return {
    finishDetail: isRunCleared
      ? `All ${zoneLock.totalZoneCount} zone locks were secured across ${zoneLock.roundCount} puzzles with ${zoneLock.resetCount} resets.`
      : isRunFailed
        ? `The timer expired after ${zoneLock.totalLockedZoneCount} of ${zoneLock.totalZoneCount} zone locks were secured.`
        : isLiveRun
          ? "Toggle cells until every zone card locks at once. Reset only when the current layout has drifted too far."
          : "Read the zone cards, then toggle shared cells until every target count locks at the same time.",
    handleCellPress(rowIndex: number, columnIndex: number) {
      const result = zoneLock.toggleCell(rowIndex, columnIndex);

      if (result === "toggled" || result === "round-cleared" || result === "solved") {
        playTapCorrect();
      }
    },
    handleResetBoard() {
      if (zoneLock.resetBoard() === "reset") {
        playTapWrong();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      zoneLock.beginRun();
    },
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isLiveRun ? "Live" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : "Lock every zone",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another grid" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, zoneLock.timeLimitSeconds - zoneLock.elapsedSeconds)),
    zoneLock,
  };
}
