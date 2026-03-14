import { useSequencePointWorkspace } from "../../../lib/client/usecase/game-workspace/use-sequence-point-workspace";
import sharedStyles from "../shared/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../shared/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../shared/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../shared/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../shared/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";
import styles from "./SequencePointGameWorkspace.module.css";

export function SequencePointGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useSequencePointWorkspace(workspace);

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
              Round {screen.sequencePoint.roundIndex + 1}/{screen.sequencePoint.totalRounds}
            </span>
            <span className="status-badge status-badge-neutral">
              Length {screen.sequencePoint.currentSequenceLength}/{screen.sequencePoint.targetSequenceLength}
            </span>
            <span className="status-badge status-badge-neutral">
              Step {screen.isInputting ? screen.sequencePoint.inputStep + 1 : screen.isWatching ? "—" : "0"}/{screen.sequencePoint.currentSequenceLength}
            </span>
            <span className="status-badge status-badge-neutral">Mistakes {screen.sequencePoint.mistakeCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], sharedStyles["board-card-minimal"], styles["sequence-point-board-card"]].join(" ")} aria-label="Sequence Point board">
        <div className={[styles["sequence-point-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <div className={styles["sequence-point-panel"]}>
            <div className={styles["sequence-point-copy"]}>
              <p className="eyebrow">{screen.isWatching ? "Watch" : screen.isInputting ? "Replay" : "Sequence Point"}</p>
              <strong>
                {screen.isWatching
                  ? "Remember the flash order"
                  : screen.isInputting
                    ? "Tap the same points in order"
                    : "Grow the sequence round by round"}
              </strong>
              <p className="compact-copy">
                {screen.isWatching
                  ? "The points flash quickly. Input is locked until the watch phase ends."
                  : screen.isInputting
                    ? "Replay the same point order. Wrong taps count, but the sprint stays live."
                    : "Each cleared round adds one more point to the next sequence."}
              </p>
            </div>
            <div
              className={styles["sequence-point-grid"]}
              style={{ gridTemplateColumns: `repeat(${screen.sequencePoint.columnCount}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: screen.sequencePoint.pointCount }, (_, pointIndex) => {
                const isFlashing = screen.sequencePoint.flashingPointIndex === pointIndex;
                const recalledIndex = screen.sequencePoint.sequence
                  .slice(0, screen.sequencePoint.inputStep)
                  .findIndex((value) => value === pointIndex);
                const isRecalled = recalledIndex !== -1;

                return (
                  <button
                    aria-label={`Sequence point ${pointIndex + 1}`}
                    className={[
                      styles["sequence-point-dot"],
                      isFlashing ? styles["sequence-point-dot-flashing"] : "",
                      isRecalled ? styles["sequence-point-dot-recalled"] : "",
                    ].filter(Boolean).join(" ")}
                    disabled={!screen.isInputting}
                    key={`sequence-point-${pointIndex}`}
                    onClick={() => screen.handlePointPress(pointIndex)}
                    type="button"
                  >
                    <span className={styles["sequence-point-core"]} />
                    {isRecalled ? <span className={styles["sequence-point-order"]}>{recalledIndex + 1}</span> : null}
                  </button>
                );
              })}
            </div>
          </div>
          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Watch the sequence of lit points, then replay the same points in the same order."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Point sprint ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
