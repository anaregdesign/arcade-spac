import { useEffect, useRef } from "react";
import { Form, useNavigation, useSubmit } from "react-router";

import { useSudokuSession } from "../../../lib/client/usecase/game-workspace/use-sudoku-session";
import { GameWorkspaceBoardOverlay } from "../shared/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../shared/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../shared/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../shared/game-instructions-dialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";

function formatDuration(totalSeconds: number) {
  return `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, "0")}`;
}

export function SudokuGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const navigation = useNavigation();
  const submit = useSubmit();
  const submittedClearRef = useRef(false);
  const sudoku = useSudokuSession(workspace.difficulty);
  const isRunIdle = sudoku.state === "idle";
  const isLiveRun = sudoku.state === "playing";
  const isRunCleared = sudoku.state === "cleared";
  const resultIntent = sudoku.mistakeCount === 0 && sudoku.hintCount === 0 ? "completeClean" : "completeSteady";
  const runStatusLabel = isRunCleared ? "Solved" : isLiveRun ? "Live" : "Ready";
  const startActionLabel = isLiveRun ? "Running" : isRunCleared ? "Start another puzzle" : "Start run";
  const saveStatusLabel = navigation.state === "submitting"
    ? "Opening result"
    : isRunCleared ? "Opening result" : isLiveRun ? "Finish or solve" : "Solve to finish";

  useEffect(() => {
    workspace.setPlaying(sudoku.state === "playing");
  }, [sudoku.state, workspace]);

  useEffect(() => {
    if (sudoku.state !== "cleared") {
      submittedClearRef.current = false;
      return;
    }

    if (submittedClearRef.current) {
      return;
    }

    submittedClearRef.current = true;
    workspace.finishRun();

    const formData = new FormData();
    formData.set("intent", resultIntent);
    formData.set("difficulty", workspace.difficulty);
    formData.set("primaryMetric", String(sudoku.elapsedSeconds));
    formData.set("mistakeCount", String(sudoku.mistakeCount));
    formData.set("hintCount", String(sudoku.hintCount));
    submit(formData, { method: "post" });
  }, [resultIntent, submit, sudoku.elapsedSeconds, sudoku.hintCount, sudoku.mistakeCount, sudoku.state, workspace]);

  return (
    <>
      <GameWorkspaceControlsCard
        difficulty={workspace.difficulty}
        isDifficultyDisabled={isLiveRun}
        onDifficultyChange={workspace.changeDifficulty}
        primaryActions={(
          <GameInstructionsDialog instructions={instructions} />
        )}
        statusChips={(
          <>
            <span className="status-badge status-badge-neutral">{runStatusLabel}</span>
            <span className="status-badge status-badge-neutral">Time {formatDuration(sudoku.elapsedSeconds)}</span>
            <span className="status-badge status-badge-neutral">Open {sudoku.remainingCellCount}</span>
            <span className="status-badge status-badge-neutral">Mistakes {sudoku.mistakeCount}</span>
            <span className="status-badge status-badge-neutral">Hints {sudoku.hintCount}</span>
          </>
        )}
      />

      <section className="feature-card workspace-card board-card board-card-minimal" aria-label="Sudoku board">
        <div className="game-board-overlay-shell">
          <div className="sudoku-shell">
            <div className="sudoku-board" role="grid" aria-label="Sudoku board">
              {sudoku.board.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                  <button
                    aria-label={`Sudoku cell ${rowIndex + 1}-${colIndex + 1}`}
                    className={[
                      "sudoku-cell",
                      cell.isFixed ? "sudoku-cell-fixed" : "",
                      cell.isSelected ? "sudoku-cell-selected" : "",
                      cell.isWrong ? "sudoku-cell-wrong" : "",
                      rowIndex % 3 === 0 ? "sudoku-cell-top-heavy" : "",
                      colIndex % 3 === 0 ? "sudoku-cell-left-heavy" : "",
                      rowIndex === 8 ? "sudoku-cell-bottom-heavy" : "",
                      colIndex === 8 ? "sudoku-cell-right-heavy" : "",
                    ].filter(Boolean).join(" ")}
                    disabled={!isLiveRun}
                    key={`sudoku-${rowIndex}-${colIndex}`}
                    onClick={() => sudoku.selectCell(rowIndex, colIndex)}
                    type="button"
                  >
                    {cell.value > 0 ? cell.value : ""}
                  </button>
                )),
              )}
            </div>
            <div className="sudoku-controls">
              <div className="sudoku-keypad" role="group" aria-label="Sudoku keypad">
                {Array.from({ length: 9 }, (_, index) => (
                  <button
                    className="sudoku-key"
                    disabled={!isLiveRun}
                    key={`digit-${index + 1}`}
                    onClick={() => sudoku.applyDigit(index + 1)}
                    type="button"
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              <div className="hero-actions compact-actions workspace-utility-actions">
                <button className="action-link action-link-secondary" disabled={!isLiveRun} onClick={() => sudoku.clearSelectedCell()} type="button">
                  Clear cell
                </button>
                <button className="action-link action-link-primary" disabled={!isLiveRun} onClick={() => sudoku.useHint()} type="button">
                  Use hint
                </button>
              </div>
            </div>
          </div>
          <GameWorkspaceBoardOverlay
            actionLabel={startActionLabel}
            detail="Start the puzzle, then fill the board with the keypad or keyboard."
            isVisible={isRunIdle}
            onAction={() => {
              workspace.beginRun();
              sudoku.beginRun();
            }}
            title="Puzzle ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard
        actions={isLiveRun ? (
          <Form method="post" onSubmit={() => workspace.finishRun()}>
            <input type="hidden" name="intent" value="fail" />
            <input type="hidden" name="difficulty" value={workspace.difficulty} />
            <input type="hidden" name="primaryMetric" value={String(sudoku.elapsedSeconds)} />
            <input type="hidden" name="mistakeCount" value={String(sudoku.mistakeCount)} />
            <input type="hidden" name="hintCount" value={String(sudoku.hintCount)} />
            <button className="action-link action-link-secondary" type="submit">
              Finish run
            </button>
          </Form>
        ) : null}
        detail={
          isRunCleared
            ? "The Result screen opens automatically when the puzzle is solved."
            : isLiveRun
              ? "Solve the puzzle for a ranked clear, or finish now to open a not-cleared result."
              : "Solve the puzzle to open the Result screen automatically."
        }
        emphasis={saveStatusLabel}
      />
    </>
  );
}
