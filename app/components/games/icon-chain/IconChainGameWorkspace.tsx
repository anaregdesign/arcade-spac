import { useIconChainWorkspace } from "../../../lib/client/usecase/game-workspace/use-icon-chain-workspace";
import { GameplayContextCue } from "../../gameplay/GameplayContextCue";
import { GameplaySidecarLayout } from "../../gameplay/GameplayLayoutVariants";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./IconChainGameWorkspace.module.css";

function IconPill({
  accentColor,
  label,
}: {
  accentColor: string;
  label: string;
}) {
  return (
    <span
      className={styles["icon-chain-pill"]}
      style={{ background: `linear-gradient(180deg, ${accentColor}, rgba(15, 23, 42, 0.9))` }}
    >
      {label}
    </span>
  );
}

export function IconChainGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useIconChainWorkspace(workspace);

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
              Round {screen.iconChain.currentRoundIndex + 1}/{screen.iconChain.roundCount}
            </span>
            <span className="status-badge status-badge-neutral">
              Chain {screen.iconChain.currentChainLength}/{screen.iconChain.currentRoundLength}
            </span>
            <span className="status-badge status-badge-neutral">Best chain {screen.iconChain.longestChainLength}</span>
            <span className="status-badge status-badge-neutral">Wrong picks {screen.iconChain.wrongPickCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["icon-chain-board-card"]].join(" ")} aria-label="Icon Chain board">
        <div
          className={[styles["icon-chain-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}
          data-icon-chain-root="true"
          data-longest-chain={screen.iconChain.longestChainLength}
          data-next-icon-id={screen.iconChain.nextExpectedIconId ?? ""}
          data-round={screen.iconChain.currentRoundIndex}
          data-state={screen.iconChain.state}
          data-wrong-picks={screen.iconChain.wrongPickCount}
        >
          <GameplayContextCue
            className={styles["icon-chain-copy"]}
            detail={
              screen.isWatching
                ? "Hidden after reveal."
                : screen.isInputting
                  ? "Wrong picks reset to slot 1."
                  : "Reveal, then rebuild."
            }
            phase={screen.isWatching ? "Watch" : screen.isInputting ? "Clue" : "Ready"}
            title={screen.isWatching ? "Memorize the chain order" : screen.isInputting ? "Read clues, then pick the next icon" : "Reveal then rebuild"}
            tone={screen.isWatching ? "memory" : "logic"}
          />

          <GameplaySidecarLayout className={styles["icon-chain-columns"]} desktopMain="1.35fr" desktopSide="0.95fr" desktopSideMin="16rem" mobileSideMax="8.6rem" mobileSideMin="7.8rem">
            <div className={styles["icon-chain-board-column"]}>
              <article className={styles["icon-chain-panel"]}>
                <header className={styles["icon-chain-panel-header"]}>
                  <p className="eyebrow">{screen.isWatching ? "Full reveal" : "Progress chain"}</p>
                  <strong>{screen.isWatching ? "Read the complete order now" : "Confirmed picks stay locked in place"}</strong>
                </header>
                <div
                  className={styles["icon-chain-sequence-strip"]}
                  style={{ gridTemplateColumns: `repeat(${screen.iconChain.currentRoundLength}, minmax(0, 1fr))` }}
                >
                  {screen.iconChain.progressTokens.map((token, index) => {
                    const isConfirmed = index < screen.iconChain.confirmedIds.length;
                    const isHidden = !screen.isWatching && !isConfirmed;
                    const isActive = !screen.isWatching && index === screen.iconChain.confirmedIds.length;

                    return (
                      <div
                        className={[
                          styles["icon-chain-sequence-slot"],
                          isConfirmed ? styles["icon-chain-sequence-slot-locked"] : "",
                          isHidden ? styles["icon-chain-sequence-slot-hidden"] : "",
                          isActive ? styles["icon-chain-sequence-slot-active"] : "",
                        ].filter(Boolean).join(" ")}
                        data-confirmed={isConfirmed ? "true" : "false"}
                        data-icon-chain-slot="true"
                        data-sequence-index={index}
                        key={`${token.id}-${index}`}
                      >
                        <span className={styles["icon-chain-slot-order"]}>Slot {index + 1}</span>
                        {isHidden ? (
                          <>
                            <span className={styles["icon-chain-slot-label"]}>Hidden</span>
                            <span className={styles["icon-chain-slot-family"]}>Use the clues</span>
                          </>
                        ) : (
                          <>
                            <IconPill accentColor={token.accentColor} label={token.label} />
                            <span className={styles["icon-chain-slot-family"]}>{token.family}</span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </article>

              <article className={styles["icon-chain-panel"]}>
                <header className={styles["icon-chain-panel-header"]}>
                  <p className="eyebrow">Clue board</p>
                  <strong>Read clues before tapping</strong>
                </header>
                <div className={styles["icon-chain-clue-grid"]}>
                  {screen.iconChain.clueCards.map((clue) => (
                    <article
                      className={styles["icon-chain-clue-card"]}
                      data-clue-type={clue.type}
                      data-icon-chain-clue="true"
                      key={clue.id}
                    >
                      <strong>{clue.title}</strong>
                      <p>{clue.detail}</p>
                      <div className={styles["icon-chain-clue-icons"]}>
                        {clue.iconIds.map((iconId) => {
                          const token = screen.iconChain.iconTokensById[iconId];

                          return token ? <IconPill accentColor={token.accentColor} key={`${clue.id}-${iconId}`} label={token.label} /> : null;
                        })}
                      </div>
                    </article>
                  ))}
                </div>
              </article>
            </div>

            <div className={styles["icon-chain-side-column"]}>
              <article className={styles["icon-chain-panel"]}>
                <header className={styles["icon-chain-panel-header"]}>
                  <p className="eyebrow">Candidate tray</p>
                  <strong>{screen.isInputting ? "Tap the next icon" : "Unlocks after reveal"}</strong>
                </header>
                <p className={styles["icon-chain-live-copy"]}>
                  {screen.isInputting && screen.iconChain.nextExpectedIconId
                    ? "The next slot is active now. Correct picks extend the chain, and wrong picks reset the chain back to the start icon."
                    : "The tray stays visible so the board shape does not jump between phases."}
                </p>
                <div className={styles["icon-chain-candidate-grid"]}>
                  {screen.iconChain.candidateTokens.map((token) => {
                    const confirmedIndex = screen.iconChain.confirmedIds.indexOf(token.id);
                    const isConfirmed = confirmedIndex !== -1;
                    const isNext = screen.iconChain.nextExpectedIconId === token.id;

                    return (
                      <button
                        aria-label={`Icon Chain candidate ${token.label}`}
                        className={[
                          styles["icon-chain-candidate"],
                          isConfirmed ? styles["icon-chain-candidate-locked"] : "",
                          isNext ? styles["icon-chain-candidate-next"] : "",
                        ].filter(Boolean).join(" ")}
                        data-confirmed={isConfirmed ? "true" : "false"}
                        data-icon-chain-candidate="true"
                        data-icon-id={token.id}
                        data-next={isNext ? "true" : "false"}
                        disabled={!screen.isInputting || isConfirmed}
                        key={token.id}
                        onClick={() => screen.handleCandidatePress(token.id)}
                        type="button"
                      >
                        {isConfirmed ? <span className={styles["icon-chain-candidate-order"]}>{confirmedIndex + 1}</span> : null}
                        <IconPill accentColor={token.accentColor} label={token.label} />
                        <span className={styles["icon-chain-candidate-label"]}>{token.label}</span>
                        <span className={styles["icon-chain-candidate-family"]}>{token.family}</span>
                      </button>
                    );
                  })}
                </div>
              </article>
            </div>
          </GameplaySidecarLayout>

          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Memorize the full icon order during the watch phase, then rebuild the chain from the clue board without letting wrong picks reset your progress."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Clue sprint ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
