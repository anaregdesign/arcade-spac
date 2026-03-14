import { useTapSafeWorkspace } from "../../../lib/client/usecase/game-workspace/use-tap-safe-workspace";
import sharedStyles from "../shared/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../shared/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../shared/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../shared/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../shared/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";
import styles from "./TapSafeGameWorkspace.module.css";

export function TapSafeGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useTapSafeWorkspace(workspace);

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
            <span className="status-badge status-badge-neutral">Wave {screen.tapSafe.waveIndex + 1}</span>
            <span className="status-badge status-badge-neutral">
              Hits {screen.tapSafe.safeHitCount}/{screen.tapSafe.targetSafeHits}
            </span>
            <span className="status-badge status-badge-neutral">Hazards {screen.tapSafe.hazardTapCount}</span>
            <span className="status-badge status-badge-neutral">Missed {screen.tapSafe.missedSafeCount}</span>
            <span className="status-badge status-badge-neutral">Accuracy {screen.tapSafe.accuracyPercent}%</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["tap-safe-board-card"]].join(" ")} aria-label="Tap Safe board">
        <div className={[styles["tap-safe-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <div className={styles["tap-safe-copy"]}>
            <p className="eyebrow">Filter the wave</p>
            <strong>Tap only the safe targets before the board refreshes.</strong>
            <p className="compact-copy">
              Safe targets carry clear SAFE or OK badges. Hazard objects use NO or HAZ badges and should be ignored even when they share the same color family.
            </p>
          </div>

          <div className={styles["tap-safe-legend"]}>
            <div className={styles["tap-safe-legend-item"]}>
              <span className={[styles["tap-safe-marker"], styles["tap-safe-marker-safe"]].join(" ")}>◎</span>
              <span>Safe target</span>
            </div>
            <div className={styles["tap-safe-legend-item"]}>
              <span className={[styles["tap-safe-marker"], styles["tap-safe-marker-hazard"]].join(" ")}>▲</span>
              <span>Hazard</span>
            </div>
          </div>

          <div
            className={styles["tap-safe-grid"]}
            style={{ gridTemplateColumns: `repeat(${screen.tapSafe.columnCount}, minmax(0, 1fr))` }}
          >
            {screen.tapSafe.board.flatMap((row, rowIndex) =>
              row.map((cell, columnIndex) => (
                <button
                  aria-label={`Tap Safe cell ${rowIndex + 1}-${columnIndex + 1}${cell.kind !== "empty" ? ` ${cell.kind}` : ""}`}
                  className={[
                    styles["tap-safe-cell"],
                    cell.kind === "safe" ? styles["tap-safe-cell-safe"] : "",
                    cell.kind === "hazard" ? styles["tap-safe-cell-hazard"] : "",
                    cell.isCleared ? styles["tap-safe-cell-cleared"] : "",
                  ].filter(Boolean).join(" ")}
                  data-cleared={cell.isCleared ? "true" : "false"}
                  data-column={columnIndex}
                  data-kind={cell.kind}
                  data-row={rowIndex}
                  data-tap-safe-cell="true"
                  data-wave={screen.tapSafe.waveIndex}
                  disabled={!screen.isLiveRun}
                  key={cell.id}
                  onClick={() => screen.handleCellPress(rowIndex, columnIndex)}
                  type="button"
                >
                  {cell.kind === "empty" ? (
                    <span aria-hidden="true" className={styles["tap-safe-empty"]}>·</span>
                  ) : (
                    <>
                      <span className={styles["tap-safe-glyph"]}>{cell.glyph}</span>
                      <span className={styles["tap-safe-badge"]}>{cell.badge}</span>
                    </>
                  )}
                </button>
              )),
            )}
          </div>

          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Tap only the safe targets before each wave disappears. Hazard taps and missed safe targets both add penalties."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Wave sprint ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
