import { useColorCensusWorkspace } from "../../../lib/client/usecase/game-workspace/use-color-census-workspace";
import type { CensusColor } from "../../../lib/client/usecase/game-workspace/use-color-census-session";
import sharedStyles from "../shared/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../shared/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../shared/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../shared/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../shared/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";
import styles from "./ColorCensusGameWorkspace.module.css";

function tileStyle(color: CensusColor) {
  return { background: color.fill };
}

export function ColorCensusGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useColorCensusWorkspace(workspace);

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
              Round {screen.colorCensus.currentRoundIndex + 1}/{screen.colorCensus.roundCount}
            </span>
            <span className="status-badge status-badge-neutral">{screen.queryBadgeLabel}</span>
            <span className="status-badge status-badge-neutral">Mistakes {screen.colorCensus.mistakeCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["census-board-card"]].join(" ")} aria-label="Color Census board">
        <div className={[styles["census-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <div className={styles["census-stage"]}>
            <div className={styles["census-copy"]}>
              <p className="eyebrow">{screen.isWatching ? "Watch" : screen.isAnswering ? "Answer" : "Color Census"}</p>
              <strong>
                {screen.isWatching
                  ? "Memorize the full color spread"
                  : screen.colorCensus.currentRound.query.prompt}
              </strong>
              <p className="compact-copy">
                {screen.isWatching
                  ? "The mosaic stays visible only for a moment. Answer buttons unlock after the board fades."
                  : screen.colorCensus.currentRound.query.kind === "majority"
                    ? "Choose the one color that appeared most often in the mosaic."
                    : "Choose the exact number of tiles that used the highlighted color."}
              </p>
            </div>

            <div className={styles["census-board-shell"]}>
              <div
                className={styles["census-board"]}
                style={{ gridTemplateColumns: `repeat(${screen.colorCensus.currentRound.board[0]?.length ?? 1}, minmax(0, 1fr))` }}
              >
                {screen.colorCensus.currentRound.board.flatMap((row, rowIndex) =>
                  row.map((cell, columnIndex) => (
                    <div
                      aria-hidden="true"
                      className={[styles["census-tile"], screen.isBoardHidden ? styles["census-tile-hidden"] : ""].join(" ")}
                      key={`color-census-${rowIndex}-${columnIndex}`}
                      style={screen.isBoardHidden ? undefined : tileStyle(cell)}
                    />
                  )),
                )}
              </div>
              {screen.isBoardHidden ? (
                <div className={styles["census-memory-mask"]}>
                  <strong>Memory mode</strong>
                  <span>Answer from what you saw</span>
                </div>
              ) : null}
            </div>

            {screen.isWatching ? (
              <div className={styles["census-query-panel"]}>
                <strong>Query locked</strong>
                <p className="compact-copy">The prompt appears after the watch phase ends.</p>
              </div>
            ) : screen.colorCensus.currentRound.query.kind === "majority" ? (
              <div className={styles["census-choice-grid"]}>
                {screen.colorCensus.currentRound.query.choices.map((choice) => (
                  <button
                    aria-label={`Answer ${choice.label}`}
                    className={styles["census-choice-card"]}
                    disabled={!screen.isAnswering}
                    key={`color-census-choice-${choice.key}`}
                    onClick={() => screen.handleAnswer(choice.key)}
                    type="button"
                  >
                    <span className={styles["census-choice-swatch"]} style={tileStyle(choice)} />
                    <span className={styles["census-choice-copy"]}>{choice.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className={styles["census-count-panel"]}>
                <div className={styles["census-target-pill"]}>
                  <span className={styles["census-target-swatch"]} style={tileStyle(screen.colorCensus.currentRound.query.targetColor)} />
                  <span>{screen.colorCensus.currentRound.query.targetColor.label}</span>
                </div>
                <div className={styles["census-choice-grid"]}>
                  {screen.colorCensus.currentRound.query.choices.map((choice) => (
                    <button
                      aria-label={`Answer ${choice} tiles`}
                      className={[styles["census-choice-card"], styles["census-choice-card-numeric"]].join(" ")}
                      disabled={!screen.isAnswering}
                      key={`color-census-count-${choice}`}
                      onClick={() => screen.handleAnswer(choice)}
                      type="button"
                    >
                      <span className={styles["census-count-value"]}>{choice}</span>
                      <span className={styles["census-choice-copy"]}>tiles</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Memorize the mosaic before it fades, then answer the majority or exact-count query from memory."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Census sprint ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
