import { usePositionLockWorkspace } from "../../../lib/client/usecase/game-workspace/use-position-lock-workspace";
import { GameplayContextCue } from "../../gameplay/GameplayContextCue";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./PositionLockGameWorkspace.module.css";

function getPhaseHeading(isWatching: boolean, isInputting: boolean, isReviewing: boolean) {
  if (isWatching) {
    return "Track each token's final cell";
  }

  if (isInputting) {
    return "Place each token back on its cell";
  }

  if (isReviewing) {
    return "Read exact, near, and miss marks";
  }

  return "Watch first, then rebuild";
}

export function PositionLockGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = usePositionLockWorkspace(workspace);

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
              Round {screen.positionLock.roundIndex + 1}/{screen.positionLock.roundCount}
            </span>
            <span className="status-badge status-badge-neutral">
              Placed {screen.positionLock.placedTokenCount}/{screen.positionLock.tokenCount}
            </span>
            <span className="status-badge status-badge-neutral">Exact {screen.positionLock.exactCount}</span>
            <span className="status-badge status-badge-neutral">Near {screen.positionLock.nearCount}</span>
            <span className="status-badge status-badge-neutral">Errors {screen.positionLock.placementErrorCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["position-lock-board-card"]].join(" ")} aria-label="Position Lock board">
        <div className={[styles["position-lock-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <div className={styles["position-lock-panel"]} data-position-lock-phase={screen.positionLock.state}>
            <GameplayContextCue
              className={styles["position-lock-copy"]}
              detail={
                screen.isWatching
                  ? "Only final positions matter."
                  : screen.isInputting
                    ? "Choose a token, then tap its cell."
                    : screen.isReviewing
                      ? "Green exact, amber near, coral miss."
                      : "Short reveal before placement."
              }
              phase={screen.isWatching ? "Watch" : screen.isInputting ? "Place" : screen.isReviewing ? "Review" : "Ready"}
              title={getPhaseHeading(screen.isWatching, screen.isInputting, screen.isReviewing)}
              tone={screen.isWatching ? "watch" : screen.isInputting ? "target" : "review"}
            />

            <div className={styles["position-lock-summary"]}>
              <span>Current round tokens: {screen.positionLock.tokenCount}</span>
              <span>
                Review: {screen.positionLock.review?.exactCount ?? 0} exact / {screen.positionLock.review?.nearCount ?? 0} near / {screen.positionLock.review?.missCount ?? 0} miss
              </span>
            </div>

            <div
              className={styles["position-lock-board"]}
              style={{ gridTemplateColumns: `repeat(${screen.positionLock.columnCount}, minmax(0, 1fr))` }}
            >
              {Array.from({ length: screen.positionLock.rowCount * screen.positionLock.columnCount }, (_, index) => {
                const rowIndex = Math.floor(index / screen.positionLock.columnCount);
                const columnIndex = index % screen.positionLock.columnCount;
                const token = screen.positionLock.tokens.find((candidate) => {
                  const position = screen.positionLock.visiblePositions[candidate.id];

                  return position?.rowIndex === rowIndex && position?.columnIndex === columnIndex;
                });
                const reviewStatus = token ? screen.positionLock.review?.statuses[token.id] ?? null : null;
                const isWatchActive = screen.isWatching && token?.id === screen.positionLock.activeWatchTokenId;

                return (
                  <button
                    aria-label={`Position Lock cell ${rowIndex + 1}-${columnIndex + 1}${token ? ` ${token.label}` : ""}`}
                    className={[
                      styles["position-lock-cell"],
                      isWatchActive ? styles["position-lock-cell-watch-active"] : "",
                      reviewStatus === "exact" ? styles["position-lock-cell-review-exact"] : "",
                      reviewStatus === "near" ? styles["position-lock-cell-review-near"] : "",
                      reviewStatus === "miss" ? styles["position-lock-cell-review-miss"] : "",
                    ].filter(Boolean).join(" ")}
                    data-column={columnIndex}
                    data-position-lock-cell="true"
                    data-row={rowIndex}
                    data-token-id={token?.id ?? ""}
                    disabled={!screen.isInputting}
                    key={`position-lock-cell-${rowIndex}-${columnIndex}`}
                    onClick={() => screen.handleCellPress(rowIndex, columnIndex)}
                    type="button"
                  >
                    {token ? (
                      <span
                        className={[
                          styles["position-lock-token"],
                          screen.isWatching && token.id === screen.positionLock.activeWatchTokenId ? styles["position-lock-token-active"] : "",
                        ].filter(Boolean).join(" ")}
                        style={{
                          background: `linear-gradient(180deg, ${token.color}, rgba(15, 23, 42, 0.92))`,
                          boxShadow: `0 0 0 0.18rem ${token.color}26`,
                        }}
                      >
                        {token.label}
                      </span>
                    ) : (
                      <span aria-hidden="true" className={styles["position-lock-ghost"]}>+</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className={styles["position-lock-tray"]}>
              {screen.positionLock.tokens.map((token) => {
                const isPlaced = Boolean(screen.positionLock.placements[token.id]);
                const isSelected = screen.positionLock.selectedTokenId === token.id;

                return (
                  <button
                    aria-label={`Select token ${token.label}`}
                    className={[
                      styles["position-lock-tray-button"],
                      isPlaced ? styles["position-lock-tray-button-placed"] : "",
                      isSelected ? styles["position-lock-tray-button-selected"] : "",
                    ].filter(Boolean).join(" ")}
                    data-placed={isPlaced ? "true" : "false"}
                    data-position-lock-token="true"
                    data-selected={isSelected ? "true" : "false"}
                    data-target-column={token.targetPosition.columnIndex}
                    data-target-row={token.targetPosition.rowIndex}
                    data-token-id={token.id}
                    disabled={!screen.isInputting}
                    key={token.id}
                    onClick={() => screen.handleTokenSelect(token.id)}
                    type="button"
                  >
                    <span
                      className={styles["position-lock-tray-swatch"]}
                      style={{ backgroundColor: token.color }}
                    />
                    <span className={styles["position-lock-tray-label"]}>{token.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Watch where each token stops, then place the same token back onto the remembered final cell."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Position sprint ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
