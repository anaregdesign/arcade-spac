import { useFlipMatchWorkspace } from "../../../lib/client/usecase/game-workspace/use-flip-match-workspace";
import { GameplayContextCue } from "../../gameplay/GameplayContextCue";
import { GameplayTwinPanelLayout } from "../../gameplay/layouts/GameplayTwinPanelLayout";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./FlipMatchGameWorkspace.module.css";

function FlipBoard({
  board,
  columnCount,
  interactive = false,
  onTilePress,
  title,
}: {
  board: boolean[][];
  columnCount: number;
  interactive?: boolean;
  onTilePress?: (rowIndex: number, columnIndex: number) => void;
  title: string;
}) {
  return (
    <div className={styles["flip-panel"]}>
      <p className="eyebrow">{title}</p>
      <div className={styles["flip-board"]} style={{ gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))` }}>
        {board.flatMap((row, rowIndex) =>
          row.map((isFront, columnIndex) => {
            const className = [
              styles["flip-tile"],
              isFront ? styles["flip-tile-front"] : styles["flip-tile-back"],
            ].join(" ");
            const copy = isFront ? "◆" : "–";

            return interactive ? (
              <button
                aria-label={`${title} tile ${rowIndex + 1}-${columnIndex + 1} ${isFront ? "front" : "back"}`}
                className={className}
                key={`${title}-${rowIndex}-${columnIndex}`}
                onClick={() => onTilePress?.(rowIndex, columnIndex)}
                type="button"
              >
                <span>{copy}</span>
              </button>
            ) : (
              <span aria-hidden="true" className={className} key={`${title}-${rowIndex}-${columnIndex}`}>
                <span>{copy}</span>
              </span>
            );
          }),
        )}
      </div>
    </div>
  );
}

export function FlipMatchGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useFlipMatchWorkspace(workspace);

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
              Round {screen.flipMatch.currentRoundIndex + 1}/{screen.flipMatch.roundCount}
            </span>
            <span className="status-badge status-badge-neutral">{screen.ruleLabel}</span>
            <span className="status-badge status-badge-neutral">Flips {screen.flipMatch.flipCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"]].join(" ")} aria-label="Flip Match board">
        <div className={[styles["flip-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <GameplayContextCue
            className={styles["flip-copy"]}
            detail="Center tile flips with its left and right neighbors."
            phase="Rule"
            title="Flip a horizontal strip to match target"
            tone="swap"
          />
          <GameplayTwinPanelLayout className={styles["flip-columns"]}>
            <FlipBoard board={screen.flipMatch.targetGrid} columnCount={screen.flipMatch.columnCount} title="Target silhouette" />
            <FlipBoard
              board={screen.flipMatch.liveGrid}
              columnCount={screen.flipMatch.columnCount}
              interactive
              onTilePress={screen.handleTilePress}
              title="Live board"
            />
          </GameplayTwinPanelLayout>
          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Tap a live tile to flip itself plus its left and right neighbors until the live board matches the target silhouette."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Flip sprint ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
