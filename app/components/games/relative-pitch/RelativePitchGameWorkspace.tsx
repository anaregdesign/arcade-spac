import { useRelativePitchWorkspace } from "../../../lib/client/usecase/game-workspace/use-relative-pitch-workspace";
import { GameplayChoiceGrid } from "../../gameplay/GameplayLayoutVariants";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./RelativePitchGameWorkspace.module.css";

export function RelativePitchGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useRelativePitchWorkspace(workspace);

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
              Round {Math.min(screen.relativePitch.currentRoundIndex + 1, screen.relativePitch.totalRoundCount)}
              /{screen.relativePitch.totalRoundCount}
            </span>
            <span className="status-badge status-badge-neutral">Replays {screen.relativePitch.replayCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["pitch-board-card"]].join(" ")} aria-label="Relative Pitch board">
        <div
          className={[styles["pitch-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}
          data-audio-phase={screen.relativePitch.audioPhase}
          data-correct-candidate={screen.relativePitch.correctCandidateId}
          data-relative-pitch-root="true"
          data-replays={screen.relativePitch.replayCount}
          data-round-id={screen.relativePitch.currentRound.id}
          data-state={screen.relativePitch.state}
        >
          <div className={styles["pitch-header"]}>
            <article className={styles["pitch-hero"]}>
              <span className={styles["pitch-label"]}>Current prompt</span>
              <strong className={styles["pitch-value"]}>Match the same jump from the new base note.</strong>
              <p className={styles["phase-copy"]}>
                {screen.relativePitch.audioPhase === "intro"
                  ? "Listen to the reference interval and the new base note before choosing."
                  : "Candidate pads are live. Each tap plays the new base plus that candidate note and commits the answer."}
              </p>
            </article>

            <div className={styles["replay-row"]}>
              <button
                className={styles["replay-button"]}
                data-relative-pitch-action="replay-reference"
                disabled={!screen.isLiveRun}
                onClick={screen.handleReplayReference}
                type="button"
              >
                Replay reference
              </button>
              <button
                className={styles["replay-button"]}
                data-relative-pitch-action="replay-base"
                disabled={!screen.isLiveRun}
                onClick={screen.handleReplayBase}
                type="button"
              >
                Replay base
              </button>
            </div>
          </div>

          <GameplayChoiceGrid className={styles["candidate-grid"]}>
            {screen.relativePitch.currentRound.candidates.map((candidate) => (
              <button
                className={styles["candidate-button"]}
                data-candidate-correct={candidate.id === screen.relativePitch.correctCandidateId ? "true" : "false"}
                data-candidate-id={candidate.id}
                data-relative-pitch-candidate="true"
                disabled={!screen.isLiveRun || screen.relativePitch.audioPhase !== "choice"}
                key={candidate.id}
                onClick={() => screen.handleCandidatePress(candidate.id)}
                type="button"
              >
                <span className={styles["candidate-id"]}>{candidate.id}</span>
                <span className={styles["candidate-copy"]}>Play and choose</span>
              </button>
            ))}
          </GameplayChoiceGrid>

          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Start run to unlock audio, hear the reference interval, then match that same jump from the new base note."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Ear test ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
