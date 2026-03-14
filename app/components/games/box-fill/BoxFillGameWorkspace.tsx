import { useBoxFillWorkspace } from "../../../lib/client/usecase/game-workspace/use-box-fill-workspace";
import sharedStyles from "../shared/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../shared/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../shared/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../shared/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../shared/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";
import styles from "./BoxFillGameWorkspace.module.css";

function getThemeClass(theme: string | null) {
  if (!theme) {
    return "";
  }

  return styles[`theme-${theme}`];
}

function getSelectedPieceLabel(boxFill: ReturnType<typeof useBoxFillWorkspace>["boxFill"]) {
  const selectedPiece = boxFill.pieces.find((piece) => piece.id === boxFill.selectedPieceId) ?? null;

  return selectedPiece ? selectedPiece.label : "None";
}

export function BoxFillGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useBoxFillWorkspace(workspace);

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
              Board {screen.boxFill.currentPuzzleIndex + 1}/{screen.boxFill.puzzleCount}
            </span>
            <span className="status-badge status-badge-neutral">Selected {getSelectedPieceLabel(screen.boxFill)}</span>
            <span className="status-badge status-badge-neutral">
              Filled {screen.boxFill.filledCellCount}/{screen.boxFill.targetCellCount}
            </span>
            <span className="status-badge status-badge-neutral">Errors {screen.boxFill.placementErrors}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["box-fill-board-card"]].join(" ")} aria-label="Box Fill board">
        <div
          className={[styles["box-fill-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}
          data-box-fill-root="true"
          data-next-solution-piece={screen.boxFill.nextSolutionPieceId}
          data-next-solution-rotation={screen.boxFill.nextSolutionRotation}
          data-next-solution-slot={screen.boxFill.nextSolutionAnchorSlot}
          data-placement-errors={screen.boxFill.placementErrors}
          data-preview-valid={screen.boxFill.previewValid ? "true" : "false"}
          data-selected-piece={screen.boxFill.selectedPieceId}
          data-selected-rotation={screen.boxFill.selectedRotation}
          data-state={screen.boxFill.state}
        >
          <div className={styles["summary-grid"]}>
            <article className={styles["summary-card"]}>
              <span className={styles["summary-label"]}>Board</span>
              <strong className={styles["summary-value"]}>{screen.boxFill.currentPuzzleName}</strong>
            </article>
            <article className={styles["summary-card"]}>
              <span className={styles["summary-label"]}>Last action</span>
              <strong className={styles["summary-value"]}>{screen.boxFill.lastActionLabel}</strong>
            </article>
            <article className={styles["summary-card"]}>
              <span className={styles["summary-label"]}>Remaining cells</span>
              <strong className={styles["summary-value"]}>{screen.boxFill.remainingCellCount}</strong>
            </article>
          </div>

          <div className={styles["action-row"]}>
            <button className={styles["utility-button"]} disabled={!screen.isLiveRun || !screen.boxFill.selectedPieceId} onClick={screen.handleRotatePiece} type="button">
              Rotate 90°
            </button>
            <button className={styles["utility-button"]} disabled={!screen.isLiveRun || !screen.boxFill.selectedPieceId || screen.boxFill.previewAnchorSlot === null} onClick={screen.handlePlacePiece} type="button">
              Place piece
            </button>
            <button className={styles["utility-button"]} disabled={!screen.isLiveRun} onClick={screen.boxFill.undoLastPlacement} type="button">
              Undo piece
            </button>
            <button className={styles["utility-button"]} disabled={!screen.isLiveRun} onClick={screen.boxFill.resetBoard} type="button">
              Reset board
            </button>
          </div>

          <div className={styles["workspace-grid"]}>
            <div className={styles["tray-panel"]}>
              <p className={styles["panel-title"]}>Piece tray</p>
              <div className={styles["tray-grid"]}>
                {screen.boxFill.pieces.map((piece) => (
                  <button
                    className={[
                      styles["piece-card"],
                      getThemeClass(piece.theme),
                      screen.boxFill.selectedPieceId === piece.id ? styles["piece-card-selected"] : "",
                      piece.isPlaced ? styles["piece-card-placed"] : "",
                    ].filter(Boolean).join(" ")}
                    data-piece-id={piece.id}
                    data-piece-placed={piece.isPlaced ? "true" : "false"}
                    disabled={!screen.isLiveRun || piece.isPlaced}
                    key={piece.id}
                    onClick={() => screen.boxFill.selectPiece(piece.id)}
                    type="button"
                  >
                    <span className={styles["piece-label"]}>{piece.label}</span>
                    <span className={styles["piece-meta"]}>{piece.cellCount} cells</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles["board-panel"]}>
              <p className={styles["panel-title"]}>Target box</p>
              <div className={styles["board-grid"]} style={{ gridTemplateColumns: `repeat(${screen.boxFill.columnCount}, minmax(0, 1fr))` }}>
                {screen.boxFill.boardCells.map((cell) => (
                  <button
                    aria-label={`Box Fill slot ${cell.slot + 1}`}
                    className={[
                      styles["board-cell"],
                      styles[`board-cell-${cell.state}`],
                      getThemeClass(cell.pairTheme),
                    ].filter(Boolean).join(" ")}
                    data-box-fill-cell="true"
                    data-cell-slot={cell.slot}
                    data-cell-state={cell.state}
                    disabled={!screen.isLiveRun}
                    key={`box-fill-slot-${cell.slot}`}
                    onClick={() => screen.boxFill.choosePreviewAnchor(cell.slot)}
                    type="button"
                  >
                    {cell.state === "filled" ? (
                      <span className={styles["cell-label"]}>{cell.occupantLabel}</span>
                    ) : cell.state === "preview" || cell.state === "invalid-preview" ? (
                      <span className={styles["cell-preview-dot"]} />
                    ) : cell.state === "target-empty" ? (
                      <span aria-hidden="true" className={styles["cell-empty-dot"]}>·</span>
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className={styles["board-copy"]}>
            Select a tray piece, rotate it if needed, tap one board anchor to preview the fit, then place it into the open box.
          </p>

          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Rotate the selected piece before you commit it. Invalid fits do not place and count as placement errors, while Undo piece removes the last committed shape."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Packing board ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
