import { useStackSortWorkspace } from "../../../lib/client/usecase/game-workspace/use-stack-sort-workspace";
import sharedStyles from "../shared/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../shared/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../shared/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../shared/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../shared/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";
import styles from "./StackSortGameWorkspace.module.css";

export function StackSortGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useStackSortWorkspace(workspace);

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
            <span className="status-badge status-badge-neutral">Moves {screen.stackSort.moveCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["stack-board-card"]].join(" ")} aria-label="Stack Sort board">
        <div className={[styles["stack-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <div className={styles["stack-grid"]}>
            {screen.stackSort.stacks.map((stack, stackIndex) => (
              <button
                aria-label={`Stack ${stackIndex + 1}`}
                className={[
                  styles["stack-column"],
                  screen.stackSort.selectedStackIndex === stackIndex ? styles["stack-column-selected"] : "",
                ].filter(Boolean).join(" ")}
                key={`stack-${stackIndex}`}
                onClick={() => screen.handleStackPress(stackIndex)}
                type="button"
              >
                {Array.from({ length: screen.stackSort.capacity }, (_, slotIndex) => {
                  const token = stack[slotIndex];

                  return (
                    <span
                      aria-hidden="true"
                      className={[
                        styles["stack-token"],
                        token ? styles[`stack-token-${token}`] : styles["stack-token-empty"],
                      ].join(" ")}
                      key={`stack-${stackIndex}-slot-${slotIndex}`}
                    />
                  );
                })}
              </button>
            ))}
          </div>
          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Select a source stack, then a destination stack, until every non-empty stack holds only one color."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Stacks ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
