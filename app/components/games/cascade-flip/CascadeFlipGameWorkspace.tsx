import { useCascadeFlipWorkspace } from "../../../lib/client/usecase/game-workspace/use-cascade-flip-workspace";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./CascadeFlipGameWorkspace.module.css";

function getThemeClass(themeId: string) {
  return styles[`theme-${themeId}`] ?? "";
}

export function CascadeFlipGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useCascadeFlipWorkspace(workspace);

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
              Round {screen.cascadeFlip.currentRoundIndex + 1}/{screen.cascadeFlip.roundCount}
            </span>
            <span className="status-badge status-badge-neutral">
              Resolved {screen.cascadeFlip.resolvedCount}/{screen.cascadeFlip.cardGoal}
            </span>
            <span className="status-badge status-badge-neutral">Misses {screen.cascadeFlip.missCount}</span>
            <span className="status-badge status-badge-neutral">Speed {screen.cascadeFlip.streamSpeedLabel}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section
        aria-label="Cascade Flip board"
        className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["cascade-flip-board-card"]].join(" ")}
      >
        <div
          className={[styles["cascade-flip-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}
          data-cascade-flip-root="true"
          data-current-target={screen.cascadeFlip.currentTargetLabel ?? ""}
          data-phase={screen.cascadeFlip.phase}
          data-resolved-count={screen.cascadeFlip.resolvedCount}
          data-solution-card-id={screen.cascadeFlip.solutionCardId ?? ""}
          data-state={screen.cascadeFlip.state}
        >
          <div className={styles["summary-grid"]}>
            <article className={styles["summary-card"]}>
              <span className={styles["summary-label"]}>Stream board</span>
              <strong className={styles["summary-value"]}>{screen.cascadeFlip.currentRoundName}</strong>
            </article>
            <article className={styles["summary-card"]}>
              <span className={styles["summary-label"]}>Current target</span>
              <strong className={styles["summary-value"]}>{screen.cascadeFlip.currentTargetLabel ?? "Reveal"}</strong>
            </article>
            <article className={styles["summary-card"]}>
              <span className={styles["summary-label"]}>Last action</span>
              <strong className={styles["summary-value"]}>{screen.cascadeFlip.lastActionLabel}</strong>
            </article>
          </div>

          <div className={styles["workspace-grid"]}>
            <div className={styles["sequence-panel"]}>
              <p className={styles["panel-title"]}>Target order</p>
              <div className={styles["sequence-strip"]}>
                {screen.cascadeFlip.sequenceCards.map((card) => (
                  <span
                    className={[
                      styles["sequence-card"],
                      getThemeClass(card.themeId),
                      card.isCurrent ? styles["sequence-card-current"] : "",
                      card.isResolved ? styles["sequence-card-resolved"] : "",
                    ].filter(Boolean).join(" ")}
                    key={card.id}
                  >
                    {card.label}
                  </span>
                ))}
              </div>
              <p className={styles["panel-copy"]}>
                {screen.isRevealPhase
                  ? "Memorize the full order now. Input unlocks only after the reveal ends."
                  : "Tap only the next unresolved card in the strip while the stream shifts beneath it."}
              </p>
            </div>

            <div className={styles["stream-panel"]}>
              <p className={styles["panel-title"]}>Moving stream</p>
              <div className={styles["stream-grid"]}>
                {screen.cascadeFlip.visibleCards.map((card) => (
                  <button
                    className={[
                      styles["stream-card"],
                      getThemeClass(card.themeId),
                      card.isResolved ? styles["stream-card-resolved"] : "",
                      card.isSolution ? styles["stream-card-solution"] : "",
                    ].filter(Boolean).join(" ")}
                    data-card-id={card.id}
                    data-card-lane={card.laneIndex}
                    data-card-row={card.rowIndex}
                    data-card-symbol={card.label}
                    data-is-solution={card.isSolution ? "true" : "false"}
                    disabled={!screen.isInputPhase || card.isResolved}
                    key={card.id}
                    onClick={() => screen.handleCardPress(card.id)}
                    type="button"
                  >
                    <span className={styles["stream-card-label"]}>{card.label}</span>
                  </button>
                ))}
              </div>
              <p className={styles["panel-copy"]}>
                The stream advances one row at a time. Correct cards mark themselves, but the grid keeps moving until the round ends.
              </p>
            </div>
          </div>

          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Watch the reveal strip first. Once the stream goes live, only the next correct card in the order will advance the chain."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Memory stream ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
