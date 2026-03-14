import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useMirrorMatchSession } from "./use-mirror-match-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useMirrorMatchWorkspace(workspace: GameWorkspaceController) {
  const mirrorMatch = useMirrorMatchSession(workspace.difficulty);
  const isRunIdle = mirrorMatch.state === "idle";
  const isLiveRun = mirrorMatch.state === "playing";
  const isRunCleared = mirrorMatch.state === "cleared";
  const isRunFailed = mirrorMatch.state === "failed";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : "completeSteady",
          mistakeCount: mirrorMatch.moveCount,
          primaryMetric: Math.max(1, mirrorMatch.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (mirrorMatch.state === "cleared") {
      playRunClear();
    } else if (mirrorMatch.state === "failed") {
      playRunFail();
    }
  }, [mirrorMatch.state]);

  return {
    finishDetail: isRunCleared
      ? "The mirrored board was rebuilt and the Result screen opens automatically."
      : isRunFailed
        ? "The timer expired before the mirrored target was matched."
        : "Copy the mirrored target by toggling the editable board until both patterns match.",
    handleCellPress(rowIndex: number, columnIndex: number) {
      const result = mirrorMatch.toggleCell(rowIndex, columnIndex);

      if (result === "toggled") {
        playTapCorrect();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      mirrorMatch.beginRun();
    },
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    mirrorMatch,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isLiveRun ? "Live" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : "Mirror the target",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another board" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, mirrorMatch.timeLimitSeconds - mirrorMatch.elapsedSeconds)),
  };
}
