import { useIconChainWorkspace } from "../../../lib/client/usecase/game-workspace/use-icon-chain-workspace";
import { GameplayContextCue } from "../../gameplay/GameplayContextCue";
import { GameplaySidecarLayout } from "../../gameplay/layouts/GameplaySidecarLayout";
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

function getIconPill(token: { accentColor: string; id: string; label: string } | undefined, key: string) {
  return token ? <IconPill accentColor={token.accentColor} label={token.label} /> : <span className={styles["icon-chain-clue-chip"]} key={key}>?</span>;
}

function getSlotNumber(detail: string) {
  const match = detail.match(/Slot\s+(\d+)/i);

  return match?.[1] ?? "?";
}

function renderClueSummary(
  clue: { detail: string; iconIds: string[]; id: string; type: "adjacent" | "anchor-first" | "anchor-last" | "before" | "family" | "slot" },
  iconTokensById: Record<string, { accentColor: string; family: string; id: string; label: string }>,
) {
  const [firstId, secondId] = clue.iconIds;
  const firstToken = iconTokensById[firstId];
  const secondToken = iconTokensById[secondId];

  if (clue.type === "anchor-first") {
    return (
      <>
        <span className={styles["icon-chain-clue-chip"]}>1</span>
        <span className={styles["icon-chain-clue-symbol"]}>=</span>
        {getIconPill(firstToken, `${clue.id}-first`)}
      </>
    );
  }

  if (clue.type === "anchor-last") {
    return (
      <>
        <span className={styles["icon-chain-clue-chip"]}>Last</span>
        <span className={styles["icon-chain-clue-symbol"]}>=</span>
        {getIconPill(firstToken, `${clue.id}-last`)}
      </>
    );
  }

  if (clue.type === "slot") {
    return (
      <>
        <span className={styles["icon-chain-clue-chip"]}>{getSlotNumber(clue.detail)}</span>
        <span className={styles["icon-chain-clue-symbol"]}>=</span>
        {getIconPill(firstToken, `${clue.id}-slot`)}
      </>
    );
  }

  if (clue.type === "family") {
    return (
      <>
        {getIconPill(firstToken, `${clue.id}-family`)}
        <span className={styles["icon-chain-clue-chip"]}>{firstToken?.family ?? "family"}</span>
      </>
    );
  }

  return (
    <>
      {getIconPill(firstToken, `${clue.id}-left`)}
      <span className={styles["icon-chain-clue-symbol"]}>{clue.type === "adjacent" ? "→" : "<"}</span>
      {getIconPill(secondToken, `${clue.id}-right`)}
    </>
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
                <p className={styles["icon-chain-panel-title"]}>{screen.isWatching ? "Reveal chain" : "Chain"}</p>
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
                        <span className={styles["icon-chain-slot-order"]}>{index + 1}</span>
                        {isHidden ? (
                          <span className={styles["icon-chain-slot-label"]}>?</span>
                        ) : (
                          <IconPill accentColor={token.accentColor} label={token.label} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </article>

              <article className={styles["icon-chain-panel"]}>
                <p className={styles["icon-chain-panel-title"]}>Clues</p>
                <div className={styles["icon-chain-clue-grid"]}>
                  {screen.iconChain.clueCards.map((clue) => (
                    <article
                      className={styles["icon-chain-clue-card"]}
                      data-clue-type={clue.type}
                      data-icon-chain-clue="true"
                      key={clue.id}
                    >
                      <span className={styles["icon-chain-clue-title"]}>{clue.title}</span>
                      <div className={styles["icon-chain-clue-icons"]}>
                        {renderClueSummary(clue, screen.iconChain.iconTokensById)}
                      </div>
                    </article>
                  ))}
                </div>
              </article>
            </div>

            <div className={styles["icon-chain-side-column"]}>
              <article className={styles["icon-chain-panel"]}>
                <p className={styles["icon-chain-panel-title"]}>{screen.isInputting ? "Pick next" : "Candidate tray"}</p>
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
                      </button>
                    );
                  })}
                </div>
              </article>
            </div>
          </GameplaySidecarLayout>

          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Memorize the reveal, then rebuild the chain from the clues."
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
