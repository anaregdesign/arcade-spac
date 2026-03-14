import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useGlowCycleSession } from "./use-glow-cycle-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useGlowCycleWorkspace(workspace: GameWorkspaceController) {
  const glowCycle = useGlowCycleSession(workspace.difficulty);
  const isRunIdle = glowCycle.state === "idle";
  const isLiveRun = glowCycle.state === "playing";
  const isRunCleared = glowCycle.state === "cleared";
  const isRunFailed = glowCycle.state === "failed";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const resultIntent = glowCycle.mistimedTapCount === 0 ? "completeClean" : "completeSteady";
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : resultIntent,
          mistakeCount: glowCycle.mistimedTapCount,
          primaryMetric: Math.max(1, glowCycle.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (glowCycle.state === "cleared") {
      playRunClear();
    } else if (glowCycle.state === "failed") {
      playRunFail();
    }
  }, [glowCycle.state]);

  return {
    finishDetail: isRunCleared
      ? `All ${glowCycle.cycleGoal} glow cycles cleared with ${glowCycle.perfectCycleCount} perfect cycles and ${glowCycle.mistimedTapCount} mistimed taps.`
      : isRunFailed
        ? "The timer expired before every glow cycle was cleared."
        : "Watch the full node grid breathe together, then tap only the highlighted node while the board enters the sync window.",
    glowCycle,
    handleNodePress(nodeId: string) {
      const result = glowCycle.tapNode(nodeId);

      if (result === "perfect" || result === "good") {
        playTapCorrect();
      } else if (result === "miss" || result === "wrong-node") {
        playTapWrong();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      glowCycle.beginRun();
    },
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isLiveRun ? "Syncing" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : "Tap the highlighted node during sync",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another run" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, glowCycle.timeLimitSeconds - glowCycle.elapsedSeconds)),
  };
}
