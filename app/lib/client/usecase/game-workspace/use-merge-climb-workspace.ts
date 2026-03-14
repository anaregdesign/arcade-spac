import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useMergeClimbSession } from "./use-merge-climb-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

type Direction = "up" | "right" | "down" | "left";

export function useMergeClimbWorkspace(workspace: GameWorkspaceController) {
  const mergeClimb = useMergeClimbSession(workspace.difficulty);
  const isRunIdle = mergeClimb.state === "idle";
  const isLiveRun = mergeClimb.state === "playing";
  const isRunCleared = mergeClimb.state === "cleared";
  const isRunFailed = mergeClimb.state === "failed";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : "completeSteady",
          mistakeCount: mergeClimb.moveCount,
          primaryMetric: Math.max(1, mergeClimb.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (mergeClimb.state === "cleared") {
      playRunClear();
    } else if (mergeClimb.state === "failed") {
      playRunFail();
    }
  }, [mergeClimb.state]);

  return {
    finishDetail: isRunCleared
      ? `The goal tile ${mergeClimb.targetValue} was reached in ${mergeClimb.moveCount} moves with ${mergeClimb.emptyCellCount} empty cells still open.`
      : isRunFailed
        ? `The board locked before the goal tile was reached. Max value ${mergeClimb.maxValue} with ${mergeClimb.moveCount} moves recorded.`
        : "Slide the board with the direction pad, combine matching values once per move, and keep space open for the next spawn.",
    handleDirectionPress(direction: Direction) {
      const result = mergeClimb.move(direction);

      if (result === "moved" || result === "cleared" || result === "failed") {
        playTapCorrect();
      } else if (result === "blocked") {
        playTapWrong();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      mergeClimb.beginRun();
    },
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    mergeClimb,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Locked" : isLiveRun ? "Climbing" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : "Keep merging",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another climb" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, mergeClimb.timeLimitSeconds - mergeClimb.elapsedSeconds)),
  };
}
