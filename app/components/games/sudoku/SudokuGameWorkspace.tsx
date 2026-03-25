import { useEffect, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";

import { useSudokuWorkspace } from "../../../lib/client/usecase/game-workspace/use-sudoku-workspace";
import { SUDOKU_FLICK_DIGIT_SLOTS, resolveSudokuFlickDigit } from "../../../lib/client/usecase/game-workspace/sudoku-flick";
import { GameplayContextCue } from "../../gameplay/GameplayContextCue";
import { GameplayDirectBoardLayout } from "../../gameplay/layouts/GameplayDirectBoardLayout";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./SudokuGameWorkspace.module.css";

type SudokuFlickGesture = {
  anchorColIndex: number;
  anchorRowIndex: number;
  currentX: number;
  currentY: number;
  pointerId: number;
  selectedDigit: number | null;
  startX: number;
  startY: number;
};

function isTouchLikePointer(pointerType: string) {
  return pointerType === "touch" || pointerType === "pen";
}

function isPeerCell(
  rowIndex: number,
  colIndex: number,
  selectedCell: { colIndex: number; rowIndex: number } | null,
) {
  if (!selectedCell) {
    return false;
  }

  if (selectedCell.rowIndex === rowIndex && selectedCell.colIndex === colIndex) {
    return false;
  }

  const sameBox =
    Math.floor(selectedCell.rowIndex / 3) === Math.floor(rowIndex / 3) &&
    Math.floor(selectedCell.colIndex / 3) === Math.floor(colIndex / 3);

  return selectedCell.rowIndex === rowIndex || selectedCell.colIndex === colIndex || sameBox;
}

function toBoardPercent(index: number) {
  return `${((index + 0.5) / 9) * 100}%`;
}

function setPointerCaptureSafely(target: HTMLButtonElement, pointerId: number) {
  try {
    target.setPointerCapture?.(pointerId);
  } catch {
    // Synthetic verification events can lack a capturable live pointer.
  }
}

function releasePointerCaptureSafely(target: HTMLButtonElement, pointerId: number) {
  try {
    if (target.hasPointerCapture?.(pointerId)) {
      target.releasePointerCapture?.(pointerId);
    }
  } catch {
    // Synthetic verification events can lack a capturable live pointer.
  }
}

export function SudokuGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useSudokuWorkspace(workspace);
  const [flickGesture, setFlickGesture] = useState<SudokuFlickGesture | null>(null);
  const selectedCell = screen.sudoku.selectedCell;
  const selectedCellLabel = selectedCell
    ? `Selected R${selectedCell.rowIndex + 1} C${selectedCell.colIndex + 1}`
    : "Select an editable cell";
  const flickOverlayStyle: CSSProperties | undefined = flickGesture
    ? {
        left: toBoardPercent(flickGesture.anchorColIndex),
        top: toBoardPercent(flickGesture.anchorRowIndex),
      }
    : undefined;

  useEffect(() => {
    if (!screen.isLiveRun && flickGesture) {
      setFlickGesture(null);
    }
  }, [flickGesture, screen.isLiveRun]);

  function handleCellPointerDown(
    event: ReactPointerEvent<HTMLButtonElement>,
    rowIndex: number,
    colIndex: number,
    isFixed: boolean,
  ) {
    if (!screen.isLiveRun || !isTouchLikePointer(event.pointerType)) {
      return;
    }

    screen.sudoku.selectCell(rowIndex, colIndex);

    if (isFixed) {
      setFlickGesture(null);
      return;
    }

    event.preventDefault();
    setPointerCaptureSafely(event.currentTarget, event.pointerId);
    setFlickGesture({
      anchorColIndex: colIndex,
      anchorRowIndex: rowIndex,
      currentX: event.clientX,
      currentY: event.clientY,
      pointerId: event.pointerId,
      selectedDigit: null,
      startX: event.clientX,
      startY: event.clientY,
    });
  }

  function handleCellPointerMove(event: ReactPointerEvent<HTMLButtonElement>, rowIndex: number, colIndex: number) {
    setFlickGesture((current) => {
      if (
        !current ||
        current.pointerId !== event.pointerId ||
        current.anchorRowIndex !== rowIndex ||
        current.anchorColIndex !== colIndex
      ) {
        return current;
      }

      const deltaX = event.clientX - current.startX;
      const deltaY = event.clientY - current.startY;

      return {
        ...current,
        currentX: event.clientX,
        currentY: event.clientY,
        selectedDigit: resolveSudokuFlickDigit(deltaX, deltaY),
      };
    });
  }

  function finishFlickGesture(event: ReactPointerEvent<HTMLButtonElement>, shouldApplyDigit: boolean) {
    releasePointerCaptureSafely(event.currentTarget, event.pointerId);

    if (!flickGesture || flickGesture.pointerId !== event.pointerId) {
      return;
    }

    const digit = shouldApplyDigit
      ? resolveSudokuFlickDigit(event.clientX - flickGesture.startX, event.clientY - flickGesture.startY)
      : null;

    setFlickGesture(null);

    if (digit !== null) {
      event.preventDefault();
      screen.sudoku.applyDigit(digit);
    }
  }

  return (
    <>
      <GameWorkspaceControlsCard
        difficulty={workspace.difficulty}
        isDifficultyDisabled={screen.isLiveRun}
        onDifficultyChange={workspace.changeDifficulty}
        primaryActions={(
          <GameInstructionsDialog instructions={instructions} />
        )}
        statusChips={(
          <>
            <span className="status-badge status-badge-neutral">{screen.isRunCleared ? "Solved" : screen.isLiveRun ? "Live" : "Ready"}</span>
            <span className="status-badge status-badge-neutral">Time {screen.timeLabel}</span>
            <span className="status-badge status-badge-neutral">Open {screen.sudoku.remainingCellCount}</span>
            <span className="status-badge status-badge-neutral">Mistakes {screen.sudoku.mistakeCount}</span>
            <span className="status-badge status-badge-neutral">Hints {screen.sudoku.hintCount}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], sharedStyles["board-card-minimal"]].join(" ")} aria-label="Sudoku board">
        <div className={sharedStyles["game-board-overlay-shell"]}>
          <GameplayDirectBoardLayout>
          <GameplayContextCue
            className={styles["sudoku-copy"]}
            detail="Select a cell, then use the keypad, keyboard, or flick on touch."
            phase={screen.isLiveRun ? "Solve" : "Ready"}
            title="Fill the board without breaking Sudoku rules"
            tone="logic"
          />
          <div className={styles["sudoku-shell"]}>
            <div className={styles["sudoku-board-frame"]}>
              <div className={styles["sudoku-board"]} role="grid" aria-label="Sudoku board">
                {screen.sudoku.board.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const isSelectedCell = selectedCell?.rowIndex === rowIndex && selectedCell?.colIndex === colIndex;
                    const isPeer = isPeerCell(rowIndex, colIndex, selectedCell);

                    return (
                      <button
                        aria-label={[
                          `Sudoku cell ${rowIndex + 1}-${colIndex + 1}`,
                          isSelectedCell ? "selected" : "",
                          cell.isFixed ? "fixed" : "editable",
                          cell.value > 0 ? `value ${cell.value}` : "empty",
                        ].filter(Boolean).join(", ")}
                        className={[
                          styles["sudoku-cell"],
                          isPeer ? styles["sudoku-cell-peer"] : "",
                          cell.isFixed ? styles["sudoku-cell-fixed"] : "",
                          isSelectedCell ? styles["sudoku-cell-selected"] : "",
                          cell.isWrong ? styles["sudoku-cell-wrong"] : "",
                          rowIndex % 3 === 0 ? styles["sudoku-cell-top-heavy"] : "",
                          colIndex % 3 === 0 ? styles["sudoku-cell-left-heavy"] : "",
                          rowIndex === 8 ? styles["sudoku-cell-bottom-heavy"] : "",
                          colIndex === 8 ? styles["sudoku-cell-right-heavy"] : "",
                        ].filter(Boolean).join(" ")}
                        data-peer={isPeer ? "true" : "false"}
                        data-selected={isSelectedCell ? "true" : "false"}
                        disabled={!screen.isLiveRun}
                        key={`sudoku-${rowIndex}-${colIndex}`}
                        onClick={() => screen.sudoku.selectCell(rowIndex, colIndex)}
                        onPointerCancel={(event) => finishFlickGesture(event, false)}
                        onPointerDown={(event) => handleCellPointerDown(event, rowIndex, colIndex, cell.isFixed)}
                        onPointerMove={(event) => handleCellPointerMove(event, rowIndex, colIndex)}
                        onPointerUp={(event) => finishFlickGesture(event, true)}
                        type="button"
                      >
                        {cell.value > 0 ? cell.value : ""}
                      </button>
                    );
                  }),
                )}
              </div>
              {flickGesture ? (
                <div aria-hidden="true" className={styles["sudoku-flick-overlay"]} style={flickOverlayStyle}>
                  <span className={styles["sudoku-flick-title"]}>Flick to enter</span>
                  <div className={styles["sudoku-flick-grid"]}>
                    {SUDOKU_FLICK_DIGIT_SLOTS.map((slot) => (
                      <span
                        className={[
                          styles["sudoku-flick-digit"],
                          flickGesture.selectedDigit === slot.digit ? styles["sudoku-flick-digit-active"] : "",
                        ].filter(Boolean).join(" ")}
                        key={`sudoku-flick-${slot.digit}`}
                        style={{ gridColumn: slot.columnIndex + 1, gridRow: slot.rowIndex + 1 }}
                      >
                        {slot.digit}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
            <div className={styles["sudoku-controls"]}>
              <p className={styles["sudoku-selection-summary"]}>{selectedCellLabel}</p>
              <div className={styles["sudoku-keypad"]} role="group" aria-label="Sudoku keypad">
                {Array.from({ length: 9 }, (_, index) => (
                  <button
                    className={styles["sudoku-key"]}
                    disabled={!screen.isLiveRun}
                    key={`digit-${index + 1}`}
                    onClick={() => screen.sudoku.applyDigit(index + 1)}
                    type="button"
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <div className={["hero-actions", "compact-actions", sharedStyles["workspace-utility-actions"]].join(" ")}>
                <button className="action-link action-link-secondary" disabled={!screen.isLiveRun} onClick={() => screen.sudoku.clearSelectedCell()} type="button">
                  Clear cell
                </button>
                <button className="action-link action-link-primary" disabled={!screen.isLiveRun} onClick={() => screen.sudoku.useHint()} type="button">
                  Use hint
                </button>
              </div>
              <p className={styles["sudoku-touch-hint"]}>On touch devices, tap a cell and flick from it to enter digits faster.</p>
            </div>
          </div>
          </GameplayDirectBoardLayout>
          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Fill the board with the keypad or keyboard."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Puzzle ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard
        actions={screen.isLiveRun ? (
            <button className="action-link action-link-secondary" type="button" onClick={screen.handleFinishRun}>
              Finish run
            </button>
        ) : null}
        detail={screen.finishDetail}
        emphasis={screen.saveStatusLabel}
      />
    </>
  );
}
