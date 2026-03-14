import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useHiddenFindSession } from "./use-hidden-find-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useHiddenFindWorkspace(workspace: GameWorkspaceController) {
  const hiddenFind = useHiddenFindSession(workspace.difficulty);
  const isRunIdle = hiddenFind.state === "idle";
  const isLiveRun = hiddenFind.state === "playing";
  const isRunCleared = hiddenFind.state === "cleared";
  const isRunFailed = hiddenFind.state === "failed";
  const resultIntent = hiddenFind.falseTapCount === 0 ? "completeClean" : "completeSteady";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : resultIntent,
          mistakeCount: hiddenFind.falseTapCount,
          primaryMetric: Math.max(1, hiddenFind.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (hiddenFind.state === "cleared") {
      playRunClear();
    } else if (hiddenFind.state === "failed") {
      playRunFail();
    }
  }, [hiddenFind.state]);

  return {
    finishDetail: isRunCleared
      ? "Every scene target was found and the Result screen opens automatically."
      : isRunFailed
        ? "The timer expired before the full scene set was cleared."
        : "Find the exact target motif in each crowded scene. Wrong taps add time pressure but the run keeps going.",
    handleCellPress(rowIndex: number, columnIndex: number) {
      const result = hiddenFind.pressCell(rowIndex, columnIndex);

      if (result === "correct") {
        playTapCorrect();
      } else if (result === "wrong") {
        playTapWrong();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      hiddenFind.beginRun();
    },
    hiddenFind,
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isLiveRun ? "Live" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : "Search the scene",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another scene set" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, hiddenFind.timeLimitSeconds - hiddenFind.elapsedSeconds)),
  };
}
