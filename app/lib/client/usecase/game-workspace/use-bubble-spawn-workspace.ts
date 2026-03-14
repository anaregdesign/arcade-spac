import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import { useBubbleSpawnSession } from "./use-bubble-spawn-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useBubbleSpawnWorkspace(workspace: GameWorkspaceController) {
  const bubbleSpawn = useBubbleSpawnSession(workspace.difficulty);
  const isRunIdle = bubbleSpawn.state === "idle";
  const isLiveRun = bubbleSpawn.state === "playing";
  const isRunCleared = bubbleSpawn.state === "cleared";
  const isRunFailed = bubbleSpawn.state === "failed";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          hintCount: bubbleSpawn.bestChainCount,
          intent: outcome === "failed" ? "fail" : "completeSteady",
          mistakeCount: 0,
          primaryMetric: Math.max(1, bubbleSpawn.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (bubbleSpawn.state === "cleared") {
      playRunClear();
    } else if (bubbleSpawn.state === "failed") {
      playRunFail();
    }
  }, [bubbleSpawn.state]);

  return {
    bubbleSpawn,
    finishDetail: isRunCleared
      ? `Field stabilized at ${bubbleSpawn.stabilityScore}/${bubbleSpawn.targetStability} with a best chain of ${bubbleSpawn.bestChainCount}.`
      : isRunFailed
        ? `The field overloaded at ${bubbleSpawn.saturation}/${bubbleSpawn.saturationThreshold} saturation before the stability target was reached.`
        : "Burst the biggest pressure clusters first. Large or connected bubbles spread the chain and keep saturation under control.",
    handleBubblePress(slot: number) {
      const result = bubbleSpawn.burstBubble(slot);

      if (result === "burst" || result === "cleared") {
        playTapCorrect();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      bubbleSpawn.beginRun();
    },
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Overloaded" : isLiveRun ? "Live" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : "Burst the field",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another field" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, bubbleSpawn.timeLimitSeconds - bubbleSpawn.elapsedSeconds)),
  };
}
