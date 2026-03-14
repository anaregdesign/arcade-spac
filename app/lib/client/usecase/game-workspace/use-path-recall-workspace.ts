import { useEffect, useRef } from "react";

import { playPadFlash, playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import type { GameWorkspaceController } from "./use-game-workspace";
import { usePathRecallSession } from "./use-path-recall-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function usePathRecallWorkspace(workspace: GameWorkspaceController) {
  const pathRecall = usePathRecallSession(workspace.difficulty);
  const isRunIdle = pathRecall.state === "idle";
  const isWatching = pathRecall.state === "watching";
  const isInputting = pathRecall.state === "inputting";
  const isLiveRun = isWatching || isInputting;
  const isRunCleared = pathRecall.state === "cleared";
  const isRunFailed = pathRecall.state === "failed";
  const resultIntent = pathRecall.wrongCellCount === 0 ? "completeClean" : "completeSteady";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : resultIntent,
          mistakeCount: pathRecall.wrongCellCount,
          primaryMetric: Math.max(1, pathRecall.elapsedSeconds),
        }
      : null,
    workspace,
  });

  const previousFlashStepRef = useRef<number | null>(pathRecall.flashingStepIndex);

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (pathRecall.flashingStepIndex !== null && previousFlashStepRef.current !== pathRecall.flashingStepIndex) {
      playPadFlash("mint");
    }

    previousFlashStepRef.current = pathRecall.flashingStepIndex;
  }, [pathRecall.flashingStepIndex]);

  useEffect(() => {
    if (pathRecall.state === "cleared") {
      playRunClear();
    } else if (pathRecall.state === "failed") {
      playRunFail();
    }
  }, [pathRecall.state]);

  return {
    finishDetail: isRunCleared
      ? "The path was recalled in full and the Result screen opens automatically."
      : isRunFailed
        ? "The timer expired before the path was fully replayed."
        : isWatching
          ? "Watch the highlighted path and remember the full order."
          : "Tap the same cells in the same order. Wrong cells are counted but the run keeps going.",
    handleCellPress(rowIndex: number, columnIndex: number) {
      const result = pathRecall.tapCell(rowIndex, columnIndex);

      if (result === "correct") {
        playTapCorrect();
      } else if (result === "wrong") {
        playTapWrong();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      pathRecall.beginRun();
    },
    isInputting,
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    isWatching,
    pathRecall,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isWatching ? "Watching" : isInputting ? "Live" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : isWatching
          ? "Watch the path"
          : "Replay the path",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another path" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, pathRecall.timeLimitSeconds - pathRecall.elapsedSeconds)),
  };
}
