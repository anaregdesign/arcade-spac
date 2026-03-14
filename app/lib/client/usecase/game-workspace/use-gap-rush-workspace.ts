import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useGapRushSession } from "./use-gap-rush-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useGapRushWorkspace(workspace: GameWorkspaceController) {
  const gapRush = useGapRushSession(workspace.difficulty);
  const isRunIdle = gapRush.state === "idle";
  const isLiveRun = gapRush.state === "playing";
  const isRunCleared = gapRush.state === "cleared";
  const isRunFailed = gapRush.state === "failed";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          hintCount: gapRush.perfectPassCount,
          intent: outcome === "failed" ? "fail" : "completeSteady",
          primaryMetric: Math.max(1, gapRush.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (gapRush.state === "cleared") {
      playRunClear();
    } else if (gapRush.state === "failed") {
      playRunFail();
    }
  }, [gapRush.state]);

  return {
    finishDetail: isRunCleared
      ? `The corridor was cleared with ${gapRush.clearedCount} walls and ${gapRush.perfectPassCount} perfect passes.`
      : isRunFailed
        ? `The run ended after ${gapRush.clearedCount}/${gapRush.targetWallCount} walls with ${gapRush.perfectPassCount} perfect passes.`
        : "Set the next lane early, let the runner glide into position, and keep the wall streak alive as speed ramps upward.",
    gapRush,
    handleLaneSelect(lane: number) {
      const result = gapRush.chooseLane(lane);

      if (result === "armed") {
        playTapCorrect();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      gapRush.beginRun();
    },
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Crashed" : isLiveRun ? "Rushing" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : "Hold the line",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another rush" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, gapRush.timeLimitSeconds - gapRush.elapsedSeconds)),
  };
}
