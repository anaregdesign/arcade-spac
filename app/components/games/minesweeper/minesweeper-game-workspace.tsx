import { useEffect, useRef } from "react";
import { Form, Link, useNavigation, useSubmit } from "react-router";

import type { GameDifficulty } from "../../../lib/client/usecase/game-workspace/use-game-workspace";
import { useMinesweeperSession } from "../../../lib/client/usecase/game-workspace/use-minesweeper-session";
import { GameInstructionsDialog } from "../shared/game-instructions-dialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";

function formatDuration(totalSeconds: number) {
  return `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, "0")}`;
}

export function MinesweeperGameWorkspace({ alternateGame, instructions, workspace }: GameWorkspaceComponentProps) {
  const navigation = useNavigation();
  const submit = useSubmit();
  const didSubmitFailedRunRef = useRef(false);
  const minesweeper = useMinesweeperSession(workspace.difficulty);
  const isLiveRun = minesweeper.state === "playing";
  const isRunCleared = minesweeper.state === "cleared";
  const isRunFailed = minesweeper.state === "failed";
  const resultIntent = minesweeper.mistakeCount === 0 ? "completeClean" : "completeSteady";
  const runStatusLabel = isRunCleared ? "Clear ready" : isRunFailed ? "Failed" : isLiveRun ? "Live" : "Ready";
  const startActionLabel = isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another board" : "Start run";
  const saveStatusLabel = navigation.state === "submitting"
    ? "Saving"
    : isRunFailed ? "Opening result" : isRunCleared ? "Ready to save" : "Clear to save";

  useEffect(() => {
    workspace.setPlaying(minesweeper.state === "playing");
  }, [minesweeper.state, workspace]);

  useEffect(() => {
    if (minesweeper.state !== "failed") {
      didSubmitFailedRunRef.current = false;
      return;
    }

    if (didSubmitFailedRunRef.current) {
      return;
    }

    didSubmitFailedRunRef.current = true;
    workspace.finishRun();

    const formData = new FormData();
    formData.set("intent", "fail");
    formData.set("difficulty", workspace.difficulty);
    formData.set("primaryMetric", String(minesweeper.elapsedSeconds));
    formData.set("mistakeCount", String(minesweeper.mistakeCount));
    submit(formData, { method: "post" });
  }, [minesweeper.elapsedSeconds, minesweeper.mistakeCount, minesweeper.state, submit, workspace]);

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
            <span className="status-badge status-badge-neutral">Time {formatDuration(minesweeper.elapsedSeconds)}</span>
            <span className="status-badge status-badge-neutral">
              Flags {minesweeper.flaggedCount}/{minesweeper.totalMines}
            </span>
            <span className="status-badge status-badge-neutral">Mistakes {minesweeper.mistakeCount}</span>
          </div>
          <div className="hero-actions compact-actions workspace-primary-actions">
            <button
              className="action-link action-link-primary"
              type="button"
              onClick={() => {
                workspace.beginRun();
                minesweeper.beginRun();
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

      <section className="feature-card workspace-card board-card board-card-minimal" aria-label="Minesweeper board">
        <div className="minesweeper-shell">
          {minesweeper.board.map((row, rowIndex) => (
            <div className="minesweeper-row" key={`row-${rowIndex}`}>
              {row.map((cell, columnIndex) => (
                <button
                  aria-label={`Cell ${rowIndex + 1}-${columnIndex + 1}`}
                  className={[
                    "mine-cell",
                    cell.isRevealed ? "mine-cell-revealed" : "",
                    cell.isFlagged ? "mine-cell-flagged" : "",
                    cell.isExploded ? "mine-cell-exploded" : "",
                    cell.isRevealed && cell.adjacentMines > 0 ? `mine-cell-value-${cell.adjacentMines}` : "",
                  ].filter(Boolean).join(" ")}
                  key={`cell-${rowIndex}-${columnIndex}`}
                  onClick={() => minesweeper.revealCell(rowIndex, columnIndex)}
                  onContextMenu={(event) => {
                    event.preventDefault();
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
      </section>

      <section className="feature-card workspace-card workspace-finish-card">
        <div className="workspace-finish-row">
          <div className="workspace-finish-copy">
            <strong>{saveStatusLabel}</strong>
            <span>
              {isRunFailed
                ? "The result screen opens automatically after a failed board."
                : isRunCleared
                  ? "Record this clear when you are done."
                  : "Clear the board, then record the run."}
            </span>
          </div>
          <div className="hero-actions compact-actions compact-action-strip">
            <Form method="post" onSubmit={() => workspace.finishRun()}>
              <input type="hidden" name="intent" value={resultIntent} />
              <input type="hidden" name="difficulty" value={workspace.difficulty} />
              <input type="hidden" name="primaryMetric" value={String(minesweeper.elapsedSeconds)} />
              <input type="hidden" name="mistakeCount" value={String(minesweeper.mistakeCount)} />
              <button className="action-link action-link-primary" disabled={!isRunCleared} type="submit">
                Record current clear
              </button>
            </Form>
          </div>
        </div>
      </section>
    </>
  );
}
