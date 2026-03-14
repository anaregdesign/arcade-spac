import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useBlockTessellateSession } from "./use-block-tessellate-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useBlockTessellateWorkspace(workspace: GameWorkspaceController) {
  const blockTessellate = useBlockTessellateSession(workspace.difficulty);
  const isRunIdle = blockTessellate.state === "idle";
  const isLiveRun = blockTessellate.state === "playing";
  const isRunCleared = blockTessellate.state === "cleared";
  const isRunFailed = blockTessellate.state === "failed";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : "completeSteady",
          mistakeCount: blockTessellate.misdropCount,
          primaryMetric: Math.max(1, blockTessellate.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (blockTessellate.state === "cleared") {
      playRunClear();
    } else if (blockTessellate.state === "failed") {
      playRunFail();
    }
  }, [blockTessellate.state]);

  return {
    blockTessellate,
    finishDetail: isRunCleared
      ? `Every silhouette was sealed with ${blockTessellate.misdropCount} misdrops recorded.`
      : isRunFailed
        ? `The timer expired with ${blockTessellate.filledCellCount}/${blockTessellate.targetCellCount} silhouette cells filled and ${blockTessellate.misdropCount} misdrops.`
        : "Guide the falling piece with Left, Rotate, Right, and Hard drop, then lock each queue into the open silhouette without wasting resets.",
    handleDrop() {
      const result = blockTessellate.hardDrop();

      if (result === "placed" || result === "cleared") {
        playTapCorrect();
      } else if (result === "misdrop" || result === "ignored") {
        playTapWrong();
      }
    },
    handleMove(direction: "left" | "right") {
      const result = blockTessellate.move(direction);

      if (result === "moved") {
        playTapCorrect();
      } else if (result === "ignored") {
        playTapWrong();
      }
    },
    handleRotate() {
      const result = blockTessellate.rotate();

      if (result === "moved") {
        playTapCorrect();
      } else if (result === "ignored") {
        playTapWrong();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      blockTessellate.beginRun();
    },
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isLiveRun ? "Stacking" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : "Seal the silhouette",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another stack" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, blockTessellate.timeLimitSeconds - blockTessellate.elapsedSeconds)),
  };
}
