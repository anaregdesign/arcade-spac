import { useEffect, useRef } from "react";

import { playPadFlash, playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import { useSequencePointSession } from "./use-sequence-point-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useSequencePointWorkspace(workspace: GameWorkspaceController) {
  const sequencePoint = useSequencePointSession(workspace.difficulty);
  const isRunIdle = sequencePoint.state === "idle";
  const isWatching = sequencePoint.state === "watching";
  const isInputting = sequencePoint.state === "inputting";
  const isLiveRun = isWatching || isInputting;
  const isRunCleared = sequencePoint.state === "cleared";
  const isRunFailed = sequencePoint.state === "failed";
  const resultIntent = sequencePoint.mistakeCount === 0 ? "completeClean" : "completeSteady";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : resultIntent,
          mistakeCount: sequencePoint.mistakeCount,
          primaryMetric: Math.max(1, sequencePoint.elapsedSeconds),
        }
      : null,
    workspace,
  });

  const previousFlashIndexRef = useRef<number | null>(sequencePoint.flashingPointIndex);

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (
      sequencePoint.flashingPointIndex !== null
      && previousFlashIndexRef.current !== sequencePoint.flashingPointIndex
    ) {
      playPadFlash("sky");
    }

    previousFlashIndexRef.current = sequencePoint.flashingPointIndex;
  }, [sequencePoint.flashingPointIndex]);

  useEffect(() => {
    if (sequencePoint.state === "cleared") {
      playRunClear();
    } else if (sequencePoint.state === "failed") {
      playRunFail();
    }
  }, [sequencePoint.state]);

  return {
    finishDetail: isRunCleared
      ? "The full point sprint was recalled and the Result screen opens automatically."
      : isRunFailed
        ? "The timer expired before the point sprint reached its final sequence."
        : isWatching
          ? "Watch the points flash in order. Input unlocks as soon as the watch phase ends."
          : "Tap the same points in the same order. Mistakes are counted but the sprint keeps going.",
    handlePointPress(pointIndex: number) {
      const result = sequencePoint.tapPoint(pointIndex);

      if (result === "correct") {
        playTapCorrect();
      } else if (result === "wrong") {
        playTapWrong();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      sequencePoint.beginRun();
    },
    isInputting,
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    isWatching,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isWatching ? "Watching" : isInputting ? "Input" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : isWatching
          ? "Watch the sequence"
          : "Replay the sequence",
    sequencePoint,
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another sprint" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, sequencePoint.timeLimitSeconds - sequencePoint.elapsedSeconds)),
  };
}
