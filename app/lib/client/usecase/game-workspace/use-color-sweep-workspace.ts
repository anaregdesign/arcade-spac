import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../sound-effects";
import { formatDuration } from "./display";
import { useColorSweepSession } from "./use-color-sweep-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

const targetColorLabelByKey = {
  amber: "Amber",
  coral: "Coral",
  mint: "Mint",
  plum: "Plum",
  sky: "Sky",
  slate: "Slate",
} as const;

export function useColorSweepWorkspace(workspace: GameWorkspaceController) {
  const colorSweep = useColorSweepSession(workspace.difficulty);
  const isRunIdle = colorSweep.state === "idle";
  const isLiveRun = colorSweep.state === "playing";
  const isRunCleared = colorSweep.state === "cleared";
  const isRunFailed = colorSweep.state === "failed";
  const resultIntent = colorSweep.wrongTapCount === 0 ? "completeClean" : "completeSteady";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : resultIntent,
          mistakeCount: colorSweep.wrongTapCount,
          primaryMetric: colorSweep.elapsedSeconds,
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (colorSweep.state === "cleared") {
      playRunClear();
    } else if (colorSweep.state === "failed") {
      playRunFail();
    }
  }, [colorSweep.state]);

  return {
    colorSweep,
    finishDetail: isRunCleared
      ? "Clear time and wrong taps were captured. The Result screen opens automatically."
      : isRunFailed
        ? "The time limit expired before every target tile was cleared."
        : "Tap only the target color. Wrong taps count against quality, and the run ends when the timer expires.",
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      colorSweep.beginRun();
    },
    handleTilePress(rowIndex: number, columnIndex: number) {
      const cell = colorSweep.board[rowIndex]?.[columnIndex];

      if (colorSweep.state === "playing" && cell && !cell.isCleared) {
        if (cell.isTarget) {
          playTapCorrect();
        } else {
          playTapWrong();
        }
      }

      colorSweep.tapCell(rowIndex, columnIndex);
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
        : "Clear every target tile",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another board" : "Start run",
    targetColorLabel: targetColorLabelByKey[colorSweep.targetColorKey],
    timeLeftLabel: formatDuration(Math.max(0, colorSweep.timeLimitSeconds - colorSweep.elapsedSeconds)),
  };
}
