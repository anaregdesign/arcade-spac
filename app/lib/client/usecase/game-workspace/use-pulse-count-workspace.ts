import { useEffect } from "react";

import { playPadFlash, playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import type { GameWorkspaceController } from "./use-game-workspace";
import { usePulseCountSession } from "./use-pulse-count-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function usePulseCountWorkspace(workspace: GameWorkspaceController) {
  const pulseCount = usePulseCountSession(workspace.difficulty);
  const isRunIdle = pulseCount.state === "idle";
  const isWatching = pulseCount.state === "watching";
  const isAnswering = pulseCount.state === "answering";
  const isLiveRun = isWatching || isAnswering;
  const isRunCleared = pulseCount.state === "cleared";
  const isRunFailed = pulseCount.state === "failed";
  const resultIntent = pulseCount.wrongAnswerCount === 0 ? "completeClean" : "completeSteady";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : resultIntent,
          mistakeCount: pulseCount.wrongAnswerCount,
          primaryMetric: Math.max(1, pulseCount.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (pulseCount.isSignalLit) {
      playPadFlash("plum");
    }
  }, [pulseCount.isSignalLit]);

  useEffect(() => {
    if (pulseCount.state === "cleared") {
      playRunClear();
    } else if (pulseCount.state === "failed") {
      playRunFail();
    }
  }, [pulseCount.state]);

  return {
    finishDetail: isRunCleared
      ? "All pulse rounds were finished and the Result screen opens automatically."
      : isRunFailed
        ? "The timer expired before every count round was answered."
        : isWatching
          ? "Count every flash before the answer buttons unlock."
          : "Choose the count you just saw. Wrong answers are recorded but the run keeps going.",
    handleAnswer(value: number) {
      const result = pulseCount.answerRound(value);

      if (result === "correct") {
        playTapCorrect();
      } else if (result === "wrong") {
        playTapWrong();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      pulseCount.beginRun();
    },
    isAnswering,
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    isWatching,
    pulseCount,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isWatching ? "Watching" : isAnswering ? "Answering" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : isWatching
          ? "Count the pulses"
          : "Pick the count",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another sprint" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, pulseCount.timeLimitSeconds - pulseCount.elapsedSeconds)),
  };
}
