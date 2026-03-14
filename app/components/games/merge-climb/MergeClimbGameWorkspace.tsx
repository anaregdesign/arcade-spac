import { useMergeClimbWorkspace } from "../../../lib/client/usecase/game-workspace/use-merge-climb-workspace";
import { GameplayContextCue } from "../../gameplay/GameplayContextCue";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./MergeClimbGameWorkspace.module.css";

const valuePalette: Record<number, { background: string; color: string }> = {
  2: { background: "#ffedd5", color: "#9a3412" },
  4: { background: "#fdba74", color: "#7c2d12" },
  8: { background: "#fb923c", color: "#ffffff" },
  16: { background: "#f97316", color: "#ffffff" },
  32: { background: "#ea580c", color: "#ffffff" },
  64: { background: "#c2410c", color: "#ffffff" },
  128: { background: "#9a3412", color: "#ffffff" },
};

function getCellStyle(value: number) {
  if (value === 0) {
    return undefined;
  }

  return valuePalette[value] ?? { background: "#7c2d12", color: "#ffffff" };
}

export function MergeClimbGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useMergeClimbWorkspace(workspace);

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
            <span className="status-badge status-badge-neutral">Goal {screen.mergeClimb.targetValue}</span>
            <span className="status-badge status-badge-neutral">Max {screen.mergeClimb.maxValue}</span>
            <span className="status-badge status-badge-neutral">Moves {screen.mergeClimb.moveCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["merge-board-card"]].join(" ")} aria-label="Merge Climb board">
        <div
          className={[styles["merge-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}
          data-empty-cells={screen.mergeClimb.emptyCellCount}
          data-goal={screen.mergeClimb.targetValue}
          data-max-value={screen.mergeClimb.maxValue}
          data-merge-climb-root="true"
          data-moves={screen.mergeClimb.moveCount}
          data-next-spawn={screen.mergeClimb.nextSpawnValue}
          data-state={screen.mergeClimb.state}
        >
          <GameplayContextCue
            className={styles["merge-copy"]}
            detail={`Next ${screen.mergeClimb.nextSpawnValue}.`}
            phase={screen.isLiveRun ? "Merge" : "Ready"}
            title="Swipe the board toward the goal tile"
            tone="logic"
          />

          <div
            className={styles["merge-board"]}
            style={{ gridTemplateColumns: `repeat(${screen.mergeClimb.boardSize}, minmax(0, 1fr))` }}
          >
            {screen.mergeClimb.board.flatMap((row, rowIndex) =>
              row.map((value, columnIndex) => (
                <div
                  className={[styles["merge-cell"], value === 0 ? styles["merge-cell-empty"] : ""].filter(Boolean).join(" ")}
                  data-column={columnIndex}
                  data-merge-climb-cell="true"
                  data-row={rowIndex}
                  data-value={value}
                  key={`merge-cell-${rowIndex}-${columnIndex}`}
                  style={getCellStyle(value)}
                >
                  {value === 0 ? "·" : value}
                </div>
              )),
            )}
          </div>

          <div className={styles["direction-panel"]}>
            <div className={styles["direction-grid"]}>
              <span className={styles["direction-spacer"]} />
              <button
                aria-label="Merge Climb move up"
                className={styles["direction-button"]}
                data-direction="up"
                data-merge-climb-direction="true"
                disabled={!screen.isLiveRun}
                onClick={() => screen.handleDirectionPress("up")}
                type="button"
              >
                Up
              </button>
              <span className={styles["direction-spacer"]} />
              <button
                aria-label="Merge Climb move left"
                className={styles["direction-button"]}
                data-direction="left"
                data-merge-climb-direction="true"
                disabled={!screen.isLiveRun}
                onClick={() => screen.handleDirectionPress("left")}
                type="button"
              >
                Left
              </button>
              <button
                aria-label="Merge Climb move down"
                className={styles["direction-button"]}
                data-direction="down"
                data-merge-climb-direction="true"
                disabled={!screen.isLiveRun}
                onClick={() => screen.handleDirectionPress("down")}
                type="button"
              >
                Down
              </button>
              <button
                aria-label="Merge Climb move right"
                className={styles["direction-button"]}
                data-direction="right"
                data-merge-climb-direction="true"
                disabled={!screen.isLiveRun}
                onClick={() => screen.handleDirectionPress("right")}
                type="button"
              >
                Right
              </button>
            </div>
          </div>

          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Merge toward the goal before the board locks."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Merge board ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
