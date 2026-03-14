import { useEffect, useRef } from "react";

import { playPadFlash, playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import { usePatternEchoSession } from "./use-pattern-echo-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function usePatternEchoWorkspace(workspace: GameWorkspaceController) {
  const patternEcho = usePatternEchoSession(workspace.difficulty);
  const isRunIdle = patternEcho.state === "idle";
  const isWatching = patternEcho.state === "watching";
  const isInputting = patternEcho.state === "inputting";
  const isLiveRun = isWatching || isInputting;
  const isRunCleared = patternEcho.state === "cleared";
  const isRunFailed = patternEcho.state === "failed";
  const resultIntent = patternEcho.wrongInputCount === 0 ? "completeClean" : "completeSteady";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : resultIntent,
          mistakeCount: patternEcho.wrongInputCount,
          primaryMetric: patternEcho.elapsedSeconds,
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (patternEcho.flashingPadIndex === null) {
      return;
    }

    const pad = patternEcho.pads[patternEcho.flashingPadIndex];

    if (pad) {
      playPadFlash(pad.color);
    }
  }, [patternEcho.flashingPadIndex, patternEcho.pads]);

  const prevInputStepRef = useRef(patternEcho.inputStep);
  const prevWrongInputCountRef = useRef(patternEcho.wrongInputCount);

  useEffect(() => {
    if (patternEcho.state !== "inputting") {
      prevInputStepRef.current = patternEcho.inputStep;
      prevWrongInputCountRef.current = patternEcho.wrongInputCount;
      return;
    }

    if (patternEcho.inputStep > prevInputStepRef.current) {
      playTapCorrect();
    } else if (patternEcho.wrongInputCount > prevWrongInputCountRef.current) {
      playTapWrong();
    }

    prevInputStepRef.current = patternEcho.inputStep;
    prevWrongInputCountRef.current = patternEcho.wrongInputCount;
  }, [patternEcho.inputStep, patternEcho.state, patternEcho.wrongInputCount]);

  useEffect(() => {
    if (patternEcho.state === "cleared") {
      playRunClear();
    } else if (patternEcho.state === "failed") {
      playRunFail();
    }
  }, [patternEcho.state]);

  return {
    finishDetail: isRunCleared
      ? "The clear time and wrong input count were captured. The Result screen opens automatically."
      : isRunFailed
        ? "The timer expired before the sequence was completed."
        : isWatching
          ? "Watch every pad carefully — your input turn starts as soon as the last one fades."
          : "Tap each pad in the order it lit up. Wrong taps are counted but the run keeps going.",
    handlePadPress(padIndex: number) {
      patternEcho.tapPad(padIndex);
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      patternEcho.beginRun();
    },
    isInputting,
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    isWatching,
    patternEcho,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isWatching ? "Watching" : isInputting ? "Live" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : isWatching
          ? "Watch the sequence"
          : "Repeat the sequence",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another board" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, patternEcho.timeLimitSeconds - patternEcho.elapsedSeconds)),
  };
}
