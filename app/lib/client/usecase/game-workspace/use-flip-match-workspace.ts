import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import { useFlipMatchSession } from "./use-flip-match-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useFlipMatchWorkspace(workspace: GameWorkspaceController) {
  const flipMatch = useFlipMatchSession(workspace.difficulty);
  const isRunIdle = flipMatch.state === "idle";
  const isLiveRun = flipMatch.state === "playing";
  const isRunCleared = flipMatch.state === "cleared";
  const isRunFailed = flipMatch.state === "failed";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : "completeSteady",
          mistakeCount: flipMatch.flipCount,
          primaryMetric: Math.max(1, flipMatch.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (flipMatch.state === "cleared") {
      playRunClear();
    } else if (flipMatch.state === "failed") {
      playRunFail();
    }
  }, [flipMatch.state]);

  return {
    finishDetail: isRunCleared
      ? "Every board in the sprint matched its target silhouette and the Result screen opens automatically."
      : isRunFailed
        ? "The timer expired before every target board was matched."
        : "Tap a live tile to flip itself plus its left and right neighbors. Match each target silhouette with as few flips as you can.",
    flipMatch,
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      flipMatch.beginRun();
    },
    handleTilePress(rowIndex: number, columnIndex: number) {
      const result = flipMatch.flipTile(rowIndex, columnIndex);

      if (result === "flipped") {
        playTapCorrect();
      }
    },
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    ruleLabel: "Rule: self + left + right",
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isLiveRun ? "Live" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : "Match every target board",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another sprint" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, flipMatch.timeLimitSeconds - flipMatch.elapsedSeconds)),
  };
}
