import { useBubbleSpawnWorkspace } from "../../../lib/client/usecase/game-workspace/use-bubble-spawn-workspace";
import { GameplayContextCue } from "../../gameplay/GameplayContextCue";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./BubbleSpawnGameWorkspace.module.css";

function getBubbleThemeClass(color: string | null) {
  if (!color) {
    return "";
  }

  return styles[`bubble-${color}`];
}

function getStageClass(stage: number) {
  return styles[`bubble-stage-${Math.max(0, Math.min(4, stage))}`];
}

export function BubbleSpawnGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useBubbleSpawnWorkspace(workspace);
  const saturationPercent = Math.min(100, Math.round((screen.bubbleSpawn.saturation / screen.bubbleSpawn.saturationThreshold) * 100));
  const stabilityPercent = Math.min(100, Math.round((screen.bubbleSpawn.stabilityScore / screen.bubbleSpawn.targetStability) * 100));

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
              Stability {screen.bubbleSpawn.stabilityScore}/{screen.bubbleSpawn.targetStability}
            </span>
            <span className="status-badge status-badge-neutral">
              Saturation {screen.bubbleSpawn.saturation}/{screen.bubbleSpawn.saturationThreshold}
            </span>
            <span className="status-badge status-badge-neutral">Best chain {screen.bubbleSpawn.bestChainCount}</span>
            <span className="status-badge status-badge-neutral">Live bubbles {screen.bubbleSpawn.liveBubbleCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["bubble-spawn-board-card"]].join(" ")} aria-label="Bubble Spawn field">
        <div
          className={[styles["bubble-spawn-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}
          data-best-chain={screen.bubbleSpawn.bestChainCount}
          data-bubble-spawn-root="true"
          data-burst-target-slot={screen.bubbleSpawn.burstTargetSlot}
          data-live-bubbles={screen.bubbleSpawn.liveBubbleCount}
          data-saturation={screen.bubbleSpawn.saturation}
          data-stability={screen.bubbleSpawn.stabilityScore}
          data-state={screen.bubbleSpawn.state}
          data-target-stability={screen.bubbleSpawn.targetStability}
        >
          <GameplayContextCue
            className={styles["bubble-spawn-copy"]}
            detail="Best burst target is marked."
            phase={screen.isLiveRun ? "Burst" : "Ready"}
            title="Pop the biggest pressure cluster"
            tone="target"
          />

          <div className={styles["meter-grid"]}>
            <article className={styles["meter-card"]}>
              <div className={styles["meter-header"]}>
                <span className={styles["meter-label"]}>Stability</span>
                <strong>{stabilityPercent}%</strong>
              </div>
              <div className={styles["meter-track"]}>
                <span className={[styles["meter-fill"], styles["meter-fill-stability"]].join(" ")} style={{ width: `${stabilityPercent}%` }} />
              </div>
            </article>

            <article className={styles["meter-card"]}>
              <div className={styles["meter-header"]}>
                <span className={styles["meter-label"]}>Saturation</span>
                <strong>{saturationPercent}%</strong>
              </div>
              <div className={styles["meter-track"]}>
                <span className={[styles["meter-fill"], styles["meter-fill-saturation"]].join(" ")} style={{ width: `${saturationPercent}%` }} />
              </div>
            </article>
          </div>

          <div
            className={styles["bubble-field-grid"]}
            style={{ gridTemplateColumns: `repeat(${screen.bubbleSpawn.columnCount}, minmax(0, 1fr))` }}
          >
            {screen.bubbleSpawn.field.map((cell) => (
              <button
                aria-label={`Bubble Spawn slot ${cell.slot + 1}${cell.color ? ` ${cell.color} stage ${cell.stage}` : " empty"}`}
                className={[
                  styles["bubble-field-cell"],
                  cell.color ? styles["bubble-field-cell-live"] : "",
                  cell.isBurstTarget ? styles["bubble-field-cell-target"] : "",
                ].filter(Boolean).join(" ")}
                data-bubble-color={cell.color}
                data-bubble-slot={cell.slot}
                data-bubble-spawn-cell="true"
                data-bubble-stage={cell.stage}
                data-burst-target={cell.isBurstTarget ? "true" : "false"}
                data-column={cell.column}
                data-row={cell.row}
                disabled={!screen.isLiveRun || !cell.color}
                key={cell.id}
                onClick={() => screen.handleBubblePress(cell.slot)}
                type="button"
              >
                {cell.color ? (
                  <span className={[styles["bubble-orb"], getBubbleThemeClass(cell.color), getStageClass(cell.stage)].join(" ")}>
                    <span className={styles["bubble-stage-label"]}>S{cell.stage}</span>
                    {cell.isBurstTarget ? <span className={styles["bubble-target-copy"]}>Best burst</span> : null}
                  </span>
                ) : (
                  <span aria-hidden="true" className={styles["bubble-empty-dot"]}>·</span>
                )}
              </button>
            ))}
          </div>

          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Burst the biggest cluster before saturation tops out."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Pressure field ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
