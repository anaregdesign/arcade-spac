import { useBlockTessellateWorkspace } from "../../../lib/client/usecase/game-workspace/use-block-tessellate-workspace";
import { GameplayContextCue } from "../../gameplay/GameplayContextCue";
import { GameplaySidecarLayout } from "../../gameplay/GameplayLayoutVariants";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
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
          <GameplayContextCue
            className={styles["block-copy"]}
            detail={screen.blockTessellate.activePieceLabel ? `${screen.blockTessellate.activePieceLabel} is live. Ghost shows the lock.` : "Final lock."}
            phase={screen.isLiveRun ? "Fit" : "Ready"}
            title="Guide the queue into the silhouette"
            tone="logic"
          />

          <GameplaySidecarLayout className={styles["workspace-grid"]} desktopMain="1.45fr" desktopSide="1fr" desktopSideMin="16rem" mobileSideMin="7.6rem" mobileSideMax="8.4rem">
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
            </div>
          </GameplaySidecarLayout>

          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Fixed queue. Fit each drop before time runs out."
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
