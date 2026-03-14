import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import { useLineConnectSession } from "./use-line-connect-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useLineConnectWorkspace(workspace: GameWorkspaceController) {
  const lineConnect = useLineConnectSession(workspace.difficulty);
  const isRunIdle = lineConnect.state === "idle";
  const isLiveRun = lineConnect.state === "playing";
  const isRunCleared = lineConnect.state === "cleared";
  const isRunFailed = lineConnect.state === "failed";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : "completeSteady",
          mistakeCount: lineConnect.correctionsCount,
          primaryMetric: Math.max(1, lineConnect.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (lineConnect.state === "cleared") {
      playRunClear();
    } else if (lineConnect.state === "failed") {
      playRunFail();
    }
  }, [lineConnect.state]);

  return {
    finishDetail: isRunCleared
      ? `All ${lineConnect.completedPairCount} pairs were connected with ${lineConnect.correctionsCount} corrections.`
      : isRunFailed
        ? `The timer expired with ${lineConnect.completedPairCount} connected pairs and ${lineConnect.correctionsCount} corrections.`
        : "Connect the active pair one segment at a time. Crosses, loops, and resets all count as corrections.",
    handleCellPress(slot: number) {
      const result = lineConnect.tapCell(slot);

      if (result === "extended" || result === "locked" || result === "cleared") {
        playTapCorrect();
      } else if (result === "invalid") {
        playTapWrong();
      }
    },
    handleResetPair() {
      const result = lineConnect.resetPair();

      if (result === "invalid") {
        playTapWrong();
      }
    },
    handleResetPuzzle() {
      const result = lineConnect.resetPuzzle();

      if (result === "invalid") {
        playTapWrong();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      lineConnect.beginRun();
    },
    handleUndoStep() {
      const result = lineConnect.undoStep();

      if (result === "stepped-back") {
        playTapCorrect();
      }
    },
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    lineConnect,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isLiveRun ? "Drawing" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : "Build the path",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another board" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, lineConnect.timeLimitSeconds - lineConnect.elapsedSeconds)),
  };
}
