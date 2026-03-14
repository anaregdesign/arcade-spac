import { usePairFlipWorkspace } from "../../../lib/client/usecase/game-workspace/use-pair-flip-workspace";
import sharedStyles from "../shared/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../shared/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../shared/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../shared/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../shared/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";
import styles from "./PairFlipGameWorkspace.module.css";

export function PairFlipGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = usePairFlipWorkspace(workspace);

  return (
    <>
      <GameWorkspaceControlsCard
        difficulty={workspace.difficulty}
        isDifficultyDisabled={screen.isLiveRun}
        onDifficultyChange={workspace.changeDifficulty}
        primaryActions={(
          <GameInstructionsDialog instructions={instructions} />
        )}
        statusChips={(
          <>
            <span className="status-badge status-badge-neutral">{screen.runStatusLabel}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
            <span className="status-badge status-badge-neutral">
              Matched {screen.pairFlip.matchedPairCount}/{screen.pairFlip.totalPairs}
            </span>
            <span className="status-badge status-badge-neutral">Pairs left {screen.pairFlip.remainingPairs}</span>
            <span className="status-badge status-badge-neutral">Mismatches {screen.pairFlip.mismatchCount}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], sharedStyles["board-card-minimal"], styles["pair-flip-board-card"]].join(" ")} aria-label="Pair Flip board">
        <div className={[styles["pair-flip-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <div className={styles["pair-flip-panel"]}>
            <div className={styles["pair-flip-legend"]}>
              <div className={styles["pair-flip-target-copy"]}>
                <p className="eyebrow">Memory board</p>
                <strong>Match every pair</strong>
              </div>
              <p className="compact-copy">Open two cards at a time. Mismatched cards flip back after a short reveal.</p>
            </div>
            <div
              className={styles["pair-flip-grid"]}
              style={{ gridTemplateColumns: `repeat(${screen.pairFlip.columns}, minmax(0, 1fr))` }}
            >
              {screen.pairFlip.board.flatMap((row, rowIndex) =>
                row.map((card, columnIndex) => (
                  <button
                    aria-label={`Card ${rowIndex + 1}-${columnIndex + 1}`}
                    className={[
                      styles["pair-flip-card"],
                      card.isOpen ? styles["pair-flip-card-open"] : "",
                      card.isMatched ? styles["pair-flip-card-matched"] : "",
                    ].filter(Boolean).join(" ")}
                    key={card.id}
                    onClick={() => screen.handleCardPress(rowIndex, columnIndex)}
                    type="button"
                  >
                    <span className={styles["pair-flip-card-face"]}>
                      {card.isOpen || card.isMatched ? card.symbol : ""}
                    </span>
                  </button>
                )),
              )}
            </div>
          </div>
          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Start the board, then flip pairs and remember their positions before the timer expires."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Board ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard
        detail={screen.finishDetail}
        emphasis={screen.saveStatusLabel}
      />
    </>
  );
}
