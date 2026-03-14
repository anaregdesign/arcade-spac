import { useEffect, useState, type MouseEvent } from "react";

import { playCellReveal, playFlagOff, playFlagOn, playMineExplode, playRunClear, playRunStart } from "../../infrastructure/browser/sound-effects";
import { formatDuration } from "./display";
import { useMinesweeperSession } from "./use-minesweeper-session";
import { useTerminalResultSubmission } from "./use-terminal-result-submission";
import type { GameWorkspaceController } from "./use-game-workspace";
import { useWorkspacePlayingSync } from "./use-workspace-playing-sync";

export function useMinesweeperWorkspace(workspace: GameWorkspaceController) {
  const minesweeper = useMinesweeperSession(workspace.difficulty);
  const [isFlagModeEnabled, setFlagModeEnabled] = useState(false);
  const isRunIdle = minesweeper.state === "idle";
  const isLiveRun = minesweeper.state === "playing";
  const isRunCleared = minesweeper.state === "cleared";
  const isRunFailed = minesweeper.state === "failed";
  const resultIntent = minesweeper.mistakeCount === 0 ? "completeClean" : "completeSteady";
  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : resultIntent,
          mistakeCount: minesweeper.mistakeCount,
          primaryMetric: minesweeper.elapsedSeconds,
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (minesweeper.state === "cleared") {
      playRunClear();
    }
  }, [minesweeper.state]);

  useEffect(() => {
    if (!isLiveRun) {
      setFlagModeEnabled(false);
    }
  }, [isLiveRun]);

  function playFlagToggleSound(rowIndex: number, columnIndex: number) {
    const cell = minesweeper.board[rowIndex]?.[columnIndex];

    if (cell && !cell.isRevealed) {
      if (cell.isFlagged) {
        playFlagOff();
      } else {
        playFlagOn();
      }
    }
  }

  return {
    finishDetail: isRunCleared || isRunFailed
      ? "The Result screen opens automatically when the board ends."
      : "Clear the board to open the Result screen automatically.",
    handleCellClick(rowIndex: number, columnIndex: number) {
      if (isFlagModeEnabled && isLiveRun) {
        playFlagToggleSound(rowIndex, columnIndex);
        minesweeper.toggleFlag(rowIndex, columnIndex);
        return;
      }

      if (minesweeper.state === "idle") {
        playRunStart();
        workspace.beginRun();
      }

      const cell = minesweeper.board[rowIndex]?.[columnIndex];

      if (cell && !cell.isRevealed && !cell.isFlagged) {
        if (cell.hasMine) {
          playMineExplode();
        } else {
          playCellReveal();
        }
      }

      minesweeper.revealCell(rowIndex, columnIndex);
    },
    handleCellContextMenu(event: MouseEvent<HTMLButtonElement>, rowIndex: number, columnIndex: number) {
      event.preventDefault();
      playFlagToggleSound(rowIndex, columnIndex);
      minesweeper.toggleFlag(rowIndex, columnIndex);
    },
    handleFlagModeToggle() {
      setFlagModeEnabled((currentValue) => !currentValue);
    },
    handleStartRun() {
      playRunStart();
      workspace.beginRun();
      minesweeper.beginRun();
    },
    isFlagModeEnabled,
    isLiveRun,
    isRunIdle,
    minesweeper,
    runStatusLabel: isRunCleared ? "Solved" : isRunFailed ? "Failed" : isLiveRun ? "Live" : "Ready",
    saveStatusLabel: submitter.isSubmitting
      ? "Opening result"
      : isRunCleared || isRunFailed
        ? "Opening result"
        : "Clear to finish",
    startActionLabel: isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another board" : "Start run",
    timeLabel: formatDuration(minesweeper.elapsedSeconds),
  };
}
