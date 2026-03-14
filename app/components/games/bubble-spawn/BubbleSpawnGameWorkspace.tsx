import { useBubbleSpawnWorkspace } from "../../../lib/client/usecase/game-workspace/use-bubble-spawn-workspace";
import sharedStyles from "../shared/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../shared/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../shared/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../shared/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../shared/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";
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
          <div className={styles["bubble-summary-grid"]}>
            <article className={styles["bubble-summary-card"]}>
              <span className={styles["bubble-summary-label"]}>Last burst</span>
              <strong className={styles["bubble-summary-value"]}>{screen.bubbleSpawn.lastBurstLabel}</strong>
            </article>
            <article className={styles["bubble-summary-card"]}>
              <span className={styles["bubble-summary-label"]}>Largest threat</span>
              <strong className={styles["bubble-summary-value"]}>{screen.bubbleSpawn.largestThreatLabel}</strong>
            </article>
            <article className={styles["bubble-summary-card"]}>
              <span className={styles["bubble-summary-label"]}>Next spawn</span>
              <strong className={styles["bubble-summary-value"]}>{screen.bubbleSpawn.nextSpawnLabel}</strong>
            </article>
            <article className={styles["bubble-summary-card"]}>
              <span className={styles["bubble-summary-label"]}>Last chain</span>
              <strong className={styles["bubble-summary-value"]}>{screen.bubbleSpawn.lastChainCount}</strong>
            </article>
          </div>

          <div className={styles["meter-grid"]}>
            <article className={styles["meter-card"]}>
              <div className={styles["meter-header"]}>
                <span className={styles["meter-label"]}>Stability meter</span>
                <strong>{stabilityPercent}%</strong>
              </div>
              <div className={styles["meter-track"]}>
                <span className={[styles["meter-fill"], styles["meter-fill-stability"]].join(" ")} style={{ width: `${stabilityPercent}%` }} />
              </div>
            </article>

            <article className={styles["meter-card"]}>
              <div className={styles["meter-header"]}>
                <span className={styles["meter-label"]}>Saturation meter</span>
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

          <p className={styles["bubble-copy"]}>
            Let clusters swell before you burst them. Big bubbles or connected color groups spread the chain further and buy back field stability.
          </p>

          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Burst the largest pressure cluster before the next growth pulse lands. The field clears once stability fills, and fails when saturation crosses the limit."
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
