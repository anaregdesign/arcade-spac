import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import type { DriftColor } from "./use-hue-drift-session";
import { useHueDriftSession } from "./use-hue-drift-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useHueDriftWorkspace(workspace: GameWorkspaceController) {
  const hueDrift = useHueDriftSession(workspace.difficulty);
  const isRunIdle = hueDrift.state === "idle";
  const isLiveRun = hueDrift.state === "playing";
  const isRunCleared = hueDrift.state === "cleared";
  const isRunFailed = hueDrift.state === "failed";
  const resultIntent = hueDrift.mistakeCount === 0 ? "completeClean" : "completeSteady";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : resultIntent,
          mistakeCount: hueDrift.mistakeCount,
          primaryMetric: Math.max(1, hueDrift.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (hueDrift.state === "cleared") {
      playRunClear();
    } else if (hueDrift.state === "failed") {
      playRunFail();
    }
  }, [hueDrift.state]);

  return {
    finishDetail: isRunCleared
      ? "Every drift prompt was solved and the Result screen opens automatically."
      : isRunFailed
        ? "The timer expired before the full drift sprint was completed."
        : "Read the color drift, choose the missing swatch, and keep mistakes low.",
    handleAnswer(choice: DriftColor) {
      const result = hueDrift.answerPrompt(choice);

      if (result === "correct") {
        playTapCorrect();
      } else if (result === "wrong") {
        playTapWrong();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      hueDrift.beginRun();
    },
    hueDrift,
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isLiveRun ? "Live" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : "Infer the missing color",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another sprint" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, hueDrift.timeLimitSeconds - hueDrift.elapsedSeconds)),
  };
}
