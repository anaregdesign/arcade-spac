import { useEffect } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import type { CensusColorKey } from "./use-color-census-session";
import { useColorCensusSession } from "./use-color-census-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useColorCensusWorkspace(workspace: GameWorkspaceController) {
  const colorCensus = useColorCensusSession(workspace.difficulty);
  const isRunIdle = colorCensus.state === "idle";
  const isWatching = colorCensus.state === "watching";
  const isAnswering = colorCensus.state === "answering";
  const isLiveRun = isWatching || isAnswering;
  const isRunCleared = colorCensus.state === "cleared";
  const isRunFailed = colorCensus.state === "failed";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const resultIntent = colorCensus.mistakeCount === 0 ? "completeClean" : "completeSteady";
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : resultIntent,
          mistakeCount: colorCensus.mistakeCount,
          primaryMetric: Math.max(1, colorCensus.elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (colorCensus.state === "cleared") {
      playRunClear();
    } else if (colorCensus.state === "failed") {
      playRunFail();
    }
  }, [colorCensus.state]);

  return {
    colorCensus,
    finishDetail: isRunCleared
      ? "Every mosaic prompt was solved and the Result screen opens automatically."
      : isRunFailed
        ? "The timer expired before the full census sprint was completed."
        : isWatching
          ? "Memorize the mosaic now. The board fades before the query unlocks."
          : "Answer the distribution query from memory. Wrong answers count, but the sprint keeps going.",
    handleAnswer(value: CensusColorKey | number) {
      const result = colorCensus.answerQuery(value);

      if (result === "correct") {
        playTapCorrect();
      } else if (result === "wrong") {
        playTapWrong();
      }
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      colorCensus.beginRun();
    },
    isAnswering,
    isBoardHidden: isAnswering || isRunCleared || isRunFailed,
    isLiveRun,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    isWatching,
    queryBadgeLabel: colorCensus.currentRound.query.queryLabel,
    runStatusLabel: isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isWatching ? "Watching" : isAnswering ? "Answering" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : isWatching
          ? "Memorize the mosaic"
          : "Answer from memory",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another sprint" : "Start run",
    timeLeftLabel: formatDuration(Math.max(0, colorCensus.timeLimitSeconds - colorCensus.elapsedSeconds)),
  };
}
