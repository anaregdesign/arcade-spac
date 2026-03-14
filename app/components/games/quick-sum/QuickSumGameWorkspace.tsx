import { useQuickSumWorkspace } from "../../../lib/client/usecase/game-workspace/use-quick-sum-workspace";
import sharedStyles from "../shared/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../shared/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../shared/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../shared/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../shared/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";
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
              <div className={styles["sum-answer-grid"]}>
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
              </div>
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
