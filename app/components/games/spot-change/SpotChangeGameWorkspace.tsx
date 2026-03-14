import type { CSSProperties } from "react";

import { useSpotChangeWorkspace } from "../../../lib/client/usecase/game-workspace/use-spot-change-workspace";
import type { SpotChangeCell } from "../../../lib/client/usecase/game-workspace/use-spot-change-session";
import { GameplayContextCue } from "../../gameplay/GameplayContextCue";
import { GameplayTwinPanelLayout } from "../../gameplay/layouts/GameplayTwinPanelLayout";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./SpotChangeGameWorkspace.module.css";

function buildSymbolStyle(cell: SpotChangeCell["original"]): CSSProperties {
  return {
    color: cell.accent,
    transform: `translate(${cell.offsetX}px, ${cell.offsetY}px) rotate(${cell.rotation}deg)`,
  };
}

function renderSymbol(symbol: string) {
  return symbol.length > 0 ? symbol : "·";
}

export function SpotChangeGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useSpotChangeWorkspace(workspace);

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
              Round {Math.min(screen.spotChange.roundIndex + 1, screen.spotChange.roundCount)}/{screen.spotChange.roundCount}
            </span>
            <span className="status-badge status-badge-neutral">
              Found {screen.spotChange.currentRound.foundCount}/{screen.spotChange.currentRound.differenceCount}
            </span>
            <span className="status-badge status-badge-neutral">Misses {screen.spotChange.missCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"]].join(" ")} aria-label="Spot Change board">
        <div className={[styles["spot-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <GameplayContextCue className={styles["spot-header"]} detail="Left board is reference." phase="Compare" title="Find changes on the right board" tone="compare" />

          <GameplayTwinPanelLayout className={styles["spot-scene-grid"]}>
            <section className={styles["spot-scene-panel"]} aria-label="Original scene">
              <div className={styles["spot-scene-heading"]}>
                <p className="eyebrow">Original</p>
                <strong>Read-only reference</strong>
              </div>
              <div
                className={styles["spot-grid"]}
                style={{ gridTemplateColumns: `repeat(${screen.spotChange.currentRound.board[0]?.length ?? 1}, minmax(0, 1fr))` }}
              >
                {screen.spotChange.currentRound.board.flatMap((row) =>
                  row.map((cell) => (
                    <div
                      className={[styles["spot-cell"], cell.isFound ? styles["spot-cell-found"] : ""].filter(Boolean).join(" ")}
                      key={`original-${cell.id}`}
                    >
                      <span className={styles["spot-symbol"]} style={buildSymbolStyle(cell.original)}>
                        {renderSymbol(cell.original.symbol)}
                      </span>
                    </div>
                  )),
                )}
              </div>
            </section>

            <section className={styles["spot-scene-panel"]} aria-label="Changed scene">
              <div className={styles["spot-scene-heading"]}>
                <p className="eyebrow">Changed</p>
                <strong>Tap differences here</strong>
              </div>
              <div
                className={styles["spot-grid"]}
                style={{ gridTemplateColumns: `repeat(${screen.spotChange.currentRound.board[0]?.length ?? 1}, minmax(0, 1fr))` }}
              >
                {screen.spotChange.currentRound.board.flatMap((row, rowIndex) =>
                  row.map((cell, columnIndex) => (
                    <button
                      aria-label={`Changed scene tile ${rowIndex + 1}-${columnIndex + 1}`}
                      className={[
                        styles["spot-cell"],
                        styles["spot-cell-button"],
                        cell.isFound ? styles["spot-cell-found"] : "",
                      ].filter(Boolean).join(" ")}
                      disabled={!screen.isLiveRun}
                      key={`changed-${cell.id}`}
                      onClick={() => screen.handleCellPress(rowIndex, columnIndex)}
                      type="button"
                    >
                      <span className={styles["spot-symbol"]} style={buildSymbolStyle(cell.changed)}>
                        {renderSymbol(cell.changed.symbol)}
                      </span>
                      {cell.isFound ? <span className={styles["spot-found-badge"]}>Found</span> : null}
                    </button>
                  )),
                )}
              </div>
            </section>
          </GameplayTwinPanelLayout>

          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Compare the original and changed scenes, then tap every changed tile on the right board before time runs out."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Scene set ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
