import { useLineConnectWorkspace } from "../../../lib/client/usecase/game-workspace/use-line-connect-workspace";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./LineConnectGameWorkspace.module.css";

function getThemeClass(theme: string | null) {
  if (!theme) {
    return "";
  }

  return styles[`theme-${theme}`];
}

export function LineConnectGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useLineConnectWorkspace(workspace);

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
              Board {screen.lineConnect.currentPuzzleIndex + 1}/{screen.lineConnect.puzzleCount}
            </span>
            <span className="status-badge status-badge-neutral">Active pair {screen.lineConnect.activePairLabel}</span>
            <span className="status-badge status-badge-neutral">
              Board pairs {screen.lineConnect.lockedPairCount}/{screen.lineConnect.pairCount}
            </span>
            <span className="status-badge status-badge-neutral">Corrections {screen.lineConnect.correctionsCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["line-connect-board-card"]].join(" ")} aria-label="Line Connect board">
        <div
          className={[styles["line-connect-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}
          data-active-pair={screen.lineConnect.activePairLabel}
          data-completed-pairs={screen.lineConnect.completedPairCount}
          data-corrections={screen.lineConnect.correctionsCount}
          data-line-connect-root="true"
          data-puzzle-index={screen.lineConnect.currentPuzzleIndex}
          data-solution-next-slot={screen.lineConnect.solutionNextSlot}
          data-state={screen.lineConnect.state}
        >
          <div className={styles["line-summary-grid"]}>
            <article className={styles["line-summary-card"]}>
              <span className={styles["line-summary-label"]}>Board</span>
              <strong className={styles["line-summary-value"]}>{screen.lineConnect.currentPuzzleName}</strong>
            </article>
            <article className={styles["line-summary-card"]}>
              <span className={styles["line-summary-label"]}>Last action</span>
              <strong className={styles["line-summary-value"]}>{screen.lineConnect.lastActionLabel}</strong>
            </article>
            <article className={styles["line-summary-card"]}>
              <span className={styles["line-summary-label"]}>Next segment</span>
              <strong className={styles["line-summary-value"]}>
                {screen.lineConnect.solutionNextSlot >= 0 ? `S${screen.lineConnect.solutionNextSlot + 1}` : "Finish pair"}
              </strong>
            </article>
          </div>

          <div className={styles["pair-token-row"]}>
            {screen.lineConnect.pairTokens.map((pair) => (
              <span
                className={[
                  styles["pair-token"],
                  getThemeClass(pair.theme),
                  pair.isActive ? styles["pair-token-active"] : "",
                  pair.isCompleted ? styles["pair-token-complete"] : "",
                ].filter(Boolean).join(" ")}
                key={pair.id}
              >
                {pair.label}
              </span>
            ))}
          </div>

          <div className={styles["action-row"]}>
            <button className={styles["utility-button"]} disabled={!screen.isLiveRun} onClick={screen.handleUndoStep} type="button">
              Undo step
            </button>
            <button className={styles["utility-button"]} disabled={!screen.isLiveRun} onClick={screen.handleResetPair} type="button">
              Reset pair
            </button>
            <button className={styles["utility-button"]} disabled={!screen.isLiveRun} onClick={screen.handleResetPuzzle} type="button">
              Reset board
            </button>
          </div>

          <div
            className={styles["line-board-grid"]}
            style={{ gridTemplateColumns: `repeat(${screen.lineConnect.columnCount}, minmax(0, 1fr))` }}
          >
            {screen.lineConnect.boardCells.map((cell) => (
              <button
                aria-label={`Line Connect slot ${cell.slot + 1}${cell.nodeLabel ? ` node ${cell.nodeLabel}` : ""}`}
                className={[
                  styles["line-cell"],
                  styles[`line-cell-${cell.state}`],
                  getThemeClass(cell.theme),
                  cell.isActiveEndpoint ? styles["line-cell-active-endpoint"] : "",
                ].filter(Boolean).join(" ")}
                data-cell-slot={cell.slot}
                data-cell-status={cell.state}
                data-line-connect-cell="true"
                data-pair-id={cell.pairId}
                data-solution-next={cell.isSolutionNext ? "true" : "false"}
                disabled={!screen.isLiveRun}
                key={`line-connect-slot-${cell.slot}`}
                onClick={() => screen.handleCellPress(cell.slot)}
                type="button"
              >
                {cell.nodeLabel ? (
                  <span className={styles["line-node-label"]}>{cell.nodeLabel}</span>
                ) : cell.isCurrentPath || cell.isLockedPath ? (
                  <span className={styles["line-path-fill"]} />
                ) : (
                  <span aria-hidden="true" className={styles["line-empty-dot"]}>·</span>
                )}
              </button>
            ))}
          </div>

          <p className={styles["line-copy"]}>
            Extend the active pair one segment at a time. Only the active pair may touch its target node, and locked paths cannot be crossed later.
          </p>

          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Tap the next adjacent segment to extend the active pair. Undo backs up one step, Reset pair restarts the current route, and Reset board clears the current puzzle."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Route board ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
