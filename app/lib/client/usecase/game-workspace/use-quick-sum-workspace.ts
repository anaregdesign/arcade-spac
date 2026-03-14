import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useQuickSumSession } from "./use-quick-sum-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useQuickSumWorkspace(workspace: GameWorkspaceController) {
  const quickSum = useQuickSumSession(workspace.difficulty);
  const isRunIdle = quickSum.state === "idle";
  const isLiveRun = quickSum.state === "playing";
  const isRunCleared = quickSum.state === "cleared";
  const isRunFailed = quickSum.state === "failed";
  const resultIntent = quickSum.wrongAnswerCount === 0 ? "completeClean" : "completeSteady";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : resultIntent,
          mistakeCount: quickSum.wrongAnswerCount,
          primaryMetric: Math.max(1, quickSum.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (quickSum.state === "cleared") {
      playRunClear();
    } else if (quickSum.state === "failed") {
      playRunFail();
    }
  }, [quickSum.state]);

  return {
    finishDetail: isRunCleared
      ? "Every prompt was solved and the Result screen opens automatically."
      : isRunFailed
        ? "The timer expired before the full answer set was completed."
        : "Pick the right result for each prompt. Wrong answers are recorded and the sprint keeps moving.",
    handleAnswer(value: number) {
      const result = quickSum.answerProblem(value);

      if (result === "correct") {
        playTapCorrect();
      } else if (result === "wrong") {
        playTapWrong();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      quickSum.beginRun();
    },
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    quickSum,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isLiveRun ? "Live" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : "Solve the next prompt",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another sprint" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, quickSum.timeLimitSeconds - quickSum.elapsedSeconds)),
  };
}
