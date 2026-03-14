import { useHueDriftWorkspace } from "../../../lib/client/usecase/game-workspace/use-hue-drift-workspace";
import type { DriftColor } from "../../../lib/client/usecase/game-workspace/use-hue-drift-session";
import sharedStyles from "../shared/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../shared/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../shared/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../shared/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../shared/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";
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
          <div className={styles["hue-drift-stage"]}>
            <div className={styles["hue-drift-copy"]}>
              <p className="eyebrow">Read the drift</p>
              <strong>{screen.hueDrift.currentProblem.ruleLabel}</strong>
              <p className="compact-copy">
                One swatch is missing from the row. Compare the visible steps and choose the correct missing color.
              </p>
            </div>
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
            <div className={styles["hue-drift-choice-grid"]}>
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
            </div>
          </div>
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
