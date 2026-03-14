import { useHueDriftWorkspace } from "../../../lib/client/usecase/game-workspace/use-hue-drift-workspace";
import type { DriftColor } from "../../../lib/client/usecase/game-workspace/use-hue-drift-session";
import { GameplayContextCue } from "../../gameplay/GameplayContextCue";
import { GameplayChoiceGrid } from "../../gameplay/layouts/GameplayChoiceGrid";
import { GameplaySequenceStageLayout } from "../../gameplay/layouts/GameplaySequenceStageLayout";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./HueDriftGameWorkspace.module.css";

function colorStyle(color: DriftColor) {
  return { background: `hsl(${color.h} ${color.s}% ${color.l}%)` };
}

export function HueDriftGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useHueDriftWorkspace(workspace);

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
              Prompt {screen.hueDrift.currentProblemIndex + 1}/{screen.hueDrift.problemCount}
            </span>
            <span className="status-badge status-badge-neutral">
              Mistakes {screen.hueDrift.mistakeCount}
            </span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["hue-drift-board-card"]].join(" ")} aria-label="Hue Drift board">
        <div className={[styles["hue-drift-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <GameplaySequenceStageLayout className={styles["hue-drift-stage"]}>
            <GameplayContextCue
              className={styles["hue-drift-copy"]}
              detail="Pick the missing swatch."
              phase="Read"
              title={screen.hueDrift.currentProblem.ruleLabel}
              tone="logic"
            />
            <div
              className={styles["hue-drift-row"]}
              style={{ gridTemplateColumns: `repeat(${screen.hueDrift.currentProblem.visibleSteps.length}, minmax(0, 1fr))` }}
            >
              {screen.hueDrift.currentProblem.visibleSteps.map((step, index) =>
                step ? (
                  <div className={styles["hue-drift-step"]} key={`drift-step-${index}`} style={colorStyle(step)} />
                ) : (
                  <div className={[styles["hue-drift-step"], styles["hue-drift-step-missing"]].join(" ")} key={`drift-step-${index}`}>
                    <span>?</span>
                  </div>
                ),
              )}
            </div>
            <GameplayChoiceGrid className={styles["hue-drift-choice-grid"]}>
              {screen.hueDrift.currentProblem.choices.map((choice, index) => (
                <button
                  className={styles["hue-drift-choice"]}
                  disabled={!screen.isLiveRun}
                  key={`hue-drift-choice-${index}`}
                  onClick={() => screen.handleAnswer(choice)}
                  type="button"
                >
                  <span className={styles["hue-drift-choice-swatch"]} style={colorStyle(choice)} />
                  <span className={styles["hue-drift-choice-copy"]}>Choice {index + 1}</span>
                </button>
              ))}
            </GameplayChoiceGrid>
          </GameplaySequenceStageLayout>
          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Read the color progression, then choose the missing swatch before the timer expires."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Drift sprint ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
