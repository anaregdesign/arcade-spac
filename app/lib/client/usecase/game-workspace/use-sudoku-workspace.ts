import { useEffect, useRef } from "react";

import { playHintUse, playRunClear, playRunStart, playTapCorrect, playTapWrong } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import { useGameplayResultSubmitter } from "./use-gameplay-result-submitter";
import { useSudokuSession } from "./use-sudoku-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useSudokuWorkspace(workspace: GameWorkspaceController) {
  const sudoku = useSudokuSession(workspace.difficulty);
  const isRunIdle = sudoku.state === "idle";
  const isLiveRun = sudoku.state === "playing";
  const isRunCleared = sudoku.state === "cleared";
  const resultIntent = sudoku.mistakeCount === 0 && sudoku.hintCount === 0 ? "completeClean" : "completeSteady";
  const autoSubmitter = useTerminalResultSubmission({
    outcome: isRunCleared ? "cleared" : null,
    submission: isRunCleared
      ? {
          difficulty: workspace.difficulty,
          hintCount: sudoku.hintCount,
          intent: resultIntent,
          mistakeCount: sudoku.mistakeCount,
          primaryMetric: sudoku.elapsedSeconds,
        }
      : null,
    workspace,
  });
  const manualSubmitter = useGameplayResultSubmitter();

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (sudoku.state === "cleared") {
      playRunClear();
    }
  }, [sudoku.state]);

  const prevRemainingCellCountRef = useRef(sudoku.remainingCellCount);
  const prevHintCountRef = useRef(sudoku.hintCount);
  const prevMistakeCountRef = useRef(sudoku.mistakeCount);

  useEffect(() => {
    if (sudoku.hintCount > prevHintCountRef.current) {
      playHintUse();
    } else if (sudoku.remainingCellCount < prevRemainingCellCountRef.current && sudoku.state === "playing") {
      playTapCorrect();
    }

    if (sudoku.mistakeCount > prevMistakeCountRef.current) {
      playTapWrong();
    }

    prevRemainingCellCountRef.current = sudoku.remainingCellCount;
    prevHintCountRef.current = sudoku.hintCount;
    prevMistakeCountRef.current = sudoku.mistakeCount;
  }, [sudoku.hintCount, sudoku.mistakeCount, sudoku.remainingCellCount, sudoku.state]);

  return {
    finishDetail: isRunCleared
      ? "The Result screen opens automatically when the puzzle is solved."
      : isLiveRun
        ? "Solve the puzzle for a ranked clear, or finish now to open a not-cleared result."
        : "Solve the puzzle to open the Result screen automatically.",
    handleFinishRun() {
      workspace.finishRun();
      manualSubmitter.submitResult({
        difficulty: workspace.difficulty,
        hintCount: sudoku.hintCount,
        intent: "fail",
        mistakeCount: sudoku.mistakeCount,
        primaryMetric: sudoku.elapsedSeconds,
      });
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      sudoku.beginRun();
    },
    isLiveRun,
    isRunCleared,
    isRunIdle,
    saveStatusLabel: autoSubmitter.isSubmitting || manualSubmitter.isSubmitting
      ? "Opening result"
      : isRunCleared
        ? "Opening result"
        : isLiveRun
          ? "Finish or solve"
          : "Solve to finish",
    startActionLabel: isLiveRun ? "Running" : isRunCleared ? "Start another puzzle" : "Start run",
    sudoku,
    timeLabel: formatDuration(sudoku.elapsedSeconds),
  };
}
