import { usePulseCountWorkspace } from "../../../lib/client/usecase/game-workspace/use-pulse-count-workspace";
import { GameplayChoiceGrid } from "../../gameplay/GameplayLayoutVariants";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./PulseCountGameWorkspace.module.css";

export function PulseCountGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = usePulseCountWorkspace(workspace);

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
            <span className="status-badge status-badge-neutral">Round {screen.pulseCount.currentRoundIndex + 1}/{screen.pulseCount.roundCount}</span>
            <span className="status-badge status-badge-neutral">Wrong answers {screen.pulseCount.wrongAnswerCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["pulse-board-card"]].join(" ")} aria-label="Pulse Count board">
        <div className={[styles["pulse-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <div className={styles["pulse-stage"]}>
            <div className={[styles["pulse-signal"], screen.pulseCount.isSignalLit ? styles["pulse-signal-lit"] : ""].join(" ")} aria-hidden="true" />
            <p className={styles["pulse-stage-label"]}>
              {screen.isWatching ? "Count every flash" : screen.isAnswering ? "How many pulses?" : "Ready to count"}
            </p>
            {screen.pulseCount.currentRound ? (
              <GameplayChoiceGrid className={styles["pulse-answer-row"]}>
                {screen.pulseCount.currentRound.choices.map((choice) => (
                  <button
                    className={styles["pulse-answer-button"]}
                    disabled={!screen.isAnswering}
                    key={`pulse-choice-${choice}`}
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
            detail="Count the flashes, then pick the number you saw."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Pulse ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
