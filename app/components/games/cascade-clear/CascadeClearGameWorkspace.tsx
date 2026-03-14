import { useCascadeClearWorkspace } from "../../../lib/client/usecase/game-workspace/use-cascade-clear-workspace";
import sharedStyles from "../shared/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../shared/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../shared/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../shared/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../shared/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";
import styles from "./CascadeClearGameWorkspace.module.css";

function getTokenClass(color: string | null) {
  if (!color) {
    return "";
  }

  return styles[`token-${color}`];
}

export function CascadeClearGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useCascadeClearWorkspace(workspace);

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
              Score {screen.cascadeClear.currentScore}/{screen.cascadeClear.targetScore}
            </span>
            <span className="status-badge status-badge-neutral">Best cascade {screen.cascadeClear.bestCascadeCount}</span>
            <span className="status-badge status-badge-neutral">Triggers left {screen.cascadeClear.movesRemaining}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["cascade-board-card"]].join(" ")} aria-label="Cascade Clear board">
        <div
          className={[styles["cascade-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}
          data-best-cascade={screen.cascadeClear.bestCascadeCount}
          data-cascade-clear-root="true"
          data-moves-left={screen.cascadeClear.movesRemaining}
          data-optimal-trigger-index={screen.cascadeClear.optimalTrigger.index}
          data-optimal-trigger-kind={screen.cascadeClear.optimalTrigger.kind}
          data-score={screen.cascadeClear.currentScore}
          data-state={screen.cascadeClear.state}
          data-target-score={screen.cascadeClear.targetScore}
        >
          <div className={styles["cascade-summary-grid"]}>
            <article className={styles["cascade-summary-card"]}>
              <span className={styles["cascade-summary-label"]}>Last trigger</span>
              <strong className={styles["cascade-summary-value"]}>{screen.cascadeClear.lastTriggerLabel}</strong>
            </article>
            <article className={styles["cascade-summary-card"]}>
              <span className={styles["cascade-summary-label"]}>Score gain</span>
              <strong className={styles["cascade-summary-value"]}>{screen.cascadeClear.lastScoreGain}</strong>
            </article>
            <article className={styles["cascade-summary-card"]}>
              <span className={styles["cascade-summary-label"]}>Last cascade</span>
              <strong className={styles["cascade-summary-value"]}>{screen.cascadeClear.lastCascadeDepth}</strong>
            </article>
          </div>

          <div className={styles["cascade-grid-shell"]}>
            <div className={styles["column-trigger-row"]}>
              <span className={styles["rail-spacer"]} />
              {Array.from({ length: screen.cascadeClear.columnCount }, (_, columnIndex) => (
                <button
                  aria-label={`Cascade Clear trigger column ${columnIndex + 1}`}
                  className={styles["trigger-button"]}
                  data-trigger-index={columnIndex}
                  data-trigger-kind="column"
                  data-trigger-role="true"
                  disabled={!screen.isLiveRun}
                  key={`column-trigger-${columnIndex}`}
                  onClick={() => screen.handleTrigger("column", columnIndex)}
                  type="button"
                >
                  C{columnIndex + 1}
                </button>
              ))}
            </div>

            <div className={styles["row-grid"]}>
              {screen.cascadeClear.board.map((row, rowIndex) => (
                <div className={styles["board-row"]} key={`cascade-row-${rowIndex}`}>
                  <button
                    aria-label={`Cascade Clear trigger row ${rowIndex + 1}`}
                    className={styles["trigger-button"]}
                    data-trigger-index={rowIndex}
                    data-trigger-kind="row"
                    data-trigger-role="true"
                    disabled={!screen.isLiveRun}
                    onClick={() => screen.handleTrigger("row", rowIndex)}
                    type="button"
                  >
                    R{rowIndex + 1}
                  </button>

                  {row.map((cell, columnIndex) => (
                    <div
                      className={styles["board-cell"]}
                      data-cascade-clear-cell="true"
                      data-color={cell}
                      data-column={columnIndex}
                      data-row={rowIndex}
                      key={`cascade-cell-${rowIndex}-${columnIndex}`}
                    >
                      <span className={[styles["token-dot"], getTokenClass(cell)].join(" ")} />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <p className={styles["cascade-copy"]}>
            Each trigger clears one whole rail, then the refill pattern decides how far the connected color chain will spread.
          </p>

          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Choose one row or one column per move. The best chain usually starts where the refill will connect three or more matching colors."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Cascade board ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
