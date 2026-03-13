import { useEffect } from "react";
import { Form, Link, useNavigation } from "react-router";

import type { GameDifficulty } from "../../../lib/client/usecase/game-workspace/use-game-workspace";
import { useSudokuSession } from "../../../lib/client/usecase/game-workspace/use-sudoku-session";
import { GameInstructionsDialog } from "../shared/game-instructions-dialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";

function formatDuration(totalSeconds: number) {
  return `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, "0")}`;
}

export function SudokuGameWorkspace({ alternateGame, instructions, workspace }: GameWorkspaceComponentProps) {
  const navigation = useNavigation();
  const sudoku = useSudokuSession(workspace.difficulty);
  const isLiveRun = sudoku.state === "playing";
  const isRunCleared = sudoku.state === "cleared";
  const resultIntent = sudoku.mistakeCount === 0 && sudoku.hintCount === 0 ? "completeClean" : "completeSteady";
  const runStatusLabel = isRunCleared ? "Solved" : isLiveRun ? "Live" : "Ready";
  const startActionLabel = isLiveRun ? "Running" : isRunCleared ? "Start another puzzle" : "Start run";
  const saveStatusLabel = navigation.state === "submitting"
    ? "Saving"
    : isRunCleared ? "Ready to save" : isLiveRun ? "Finish or solve" : "Solve to save";

  useEffect(() => {
    workspace.setPlaying(sudoku.state === "playing");
  }, [sudoku.state, workspace]);

  return (
    <>
      <section className="feature-card workspace-card workspace-controls-card">
        <div className="workspace-toolbar workspace-toolbar-minimal">
          <label className="field-block workspace-toolbar-field">
            <span className="field-label">Difficulty</span>
            <select
              className="field-select"
              value={workspace.difficulty}
              disabled={isLiveRun}
              onChange={(event) => workspace.changeDifficulty(event.currentTarget.value as GameDifficulty)}
            >
              <option value="EASY">Easy</option>
              <option value="NORMAL">Normal</option>
              <option value="HARD">Hard</option>
              <option value="EXPERT">Expert</option>
            </select>
          </label>
          <div className="workspace-chip-row" aria-label="Run status">
            <span className="status-badge status-badge-neutral">{runStatusLabel}</span>
            <span className="status-badge status-badge-neutral">Time {formatDuration(sudoku.elapsedSeconds)}</span>
            <span className="status-badge status-badge-neutral">Open {sudoku.remainingCellCount}</span>
            <span className="status-badge status-badge-neutral">Mistakes {sudoku.mistakeCount}</span>
            <span className="status-badge status-badge-neutral">Hints {sudoku.hintCount}</span>
          </div>
          <div className="hero-actions compact-actions workspace-primary-actions">
            <button
              className="action-link action-link-primary"
              type="button"
              onClick={() => {
                workspace.beginRun();
                sudoku.beginRun();
              }}
            >
              {startActionLabel}
            </button>
            <GameInstructionsDialog instructions={instructions} />
            {isLiveRun ? (
              <button className="action-link action-link-secondary" type="button" onClick={() => workspace.openLeaveConfirm("home")}>
                Go home
              </button>
            ) : (
              <Link className="action-link action-link-secondary" to="/home">
                Go home
              </Link>
            )}
            {alternateGame
              ? isLiveRun
                ? (
                  <button className="action-link action-link-secondary" type="button" onClick={() => workspace.openLeaveConfirm(alternateGame.href)}>
                    {alternateGame.label}
                  </button>
                )
                : (
                  <Link className="action-link action-link-secondary" to={alternateGame.href}>
                    {alternateGame.label}
                  </Link>
                )
              : null}
          </div>
        </div>
      </section>

      <section className="feature-card workspace-card board-card board-card-minimal" aria-label="Sudoku board">
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
                  key={`digit-${index + 1}`}
                  onClick={() => sudoku.applyDigit(index + 1)}
                  type="button"
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <div className="hero-actions compact-actions workspace-utility-actions">
              <button className="action-link action-link-secondary" onClick={() => sudoku.clearSelectedCell()} type="button">
                Clear cell
              </button>
              <button className="action-link action-link-primary" onClick={() => sudoku.useHint()} type="button">
                Use hint
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-card workspace-card workspace-finish-card">
        <div className="workspace-finish-row">
          <div className="workspace-finish-copy">
            <strong>{saveStatusLabel}</strong>
            <span>
              {isRunCleared
                ? "Record this clear when you are done."
                : isLiveRun
                  ? "Solve the puzzle for a ranked clear, or finish now to open a not-cleared result."
                  : "Solve the puzzle, then record the clear."}
            </span>
          </div>
          <div className="hero-actions compact-actions compact-action-strip">
            <Form method="post" onSubmit={() => workspace.finishRun()}>
              <input type="hidden" name="intent" value={resultIntent} />
              <input type="hidden" name="difficulty" value={workspace.difficulty} />
              <input type="hidden" name="primaryMetric" value={String(sudoku.elapsedSeconds)} />
              <input type="hidden" name="mistakeCount" value={String(sudoku.mistakeCount)} />
              <input type="hidden" name="hintCount" value={String(sudoku.hintCount)} />
              <button className="action-link action-link-primary" disabled={!isRunCleared} type="submit">
                Record current clear
              </button>
            </Form>
            {isLiveRun ? (
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
          </div>
        </div>
      </section>
    </>
  );
}
