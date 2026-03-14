import { useBlockTessellateWorkspace } from "../../../lib/client/usecase/game-workspace/use-block-tessellate-workspace";
import sharedStyles from "../shared/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../shared/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../shared/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../shared/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../shared/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";
import styles from "./BlockTessellateGameWorkspace.module.css";

function getThemeClass(theme: string | null) {
  if (!theme) {
    return "";
  }

  return styles[`theme-${theme}`];
}

function getCellContent(label: string | null, state: string) {
  if (state === "filled" || state === "active") {
    return label;
  }

  if (state === "preview") {
    return <span className={styles["cell-ghost"]} />;
  }

  if (state === "target-empty") {
    return <span aria-hidden="true" className={styles["cell-dot"]}>·</span>;
  }

  return null;
}

export function BlockTessellateGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useBlockTessellateWorkspace(workspace);

  return (
    <>
      <GameWorkspaceControlsCard
        difficulty={workspace.difficulty}
        isDifficultyDisabled={screen.isLiveRun}
        onDifficultyChange={workspace.changeDifficulty}
        primaryActions={<GameInstructionsDialog instructions={instructions} />}
        statusChips={(
          <>
            <span className="status-badge status-badge-neutral">{screen.runStatusLabel}</span>
            <span className="status-badge status-badge-neutral">
              Board {screen.blockTessellate.currentPuzzleIndex + 1}/{screen.blockTessellate.puzzleCount}
            </span>
            <span className="status-badge status-badge-neutral">
              Active {screen.blockTessellate.activePieceLabel ?? "Done"}
            </span>
            <span className="status-badge status-badge-neutral">
              Filled {screen.blockTessellate.filledCellCount}/{screen.blockTessellate.targetCellCount}
            </span>
            <span className="status-badge status-badge-neutral">Misdrops {screen.blockTessellate.misdropCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section
        aria-label="Block Tessellate board"
        className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["block-board-card"]].join(" ")}
      >
        <div
          className={[styles["block-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}
          data-active-column={screen.blockTessellate.activeColumn}
          data-active-piece={screen.blockTessellate.activePieceId ?? ""}
          data-active-rotation={screen.blockTessellate.activeRotation}
          data-block-tessellate-root="true"
          data-filled-cells={screen.blockTessellate.filledCellCount}
          data-misdrops={screen.blockTessellate.misdropCount}
          data-puzzle-index={screen.blockTessellate.currentPuzzleIndex}
          data-solution-column={screen.blockTessellate.solutionColumn}
          data-solution-rotation={screen.blockTessellate.solutionRotation}
          data-state={screen.blockTessellate.state}
        >
          <div className={styles["summary-grid"]}>
            <article className={styles["summary-card"]}>
              <span className={styles["summary-label"]}>Silhouette</span>
              <strong className={styles["summary-value"]}>{screen.blockTessellate.currentPuzzleName}</strong>
            </article>
            <article className={styles["summary-card"]}>
              <span className={styles["summary-label"]}>Last action</span>
              <strong className={styles["summary-value"]}>{screen.blockTessellate.lastActionLabel}</strong>
            </article>
            <article className={styles["summary-card"]}>
              <span className={styles["summary-label"]}>Next piece</span>
              <strong className={styles["summary-value"]}>{screen.blockTessellate.nextPieceLabel ?? "Final lock"}</strong>
            </article>
          </div>

          <div className={styles["workspace-grid"]}>
            <div className={styles["board-panel"]}>
              <p className={styles["panel-title"]}>Target silhouette</p>
              <div
                className={styles["board-grid"]}
                style={{ gridTemplateColumns: `repeat(${screen.blockTessellate.columnCount}, minmax(0, 1fr))` }}
              >
                {screen.blockTessellate.boardCells.map((cell) => (
                  <div
                    className={[
                      styles["board-cell"],
                      styles[`board-cell-${cell.state}`],
                      getThemeClass(cell.theme),
                    ].filter(Boolean).join(" ")}
                    data-block-tessellate-cell="true"
                    data-cell-slot={cell.slot}
                    data-cell-state={cell.state}
                    key={`block-tessellate-cell-${cell.slot}`}
                  >
                    {getCellContent(cell.label, cell.state)}
                  </div>
                ))}
              </div>
              <p className={styles["board-copy"]}>
                Ghost cells show the current hard-drop landing. A misdrop resets the current silhouette, so plan the rotation before you commit.
              </p>
            </div>

            <div className={styles["control-panel"]}>
              <div className={styles["piece-grid"]}>
                <article className={styles["piece-card"]}>
                  <span className={styles["piece-label"]}>Active piece</span>
                  <strong className={styles["piece-value"]}>{screen.blockTessellate.activePieceLabel ?? "Done"}</strong>
                  <span className={styles["piece-meta"]}>Rotation {screen.blockTessellate.activeRotation + 1}/4</span>
                </article>
                <article className={styles["piece-card"]}>
                  <span className={styles["piece-label"]}>Queue progress</span>
                  <strong className={styles["piece-value"]}>
                    {screen.blockTessellate.activePieceLabel ? `${screen.blockTessellate.filledCellCount}/${screen.blockTessellate.targetCellCount}` : "Done"}
                  </strong>
                  <span className={styles["piece-meta"]}>Current column {screen.blockTessellate.activeColumn + 1}</span>
                </article>
              </div>

              <div className={styles["action-grid"]}>
                <button
                  className={styles["action-button"]}
                  data-block-tessellate-action="left"
                  disabled={!screen.isLiveRun}
                  onClick={() => screen.handleMove("left")}
                  type="button"
                >
                  Left
                </button>
                <button
                  className={styles["action-button"]}
                  data-block-tessellate-action="rotate"
                  disabled={!screen.isLiveRun}
                  onClick={screen.handleRotate}
                  type="button"
                >
                  Rotate
                </button>
                <button
                  className={styles["action-button"]}
                  data-block-tessellate-action="right"
                  disabled={!screen.isLiveRun}
                  onClick={() => screen.handleMove("right")}
                  type="button"
                >
                  Right
                </button>
                <button
                  className={[styles["action-button"], styles["action-button-drop"]].join(" ")}
                  data-block-tessellate-action="drop"
                  disabled={!screen.isLiveRun}
                  onClick={screen.handleDrop}
                  type="button"
                >
                  Hard drop
                </button>
              </div>

              <p className={styles["control-note"]}>
                Use lateral moves to line up the piece, Rotate when the footprint needs a new orientation, then Hard drop to lock it immediately.
              </p>
            </div>
          </div>

          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Every board uses a fixed queue and deterministic gravity, so the puzzle is about fitting the right orientation into the silhouette under time pressure."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Silhouette ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
