import { useZoneLockWorkspace } from "../../../lib/client/usecase/game-workspace/use-zone-lock-workspace";
import { GameplayContextCue } from "../../gameplay/GameplayContextCue";
import { GameplaySidecarLayout } from "../../gameplay/GameplayLayoutVariants";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./ZoneLockGameWorkspace.module.css";

function formatZoneCells(cells: Array<{ columnIndex: number; rowIndex: number }>) {
  return cells.map((cell) => `${cell.rowIndex}-${cell.columnIndex}`).join("|");
}

export function ZoneLockGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useZoneLockWorkspace(workspace);

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
              Round {screen.zoneLock.currentRoundIndex + 1}/{screen.zoneLock.roundCount}
            </span>
            <span className="status-badge status-badge-neutral">
              Zones {screen.zoneLock.lockedZoneCount}/{screen.zoneLock.zones.length}
            </span>
            <span className="status-badge status-badge-neutral">Resets {screen.zoneLock.resetCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["zone-lock-workspace-card"]].join(" ")} aria-label="Zone Lock board">
        <div
          className={[styles["zone-lock-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}
          data-round={screen.zoneLock.currentRoundIndex}
          data-rows={screen.zoneLock.rowCount}
          data-state={screen.zoneLock.state}
          data-zone-lock-root="true"
        >
          <GameplayContextCue
            className={styles["zone-lock-copy"]}
            detail="One cell can affect multiple zones."
            phase={screen.isLiveRun ? "Live" : screen.isRunCleared ? "Cleared" : screen.isRunFailed ? "Timed out" : "Ready"}
            title="Toggle cells until every zone locks"
            tone="logic"
          />

          <GameplaySidecarLayout className={styles["zone-lock-columns"]} desktopMain="1.2fr" desktopSide="0.9fr" desktopSideMin="18rem" mobileSideMax="8rem" mobileSideMin="7.2rem">
            <div className={styles["zone-lock-board-column"]}>
              <div className={["hero-actions", "compact-actions", sharedStyles["workspace-utility-actions"], styles["zone-lock-actions"]].join(" ")}>
                <button className="action-link action-link-secondary" disabled={!screen.isLiveRun} onClick={screen.handleResetBoard} type="button">
                  Reset board
                </button>
              </div>

              <div
                className={styles["zone-lock-board"]}
                role="grid"
                aria-label="Zone Lock board"
                style={{ gridTemplateColumns: `repeat(${screen.zoneLock.columnCount}, minmax(0, 1fr))` }}
              >
                {screen.zoneLock.activeBoard.flatMap((row, rowIndex) =>
                  row.map((isActive, columnIndex) => {
                    const memberships = screen.zoneLock.zones.filter((zone) =>
                      zone.cells.some((cell) => cell.rowIndex === rowIndex && cell.columnIndex === columnIndex),
                    );

                    return (
                      <button
                        aria-label={`Zone Lock cell ${rowIndex + 1}-${columnIndex + 1}`}
                        className={[styles["zone-lock-cell"], isActive ? styles["zone-lock-cell-active"] : ""].filter(Boolean).join(" ")}
                        data-active={isActive ? "true" : "false"}
                        data-column={columnIndex}
                        data-row={rowIndex}
                        data-zone-lock-cell="true"
                        data-zones={memberships.map((zone) => zone.id).join(",")}
                        disabled={!screen.isLiveRun}
                        key={`zone-lock-cell-${rowIndex}-${columnIndex}`}
                        onClick={() => screen.handleCellPress(rowIndex, columnIndex)}
                        type="button"
                      >
                        <span className={styles["zone-lock-cell-state"]}>{isActive ? "Locked" : "Open"}</span>
                        <span className={styles["zone-lock-cell-tags"]}>
                          {memberships.map((zone) => (
                            <span className={styles["zone-lock-cell-tag"]} data-tone={zone.tone} key={`${rowIndex}-${columnIndex}-${zone.id}`}>
                              {zone.label.split(" ")[0]}
                            </span>
                          ))}
                        </span>
                      </button>
                    );
                  }),
                )}
              </div>
            </div>

            <div className={styles["zone-lock-zone-list"]}>
              {screen.zoneLock.zones.map((zone) => (
                <article
                  className={[styles["zone-lock-zone-card"], zone.isLocked ? styles["zone-lock-zone-card-locked"] : ""].filter(Boolean).join(" ")}
                  data-cells={formatZoneCells(zone.cells)}
                  data-current={zone.currentCount}
                  data-locked={zone.isLocked ? "true" : "false"}
                  data-target={zone.targetCount}
                  data-tone={zone.tone}
                  data-zone-id={zone.id}
                  data-zone-lock-zone="true"
                  key={zone.id}
                >
                  <div className={styles["zone-lock-zone-copy"]}>
                    <p className="eyebrow">{zone.label}</p>
                    <strong>{zone.isLocked ? "Locked" : "Open"}</strong>
                  </div>
                  <div className={styles["zone-lock-zone-metrics"]}>
                    <span>Target {zone.targetCount}</span>
                    <span>Current {zone.currentCount}</span>
                  </div>
                </article>
              ))}
            </div>
          </GameplaySidecarLayout>

          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Start the run, then toggle cells until every overlapping zone reaches its target count."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Zone grid ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
