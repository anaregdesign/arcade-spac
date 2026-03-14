import { usePatternEchoWorkspace } from "../../../lib/client/usecase/game-workspace/use-pattern-echo-workspace";
import sharedStyles from "../shared/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../shared/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../shared/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../shared/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../shared/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";
import styles from "./pattern-echo-game-workspace.module.css";

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
              <div className={styles["pattern-echo-target-copy"]}>
                <p className="eyebrow">{screen.isWatching ? "Watch" : screen.isInputting ? "Repeat" : "Pattern Echo"}</p>
                <strong>{screen.isWatching ? "Memorise the sequence" : screen.isInputting ? "Tap in the same order" : "Watch, then repeat"}</strong>
              </div>
              <p className="compact-copy">
                {screen.isWatching
                  ? "Each pad will flash once. Remember the order before your turn begins."
                  : screen.isInputting
                    ? "Tap each pad in the exact order you saw. Wrong taps count but don't stop the run."
                    : "Watch all pads light up in sequence, then reproduce the same order."}
              </p>
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
