import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import { useShapeMorphSession, type Glyph } from "./use-shape-morph-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useShapeMorphWorkspace(workspace: GameWorkspaceController) {
  const shapeMorph = useShapeMorphSession(workspace.difficulty);
  const isRunIdle = shapeMorph.state === "idle";
  const isLiveRun = shapeMorph.state === "playing";
  const isRunCleared = shapeMorph.state === "cleared";
  const isRunFailed = shapeMorph.state === "failed";
  const resultIntent = shapeMorph.wrongAnswerCount === 0 ? "completeClean" : "completeSteady";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : resultIntent,
          mistakeCount: shapeMorph.wrongAnswerCount,
          primaryMetric: Math.max(1, shapeMorph.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (shapeMorph.state === "cleared") {
      playRunClear();
    } else if (shapeMorph.state === "failed") {
      playRunFail();
    }
  }, [shapeMorph.state]);

  return {
    finishDetail: isRunCleared
      ? "Every morph prompt was solved and the Result screen opens automatically."
      : isRunFailed
        ? "The timer expired before the full morph sprint was completed."
        : "Read the visual rule, choose the next transformed shape, and keep wrong answers low.",
    handleAnswer(choice: Glyph) {
      const result = shapeMorph.answerProblem(choice);

      if (result === "correct") {
        playTapCorrect();
      } else if (result === "wrong") {
        playTapWrong();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      shapeMorph.beginRun();
    },
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isLiveRun ? "Live" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : "Predict the next shape",
    shapeMorph,
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another sprint" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, shapeMorph.timeLimitSeconds - shapeMorph.elapsedSeconds)),
  };
}