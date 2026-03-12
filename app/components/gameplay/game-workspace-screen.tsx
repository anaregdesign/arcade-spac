import { useEffect } from "react";
import { Form, Link, useNavigation } from "react-router";

import { useGameWorkspace } from "../../lib/client/usecase/game-workspace/use-game-workspace";
import { useMinesweeperSession } from "../../lib/client/usecase/game-workspace/use-minesweeper-session";
import { useSudokuSession } from "../../lib/client/usecase/game-workspace/use-sudoku-session";

type GameWorkspaceScreenProps = {
  game: {
    key: string;
    name: string;
    shortDescription: string;
    rulesSummary: string;
    accentColor: string;
  };
};

export function GameWorkspaceScreen({ game }: GameWorkspaceScreenProps) {
  const navigation = useNavigation();
  const workspace = useGameWorkspace();
  const isMinesweeper = game.key === "minesweeper";
  const isSudoku = game.key === "sudoku";
  const minesweeper = useMinesweeperSession(workspace.difficulty);
  const sudoku = useSudokuSession(workspace.difficulty);
  const sessionState = isMinesweeper ? minesweeper.state : isSudoku ? sudoku.state : workspace.isPlaying ? "playing" : "idle";
  const isLiveRun = sessionState === "playing";
  const isRunCleared = sessionState === "cleared";
  const resultIntent = isMinesweeper
    ? minesweeper.mistakeCount === 0 ? "completeClean" : "completeSteady"
    : isSudoku
      ? sudoku.mistakeCount === 0 && sudoku.hintCount === 0 ? "completeClean" : "completeSteady"
      : "completeClean";
  const primaryMetric = isMinesweeper
    ? String(minesweeper.elapsedSeconds)
    : isSudoku
      ? String(sudoku.elapsedSeconds)
      : null;
  const mistakeCount = isMinesweeper
    ? String(minesweeper.mistakeCount)
    : isSudoku
      ? String(sudoku.mistakeCount)
      : null;
  const hintCount = isSudoku ? String(sudoku.hintCount) : null;
  const canSaveResult = isMinesweeper || isSudoku ? isRunCleared : workspace.isPlaying;

  useEffect(() => {
    workspace.setPlaying(sessionState === "playing");
  }, [sessionState, workspace]);

  function formatDuration(totalSeconds: number) {
    return `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, "0")}`;
  }

  return (
    <div className="dashboard-stack">
      <section className="feature-card workspace-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{game.name}</p>
            <h2 className="section-title">{game.shortDescription}</h2>
          </div>
          <span className="status-badge" style={{ backgroundColor: `${game.accentColor}22`, color: game.accentColor }}>
            {isMinesweeper
              ? isRunCleared
                ? "Board cleared"
                : isLiveRun
                  ? "Board live"
                  : "Ready"
              : isSudoku
                ? isRunCleared
                  ? "Puzzle solved"
                  : isLiveRun
                    ? "Puzzle live"
                    : "Ready"
                : workspace.isPlaying ? "Active run" : "Ready"}
          </span>
        </div>
        <p>{game.rulesSummary}</p>
        <label className="field-block">
          <span className="field-label">Difficulty</span>
          <select
            className="field-select"
            value={workspace.difficulty}
            disabled={isLiveRun}
            onChange={(event) => workspace.changeDifficulty(event.currentTarget.value as "EASY" | "NORMAL" | "HARD" | "EXPERT")}
          >
            <option value="EASY">Easy</option>
            <option value="NORMAL">Normal</option>
            <option value="HARD">Hard</option>
            <option value="EXPERT">Expert</option>
          </select>
        </label>
        {isMinesweeper ? (
          <dl className="stat-grid compact-stat-grid workspace-stat-grid">
            <div>
              <dt>Time</dt>
              <dd>{formatDuration(minesweeper.elapsedSeconds)}</dd>
            </div>
            <div>
              <dt>Mistakes</dt>
              <dd>{minesweeper.mistakeCount}</dd>
            </div>
            <div>
              <dt>Flags used</dt>
              <dd>{minesweeper.flaggedCount} / {minesweeper.totalMines}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>{isRunCleared ? "Clear ready" : isLiveRun ? "In progress" : "Waiting"}</dd>
            </div>
          </dl>
        ) : null}
        {isSudoku ? (
          <dl className="stat-grid compact-stat-grid workspace-stat-grid">
            <div>
              <dt>Time</dt>
              <dd>{formatDuration(sudoku.elapsedSeconds)}</dd>
            </div>
            <div>
              <dt>Mistakes</dt>
              <dd>{sudoku.mistakeCount}</dd>
            </div>
            <div>
              <dt>Hints</dt>
              <dd>{sudoku.hintCount}</dd>
            </div>
            <div>
              <dt>Open cells</dt>
              <dd>{sudoku.remainingCellCount}</dd>
            </div>
          </dl>
        ) : null}
        <div className="hero-actions">
          <button
            className="action-link action-link-primary"
            type="button"
            onClick={() => {
              workspace.beginRun();

              if (isMinesweeper) {
                minesweeper.beginRun();
              }

              if (isSudoku) {
                sudoku.beginRun();
              }
            }}
          >
            {isMinesweeper
              ? isLiveRun
                ? "Board live"
                : isRunCleared
                  ? "Start another board"
                  : "Start run"
              : isSudoku
                ? isLiveRun
                  ? "Puzzle live"
                  : isRunCleared
                    ? "Start another puzzle"
                    : "Start run"
                : workspace.isPlaying ? "Run in progress" : "Start run"}
          </button>
          {isLiveRun ? (
            <button className="action-link action-link-secondary" type="button" onClick={() => workspace.openLeaveConfirm("home")}>
              Go home
            </button>
          ) : (
            <Link className="action-link action-link-secondary" to="/home">
              Go home
            </Link>
          )}
          {isLiveRun ? (
            <button className="action-link action-link-secondary" type="button" onClick={() => workspace.openLeaveConfirm("rankings")}>
              View rankings
            </button>
          ) : (
            <Link className="action-link action-link-secondary" to="/rankings">
              View rankings
            </Link>
          )}
        </div>
      </section>

      {isMinesweeper ? (
        <section className="feature-card workspace-card board-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Board</p>
              <h2 className="section-title">Clear every safe tile</h2>
            </div>
            <span className="status-badge status-badge-neutral">
              {isRunCleared ? "Ready to save" : isLiveRun ? "Left click to reveal, right click to flag" : "Start a run to begin"}
            </span>
          </div>
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
          {minesweeper.mistakeCount > 0 ? (
            <p className="workspace-note">You can keep clearing after mistakes, but each mistake lowers the saved result quality.</p>
          ) : null}
        </section>
      ) : null}

      {isSudoku ? (
        <section className="feature-card workspace-card board-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Puzzle</p>
              <h2 className="section-title">Fill every row, column, and box</h2>
            </div>
            <span className="status-badge status-badge-neutral">
              {isRunCleared ? "Ready to save" : isLiveRun ? "Select a cell, then use the keypad or number keys" : "Start a run to begin"}
            </span>
          </div>
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
              <div className="hero-actions compact-actions">
                <button className="action-link action-link-secondary" onClick={() => sudoku.clearSelectedCell()} type="button">
                  Clear cell
                </button>
                <button className="action-link action-link-primary" onClick={() => sudoku.useHint()} type="button">
                  Use hint
                </button>
              </div>
            </div>
          </div>
          {sudoku.hintCount > 0 || sudoku.mistakeCount > 0 ? (
            <p className="workspace-note">Hints and mistakes both lower the saved result quality, but the run stays playable until the grid is complete.</p>
          ) : null}
        </section>
      ) : null}

      <section className="feature-card workspace-card">
        <p className="eyebrow">Run guide</p>
        <h2 className="section-title">What happens during this session</h2>
        <ul className="detail-list">
          <li>If you leave during a live run, the app asks for confirmation before marking it abandoned.</li>
          <li>Saved-later results stay visible, but they do not affect rankings until the retry succeeds.</li>
          <li>After a clear, the result screen is where you replay, share, or switch to another game.</li>
          {isSudoku ? <li>Number keys work while a cell is selected, and pressing H uses a hint for the active puzzle.</li> : null}
        </ul>
      </section>

      <section className="feature-card workspace-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Finish run</p>
            <h2 className="section-title">{isMinesweeper || isSudoku ? "Save the clear you just played" : "Choose how this run ended"}</h2>
          </div>
          <span className="status-badge status-badge-neutral">
            {navigation.state === "submitting"
              ? "Saving"
              : isMinesweeper || isSudoku
                ? isRunCleared
                  ? "Clear ready to save"
                  : isSudoku
                    ? "Solve the puzzle to unlock result actions"
                    : "Clear the board to unlock result actions"
                : workspace.isPlaying ? "Ready to record" : "Start a run to unlock results"}
          </span>
        </div>
        <div className="hero-actions">
          <Form method="post" onSubmit={() => workspace.finishRun()}>
            <input type="hidden" name="intent" value={isMinesweeper || isSudoku ? resultIntent : "completeClean"} />
            <input type="hidden" name="difficulty" value={workspace.difficulty} />
            {primaryMetric ? <input type="hidden" name="primaryMetric" value={primaryMetric} /> : null}
            {mistakeCount ? <input type="hidden" name="mistakeCount" value={mistakeCount} /> : null}
            {hintCount ? <input type="hidden" name="hintCount" value={hintCount} /> : null}
            <button className="action-link action-link-primary" disabled={!canSaveResult} type="submit">
              {isMinesweeper || isSudoku ? "Record current clear" : "Log a clean clear"}
            </button>
          </Form>
          {isMinesweeper || isSudoku ? null : (
            <Form method="post" onSubmit={() => workspace.finishRun()}>
              <input type="hidden" name="intent" value="completeSteady" />
              <input type="hidden" name="difficulty" value={workspace.difficulty} />
              <button className="action-link action-link-secondary" disabled={!workspace.isPlaying} type="submit">
                Log a steady clear
              </button>
            </Form>
          )}
          <Form method="post" onSubmit={() => workspace.finishRun()}>
            <input type="hidden" name="intent" value="completePending" />
            <input type="hidden" name="difficulty" value={workspace.difficulty} />
            {primaryMetric ? <input type="hidden" name="primaryMetric" value={primaryMetric} /> : null}
            {mistakeCount ? <input type="hidden" name="mistakeCount" value={mistakeCount} /> : null}
            {hintCount ? <input type="hidden" name="hintCount" value={hintCount} /> : null}
            <button className="action-link action-link-secondary" disabled={!canSaveResult} type="submit">
              Save and retry later
            </button>
          </Form>
        </div>
      </section>

      {workspace.showLeaveConfirm ? (
        <section className="feature-card workspace-card confirm-card">
          <p className="eyebrow">Confirm leave</p>
          <h2 className="section-title">Leave the current run?</h2>
          <p>Leaving now records this run as abandoned and excludes it from rankings and total points.</p>
          <div className="hero-actions">
            <button className="action-link action-link-secondary" onClick={() => workspace.cancelLeaveConfirm()} type="button">
              Stay here
            </button>
            <Form method="post" onSubmit={() => workspace.finishRun()}>
              <input type="hidden" name="intent" value="abandon" />
              <input type="hidden" name="difficulty" value={workspace.difficulty} />
              <input type="hidden" name="redirectTo" value={workspace.targetDestination === "rankings" ? "/rankings" : "/home"} />
              <button className="action-link action-link-primary" type="submit">
                Confirm leave
              </button>
            </Form>
          </div>
        </section>
      ) : null}

      <div className="hero-actions">
        <Link className="action-link action-link-primary" to="/home">
          Back to home
        </Link>
        <Link className="action-link action-link-secondary" to="/rankings">
          Open rankings
        </Link>
      </div>
    </div>
  );
}