import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useCascadeClearSession } from "./use-cascade-clear-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useCascadeClearWorkspace(workspace: GameWorkspaceController) {
  const cascadeClear = useCascadeClearSession(workspace.difficulty);
  const isRunIdle = cascadeClear.state === "idle";
  const isLiveRun = cascadeClear.state === "planning";
  const isRunCleared = cascadeClear.state === "cleared";
  const isRunFailed = cascadeClear.state === "failed";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          hintCount: cascadeClear.bestCascadeCount,
          intent: outcome === "failed" ? "fail" : "completeSteady",
          mistakeCount: 0,
          primaryMetric: Math.max(1, cascadeClear.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (cascadeClear.state === "cleared") {
      playRunClear();
    } else if (cascadeClear.state === "failed") {
      playRunFail();
    }
  }, [cascadeClear.state]);

  return {
    cascadeClear,
    finishDetail: isRunCleared
      ? `Target score ${cascadeClear.targetScore} was reached with a best cascade of ${cascadeClear.bestCascadeCount} and ${cascadeClear.movesRemaining} triggers left.`
      : isRunFailed
        ? `The trigger limit ended at ${cascadeClear.currentScore}/${cascadeClear.targetScore} with a best cascade of ${cascadeClear.bestCascadeCount}.`
        : "Fire one row or column trigger at a time and watch which refill pattern creates the largest connected color clear.",
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      cascadeClear.beginRun();
    },
    handleTrigger(kind: "row" | "column", index: number) {
      const result = cascadeClear.fireTrigger(kind, index);

      if (result === "resolved" || result === "cleared") {
        playTapCorrect();
      }
    },
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Out of triggers" : isLiveRun ? "Planning" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : "Fire a trigger",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another board" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, cascadeClear.timeLimitSeconds - cascadeClear.elapsedSeconds)),
  };
}
