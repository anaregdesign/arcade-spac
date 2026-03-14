import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import { useRotateAlignSession } from "./use-rotate-align-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useRotateAlignWorkspace(workspace: GameWorkspaceController) {
  const rotateAlign = useRotateAlignSession(workspace.difficulty);
  const isRunIdle = rotateAlign.state === "idle";
  const isLiveRun = rotateAlign.state === "playing";
  const isRunCleared = rotateAlign.state === "cleared";
  const isRunFailed = rotateAlign.state === "failed";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : "completeSteady",
          mistakeCount: rotateAlign.rotationCount,
          primaryMetric: Math.max(1, rotateAlign.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (rotateAlign.state === "cleared") {
      playRunClear();
    } else if (rotateAlign.state === "failed") {
      playRunFail();
    }
  }, [rotateAlign.state]);

  return {
    finishDetail: isRunCleared
      ? "Every route board was aligned and the Result screen opens automatically."
      : isRunFailed
        ? "The timer expired before every route was reconnected."
        : "Rotate the path tiles until the route runs cleanly from the start marker to the end marker.",
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      rotateAlign.beginRun();
    },
    handleTilePress(rowIndex: number, columnIndex: number) {
      const result = rotateAlign.rotateTile(rowIndex, columnIndex);

      if (result === "rotated") {
        playTapCorrect();
      }
    },
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    rotateAlign,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isLiveRun ? "Live" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : "Reconnect the route",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another sprint" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, rotateAlign.timeLimitSeconds - rotateAlign.elapsedSeconds)),
  };
}
