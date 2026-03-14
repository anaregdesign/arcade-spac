import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import { useBoxFillSession } from "./use-box-fill-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useBoxFillWorkspace(workspace: GameWorkspaceController) {
  const boxFill = useBoxFillSession(workspace.difficulty);
  const isRunIdle = boxFill.state === "idle";
  const isLiveRun = boxFill.state === "playing";
  const isRunCleared = boxFill.state === "cleared";
  const isRunFailed = boxFill.state === "failed";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : "completeSteady",
          mistakeCount: boxFill.placementErrors,
          primaryMetric: Math.max(1, boxFill.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (boxFill.state === "cleared") {
      playRunClear();
    } else if (boxFill.state === "failed") {
      playRunFail();
    }
  }, [boxFill.state]);

  return {
    boxFill,
    finishDetail: isRunCleared
      ? `All target cells were packed with ${boxFill.placementErrors} placement errors.`
      : isRunFailed
        ? `The timer expired with ${boxFill.filledCellCount}/${boxFill.targetCellCount} target cells filled.`
        : "Select a tray piece, rotate it if needed, tap a board anchor to preview the fit, then place it into the open box.",
    handlePlacePiece() {
      const result = boxFill.placeSelectedPiece();

      if (result === "placed" || result === "cleared") {
        playTapCorrect();
      } else if (result === "invalid") {
        playTapWrong();
      }
    },
    handleRotatePiece() {
      boxFill.rotateSelectedPiece();
      playTapCorrect();
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      boxFill.beginRun();
    },
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isLiveRun ? "Packing" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : "Pack the box",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another box" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, boxFill.timeLimitSeconds - boxFill.elapsedSeconds)),
  };
}
