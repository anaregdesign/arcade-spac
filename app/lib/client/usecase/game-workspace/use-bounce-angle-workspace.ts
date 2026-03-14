import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useBounceAngleSession } from "./use-bounce-angle-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useBounceAngleWorkspace(workspace: GameWorkspaceController) {
  const bounceAngle = useBounceAngleSession(workspace.difficulty);
  const isRunIdle = bounceAngle.state === "idle";
  const isLiveRun = bounceAngle.state === "playing";
  const isRunCleared = bounceAngle.state === "cleared";
  const isRunFailed = bounceAngle.state === "failed";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : "completeSteady",
          mistakeCount: bounceAngle.shotsUsed,
          primaryMetric: Math.max(1, bounceAngle.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (bounceAngle.state === "cleared") {
      playRunClear();
    } else if (bounceAngle.state === "failed") {
      playRunFail();
    }
  }, [bounceAngle.state]);

  return {
    bounceAngle,
    finishDetail: isRunCleared
      ? `Every pocket board was cleared in ${bounceAngle.shotsUsed} shots with the final bank landing in pocket ${bounceAngle.targetPocketLabel}.`
      : isRunFailed
        ? `The timer expired after ${bounceAngle.shotsUsed} shots across ${bounceAngle.currentPuzzleIndex + 1}/${bounceAngle.puzzleCount} ricochet boards.`
        : "Choose one fixed angle, read the rebound geometry off the side walls, and launch only when the path should land in the green pocket.",
    handleAngleSelect(angleId: string) {
      const result = bounceAngle.chooseAngle(angleId);

      if (result === "selected") {
        playTapCorrect();
      }
    },
    handleLaunch() {
      const result = bounceAngle.launch();

      if (result === "target") {
        playTapCorrect();
      } else if (result === "hazard" || result === "miss") {
        playTapWrong();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      bounceAngle.beginRun();
    },
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isLiveRun ? "Aiming" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : "Read the bank shot",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another ricochet" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, bounceAngle.timeLimitSeconds - bounceAngle.elapsedSeconds)),
  };
}
