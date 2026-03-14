import { usePatternEchoWorkspace } from "../../../lib/client/usecase/game-workspace/use-pattern-echo-workspace";
import { GameplayContextCue } from "../../gameplay/GameplayContextCue";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./PatternEchoGameWorkspace.module.css";

export function PatternEchoGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = usePatternEchoWorkspace(workspace);

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
              Step {screen.isInputting ? screen.patternEcho.inputStep + 1 : screen.isWatching ? "—" : screen.isRunCleared ? screen.patternEcho.sequenceLength : "—"}/{screen.patternEcho.sequenceLength}
            </span>
            <span className="status-badge status-badge-neutral">Wrong inputs {screen.patternEcho.wrongInputCount}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], sharedStyles["board-card-minimal"], styles["pattern-echo-board-card"]].join(" ")} aria-label="Pattern Echo board">
        <div className={[styles["pattern-echo-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <div className={styles["pattern-echo-panel"]}>
            <div className={styles["pattern-echo-legend"]}>
              <GameplayContextCue
                detail={screen.isInputting ? "Wrong taps still count." : screen.isWatching ? "Input unlocks next." : undefined}
                phase={screen.isWatching ? "Watch" : screen.isInputting ? "Repeat" : "Ready"}
                title={screen.isWatching ? "Memorize the pad order" : screen.isInputting ? "Repeat the same order" : "Watch then repeat"}
                tone={screen.isWatching ? "watch" : "tap"}
              />
            </div>
            <div
              className={styles["pattern-echo-grid"]}
              style={{ gridTemplateColumns: `repeat(${screen.patternEcho.columns}, minmax(0, 1fr))` }}
            >
              {screen.patternEcho.pads.map((pad) => {
                const isFlashing = screen.patternEcho.flashingPadIndex === pad.index;
                const isActive = screen.isInputting;

                return (
                  <button
                    aria-label={`Pad ${pad.index + 1}`}
                    className={[
                      styles["pattern-echo-pad"],
                      styles[`pattern-echo-pad-${pad.color}`],
                      isFlashing ? styles["pattern-echo-pad-flash"] : "",
                      !isActive && !isFlashing ? styles["pattern-echo-pad-dim"] : "",
                    ].filter(Boolean).join(" ")}
                    disabled={!isActive}
                    key={pad.index}
                    onClick={() => screen.handlePadPress(pad.index)}
                    type="button"
                  />
                );
              })}
            </div>
          </div>
          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Start the board, then watch the sequence and reproduce it before time runs out."
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
