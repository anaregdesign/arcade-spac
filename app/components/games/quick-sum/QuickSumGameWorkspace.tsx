import { useQuickSumWorkspace } from "../../../lib/client/usecase/game-workspace/use-quick-sum-workspace";
import { GameplayChoiceGrid } from "../../gameplay/GameplayLayoutVariants";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./QuickSumGameWorkspace.module.css";

export function QuickSumGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useQuickSumWorkspace(workspace);

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
            <span className="status-badge status-badge-neutral">Problem {screen.quickSum.currentProblemIndex + 1}/{screen.quickSum.problemCount}</span>
            <span className="status-badge status-badge-neutral">Wrong answers {screen.quickSum.wrongAnswerCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["sum-board-card"]].join(" ")} aria-label="Quick Sum board">
        <div className={[styles["sum-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <div className={styles["sum-stage"]}>
            <p className="eyebrow">Solve the prompt</p>
            <strong className={styles["sum-prompt"]}>{screen.quickSum.currentProblem?.prompt ?? "0 + 0"}</strong>
            {screen.quickSum.currentProblem ? (
              <GameplayChoiceGrid className={styles["sum-answer-grid"]}>
                {screen.quickSum.currentProblem.choices.map((choice) => (
                  <button
                    className={styles["sum-answer-button"]}
                    disabled={!screen.isLiveRun}
                    key={`quick-sum-${choice}`}
                    onClick={() => screen.handleAnswer(choice)}
                    type="button"
                  >
                    {choice}
                  </button>
                ))}
              </GameplayChoiceGrid>
            ) : null}
          </div>
          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Answer each prompt as fast as you can without stacking wrong answers."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Sum ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
