import { useEffect, useRef, useState } from "react";
import { useNavigation, useSubmit } from "react-router";

import { useMinesweeperSession } from "../../../lib/client/usecase/game-workspace/use-minesweeper-session";
import { playCellReveal, playFlagOff, playFlagOn, playMineExplode, playRunClear, playRunStart } from "../../../lib/client/sound-effects";
import sharedStyles from "../shared/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../shared/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../shared/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../shared/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../shared/game-instructions-dialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";
import styles from "./minesweeper-game-workspace.module.css";

function formatDuration(totalSeconds: number) {
  return `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, "0")}`;
}

export function MinesweeperGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const navigation = useNavigation();
  const submit = useSubmit();
  const submittedOutcomeRef = useRef<"cleared" | "failed" | null>(null);
  const [isFlagModeEnabled, setFlagModeEnabled] = useState(false);
  const minesweeper = useMinesweeperSession(workspace.difficulty);
  const isRunIdle = minesweeper.state === "idle";
  const isLiveRun = minesweeper.state === "playing";
  const isRunCleared = minesweeper.state === "cleared";
  const isRunFailed = minesweeper.state === "failed";
  const resultIntent = minesweeper.mistakeCount === 0 ? "completeClean" : "completeSteady";
  const runStatusLabel = isRunCleared ? "Solved" : isRunFailed ? "Failed" : isLiveRun ? "Live" : "Ready";
  const startActionLabel = isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another board" : "Start run";
  const saveStatusLabel = navigation.state === "submitting"
    ? "Opening result"
    : isRunCleared || isRunFailed ? "Opening result" : "Clear to finish";

  useEffect(() => {
    workspace.setPlaying(minesweeper.state === "playing");
  }, [minesweeper.state, workspace]);

  useEffect(() => {
    if (minesweeper.state === "cleared") {
      playRunClear();
    }
    // "failed" state is handled by playMineExplode() in the cell click handler
  }, [minesweeper.state]);

  useEffect(() => {
    if (!isLiveRun) {
      setFlagModeEnabled(false);
    }
  }, [isLiveRun]);

  useEffect(() => {
    if (minesweeper.state !== "cleared" && minesweeper.state !== "failed") {
      submittedOutcomeRef.current = null;
      return;
    }

    const outcome = minesweeper.state;

    if (submittedOutcomeRef.current === outcome) {
      return;
    }

    submittedOutcomeRef.current = outcome;
    workspace.finishRun();

    const formData = new FormData();
    formData.set("intent", outcome === "failed" ? "fail" : resultIntent);
    formData.set("difficulty", workspace.difficulty);
    formData.set("primaryMetric", String(minesweeper.elapsedSeconds));
    formData.set("mistakeCount", String(minesweeper.mistakeCount));
    submit(formData, { method: "post" });
  }, [minesweeper.elapsedSeconds, minesweeper.mistakeCount, minesweeper.state, resultIntent, submit, workspace]);

  return (
    <>
      <GameWorkspaceControlsCard
        difficulty={workspace.difficulty}
        isDifficultyDisabled={isLiveRun}
        onDifficultyChange={workspace.changeDifficulty}
        primaryActions={(
          <>
            <button
              aria-pressed={isFlagModeEnabled}
              className={isFlagModeEnabled ? "action-link action-link-primary" : "action-link action-link-secondary"}
              disabled={!isLiveRun}
              type="button"
              onClick={() => setFlagModeEnabled((currentValue) => !currentValue)}
            >
              {isFlagModeEnabled ? "Flag mode on" : "Flag mode off"}
            </button>
            <GameInstructionsDialog instructions={instructions} />
          </>
        )}
        statusChips={(
          <>
            <span className="status-badge status-badge-neutral">{runStatusLabel}</span>
            <span className="status-badge status-badge-neutral">Time {formatDuration(minesweeper.elapsedSeconds)}</span>
            <span className="status-badge status-badge-neutral">
              Flags {minesweeper.flaggedCount}/{minesweeper.totalMines}
            </span>
            <span className="status-badge status-badge-neutral">Mistakes {minesweeper.mistakeCount}</span>
            <span className="status-badge status-badge-neutral">Tap {isFlagModeEnabled ? "Flag" : "Open"}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], sharedStyles["board-card-minimal"]].join(" ")} aria-label="Minesweeper board">
        <div className={sharedStyles["game-board-overlay-shell"]}>
          <div className={styles["minesweeper-shell"]}>
            {minesweeper.board.map((row, rowIndex) => (
              <div className={styles["minesweeper-row"]} key={`row-${rowIndex}`}>
                {row.map((cell, columnIndex) => (
                  <button
                    aria-label={`Cell ${rowIndex + 1}-${columnIndex + 1}`}
                    className={[
                      styles["mine-cell"],
                      cell.isRevealed ? styles["mine-cell-revealed"] : "",
                      cell.isFlagged ? styles["mine-cell-flagged"] : "",
                      cell.isExploded ? styles["mine-cell-exploded"] : "",
                      cell.isRevealed && cell.adjacentMines > 0 ? styles[`mine-cell-value-${cell.adjacentMines}`] : "",
                    ].filter(Boolean).join(" ")}
                    key={`cell-${rowIndex}-${columnIndex}`}
                    onClick={() => {
                      if (isFlagModeEnabled && isLiveRun) {
                        const flagCell = minesweeper.board[rowIndex]?.[columnIndex];

                        if (flagCell && !flagCell.isRevealed) {
                          if (flagCell.isFlagged) {
                            playFlagOff();
                          } else {
                            playFlagOn();
                          }
                        }

                        minesweeper.toggleFlag(rowIndex, columnIndex);
                        return;
                      }

                      if (minesweeper.state === "idle") {
                        playRunStart();
                        workspace.beginRun();
                      }

                      const revealCell = minesweeper.board[rowIndex]?.[columnIndex];

                      if (revealCell && !revealCell.isRevealed && !revealCell.isFlagged) {
                        if (revealCell.hasMine) {
                          playMineExplode();
                        } else {
                          playCellReveal();
                        }
                      }

                      minesweeper.revealCell(rowIndex, columnIndex);
                    }}
                    onContextMenu={(event) => {
                      event.preventDefault();

                      const flagCell = minesweeper.board[rowIndex]?.[columnIndex];

                      if (flagCell && !flagCell.isRevealed) {
                        if (flagCell.isFlagged) {
                          playFlagOff();
                        } else {
                          playFlagOn();
                        }
                      }

                      minesweeper.toggleFlag(rowIndex, columnIndex);
                    }}
                    type="button"
                  >
                    {cell.isFlagged
                      ? "!"
                      : cell.isExploded
                        ? "X"
                        : cell.isRevealed && cell.hasMine
                          ? "*"
                          : cell.isRevealed && cell.adjacentMines > 0
                            ? cell.adjacentMines
                            : ""}
                  </button>
                ))}
              </div>
            ))}
          </div>
          <GameWorkspaceBoardOverlay
            actionLabel={startActionLabel}
            detail="Press Start run, or open any cell to begin this board."
            isVisible={isRunIdle}
            onAction={() => {
              playRunStart();
              workspace.beginRun();
              minesweeper.beginRun();
            }}
            title="Board ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard
        detail={
          isRunCleared || isRunFailed
            ? "The Result screen opens automatically when the board ends."
            : "Clear the board to open the Result screen automatically."
        }
        emphasis={saveStatusLabel}
      />
    </>
  );
}
