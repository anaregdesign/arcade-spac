import { useEffect, useRef, useState } from "react";
import { Link, useNavigation, useSubmit } from "react-router";

import type { GameDifficulty } from "../../../lib/client/usecase/game-workspace/use-game-workspace";
import { useMinesweeperSession } from "../../../lib/client/usecase/game-workspace/use-minesweeper-session";
import { GameInstructionsDialog } from "../shared/game-instructions-dialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";

function formatDuration(totalSeconds: number) {
  return `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, "0")}`;
}

export function MinesweeperGameWorkspace({ alternateGames, instructions, workspace }: GameWorkspaceComponentProps) {
  const navigation = useNavigation();
  const submit = useSubmit();
  const submittedOutcomeRef = useRef<"cleared" | "failed" | null>(null);
  const [isFlagModeEnabled, setFlagModeEnabled] = useState(false);
  const minesweeper = useMinesweeperSession(workspace.difficulty);
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
            <span className="status-badge status-badge-neutral">Tap {isFlagModeEnabled ? "Flag" : "Open"}</span>
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
            {isLiveRun ? (
              <button className="action-link action-link-secondary" type="button" onClick={() => workspace.openLeaveConfirm("home")}>
                Go home
              </button>
            ) : (
              <Link className="action-link action-link-secondary" to="/home">
                Go home
              </Link>
            )}
            {alternateGames.map((game) =>
              isLiveRun
                ? (
                  <button className="action-link action-link-secondary" key={game.key} type="button" onClick={() => workspace.openLeaveConfirm(game.href)}>
                    {game.label}
                  </button>
                )
                : (
                  <Link className="action-link action-link-secondary" key={game.key} to={game.href}>
                    {game.label}
                  </Link>
                ),
            )}
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
                  onClick={() => {
                    if (isFlagModeEnabled && isLiveRun) {
                      minesweeper.toggleFlag(rowIndex, columnIndex);
                      return;
                    }

                    if (minesweeper.state === "idle") {
                      workspace.beginRun();
                    }

                    minesweeper.revealCell(rowIndex, columnIndex);
                  }}
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
              {isRunCleared || isRunFailed
                ? "The Result screen opens automatically when the board ends."
                : "Clear the board to open the Result screen automatically."}
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
