import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import { useTileInstantSession } from "./use-tile-instant-session";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useTileInstantWorkspace(workspace: GameWorkspaceController) {
  const tileInstant = useTileInstantSession(workspace.difficulty);
  const isRunIdle = tileInstant.state === "idle";
  const isWatching = tileInstant.state === "watching";
  const isInputting = tileInstant.state === "inputting";
  const isLiveRun = isWatching || isInputting;
  const isRunCleared = tileInstant.state === "cleared";
  const isRunFailed = tileInstant.state === "failed";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : "completeSteady",
          mistakeCount: tileInstant.moveCount,
          primaryMetric: Math.max(1, tileInstant.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (tileInstant.state === "cleared") {
      playRunClear();
    } else if (tileInstant.state === "failed") {
      playRunFail();
    }
  }, [tileInstant.state]);

  return {
    finishDetail: isRunCleared
      ? `All ${tileInstant.roundCount} boards were reconstructed from memory with ${tileInstant.moveCount} total moves.`
      : isRunFailed
        ? "The timer expired before every flash board was reconstructed."
        : isWatching
          ? "Memorize the target board now. The live board unlocks after the watch phase ends."
          : "Select two live tiles to swap them and rebuild the board from memory.",
    handleCellPress(rowIndex: number, columnIndex: number) {
      const result = tileInstant.pressCell(rowIndex, columnIndex);

      if (result === "selected" || result === "swapped" || result === "solved") {
        playTapCorrect();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      tileInstant.beginRun();
    },
    isInputting,
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    isWatching,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isWatching ? "Watching" : isInputting ? "Rebuild" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : isWatching
          ? "Memorize the target"
          : "Swap into place",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another sprint" : "Start run",
    tileInstant,
    timeLeftLabel: formatDuration(Math.max(0, tileInstant.timeLimitSeconds - tileInstant.elapsedSeconds)),
  };
}
