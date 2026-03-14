import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useRelativePitchSession } from "./use-relative-pitch-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useRelativePitchWorkspace(workspace: GameWorkspaceController) {
  const relativePitch = useRelativePitchSession(workspace.difficulty);
  const isRunIdle = relativePitch.state === "idle";
  const isLiveRun = relativePitch.state === "playing";
  const isRunCleared = relativePitch.state === "cleared";
  const isRunFailed = relativePitch.state === "failed";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          hintCount: relativePitch.replayCount,
          intent: outcome === "failed" ? "fail" : "completeSteady",
          mistakeCount: relativePitch.wrongPickCount,
          primaryMetric: Math.max(1, relativePitch.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (relativePitch.state === "cleared") {
      playRunClear();
    } else if (relativePitch.state === "failed") {
      playRunFail();
    }
  }, [relativePitch.state]);

  return {
    finishDetail: isRunCleared
      ? `All ${relativePitch.totalRoundCount} interval rounds were cleared with ${relativePitch.replayCount} replays and ${relativePitch.wrongPickCount} wrong picks.`
      : isRunFailed
        ? `The timer expired after ${relativePitch.roundsSolvedCount} of ${relativePitch.totalRoundCount} rounds with ${relativePitch.replayCount} replays used.`
        : "Listen to the reference jump, hear the new base note, then choose the candidate that recreates the same interval.",
    handleCandidatePress(candidateId: string) {
      relativePitch.chooseCandidate(candidateId);
    },
    handleReplayBase() {
      relativePitch.replayBase();
    },
    handleReplayReference() {
      relativePitch.replayReference();
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      relativePitch.beginRun();
    },
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    relativePitch,
    runStatusLabel: isRunCleared
      ? "Cleared"
      : isRunFailed
        ? "Timed out"
        : isLiveRun
          ? relativePitch.audioPhase === "intro"
            ? "Listening"
            : "Choosing"
          : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : "Hear the interval",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another run" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, relativePitch.timeLimitSeconds - relativePitch.elapsedSeconds)),
  };
}
