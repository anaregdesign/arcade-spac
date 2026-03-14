import { useMemo } from "react";

import { useChainTriggerWorkspace } from "../../../lib/client/usecase/game-workspace/use-chain-trigger-workspace";
import { GameplayContextCue } from "../../gameplay/GameplayContextCue";
import { GameplaySidecarLayout } from "../../gameplay/layouts/GameplaySidecarLayout";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./ChainTriggerGameWorkspace.module.css";

function getNodeStatusCopy(node: {
  activationWave: number | null;
  incomingCount: number;
  isArmed: boolean;
  isLit: boolean;
  isSource: boolean;
  threshold: number;
}) {
  if (node.isSource) {
    return "Source";
  }

  if (node.isLit && node.activationWave !== null) {
    return `Wave ${node.activationWave}`;
  }

  if (node.isArmed) {
    return "Armed";
  }

  return `${node.incomingCount}/${node.threshold}`;
}

function getResolutionCopy(screen: ReturnType<typeof useChainTriggerWorkspace>) {
  if (!screen.chainTrigger.lastResolution) {
    return "No chain fired yet.";
  }

  if (screen.chainTrigger.lastResolution.stalledNodeIds.length === 0) {
    return `Resolved in ${screen.chainTrigger.lastResolution.waveCount} waves.`;
  }

  return `${screen.chainTrigger.lastResolution.stalledNodeIds.length} dark nodes remained after ${screen.chainTrigger.lastResolution.waveCount} waves.`;
}

function toNodeStyle(xPercent: number, yPercent: number) {
  return {
    left: `${xPercent}%`,
    top: `${yPercent}%`,
  };
}

function getEdgeKey(fromNodeId: string, toNodeId: string) {
  return `${fromNodeId}->${toNodeId}`;
}

export function ChainTriggerGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useChainTriggerWorkspace(workspace);
  const edgeSegments = useMemo(() => {
    const nodeById = new Map(screen.chainTrigger.nodes.map((node) => [node.id, node]));

    return screen.chainTrigger.nodes.flatMap((node) =>
      node.outgoingIds.flatMap((targetNodeId) => {
        const targetNode = nodeById.get(targetNodeId);

        if (!targetNode) {
          return [];
        }

        return [
          {
            fromNode: node,
            key: getEdgeKey(node.id, targetNode.id),
            targetNode,
          },
        ];
      }),
    );
  }, [screen.chainTrigger.nodes]);

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
              Round {screen.chainTrigger.currentPuzzleIndex + 1}/{screen.chainTrigger.puzzleCount}
            </span>
            <span className="status-badge status-badge-neutral">
              Armed {screen.chainTrigger.armedNodeIds.length}/{screen.chainTrigger.extraTriggerLimit}
            </span>
            <span className="status-badge status-badge-neutral">Extra {screen.chainTrigger.extraTriggerUsedCount}</span>
            <span className="status-badge status-badge-neutral">Fires {screen.chainTrigger.fireAttemptCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["chain-trigger-board-card"]].join(" ")} aria-label="Chain Trigger board">
        <div
          className={[styles["chain-trigger-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}
          data-chain-trigger-root="true"
          data-extra-used={screen.chainTrigger.extraTriggerUsedCount}
          data-mode={screen.chainTrigger.state}
          data-puzzle={screen.chainTrigger.currentPuzzleIndex}
          data-solved-rounds={screen.chainTrigger.solvedRoundCount}
        >
          <GameplayContextCue
            className={styles["chain-trigger-copy"]}
            detail="Thresholds stay fixed."
            phase="Plan"
            title="Arm helpers, then fire the source"
            tone="logic"
          />

          <div className={styles["chain-trigger-summary"]}>
            <span className={styles["chain-trigger-summary-chip"]}>Puzzle {screen.chainTrigger.puzzleLabel}</span>
            <span className={styles["chain-trigger-summary-chip"]}>{getResolutionCopy(screen)}</span>
            <span className={styles["chain-trigger-summary-chip"]}>
              Solved nodes {screen.chainTrigger.nodes.filter((node) => node.isLit).length}/{screen.chainTrigger.nodes.length}
            </span>
          </div>

          <GameplaySidecarLayout className={styles["chain-trigger-columns"]} desktopMain="1.5fr" desktopSide="0.9fr" desktopSideMin="15rem" mobileSideMin="7.6rem" mobileSideMax="8.4rem">
            <div className={styles["chain-trigger-board-column"]}>
              <div className={["hero-actions", "compact-actions", sharedStyles["workspace-utility-actions"], styles["chain-trigger-actions"]].join(" ")}>
                <button
                  className="action-link action-link-primary"
                  data-chain-trigger-fire="true"
                  disabled={!screen.isLiveRun || screen.isTransitioning}
                  onClick={screen.handleFireChain}
                  type="button"
                >
                  Fire chain
                </button>
                <button
                  className="action-link action-link-secondary"
                  disabled={!screen.isLiveRun || screen.isTransitioning || screen.chainTrigger.armedNodeIds.length === 0}
                  onClick={screen.handleClearPrep}
                  type="button"
                >
                  Clear prep
                </button>
              </div>

              <div className={styles["chain-trigger-board"]}>
                <svg aria-hidden="true" className={styles["chain-trigger-edges"]} viewBox="0 0 100 100" preserveAspectRatio="none">
                  <defs>
                    <marker id="chain-trigger-arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth">
                      <path d="M0,0 L6,3 L0,6 z" fill="#94a3b8" />
                    </marker>
                  </defs>
                  {edgeSegments.map((edge) => (
                    <line
                      className={[
                        styles["chain-trigger-edge"],
                        edge.fromNode.isLit && edge.targetNode.isLit ? styles["chain-trigger-edge-lit"] : "",
                      ].filter(Boolean).join(" ")}
                      data-edge-from={edge.fromNode.id}
                      data-edge-to={edge.targetNode.id}
                      key={edge.key}
                      markerEnd="url(#chain-trigger-arrow)"
                      x1={edge.fromNode.xPercent}
                      x2={edge.targetNode.xPercent}
                      y1={edge.fromNode.yPercent}
                      y2={edge.targetNode.yPercent}
                    />
                  ))}
                </svg>

                {screen.chainTrigger.nodes.map((node) => (
                  <button
                    aria-label={`Chain Trigger ${node.label}`}
                    className={[
                      styles["chain-trigger-node"],
                      node.isSource ? styles["chain-trigger-node-source"] : "",
                      node.isArmed ? styles["chain-trigger-node-armed"] : "",
                      node.isLit ? styles["chain-trigger-node-lit"] : "",
                    ].filter(Boolean).join(" ")}
                    data-armed={node.isArmed ? "true" : "false"}
                    data-chain-trigger-node-button={node.id}
                    data-incoming={node.incomingCount}
                    data-lit={node.isLit ? "true" : "false"}
                    data-source={node.isSource ? "true" : "false"}
                    data-threshold={node.threshold}
                    data-wave={node.activationWave ?? 0}
                    disabled={!screen.isLiveRun || screen.isTransitioning}
                    key={node.id}
                    onClick={() => screen.handleArmNode(node.id)}
                    style={toNodeStyle(node.xPercent, node.yPercent)}
                    type="button"
                  >
                    <span className={styles["chain-trigger-node-label"]}>{node.label}</span>
                    <span className={styles["chain-trigger-node-threshold"]}>
                      {node.isSource ? "Source" : `Need ${node.threshold}`}
                    </span>
                    <span className={styles["chain-trigger-node-status"]}>{getNodeStatusCopy(node)}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className={styles["chain-trigger-side"]}>
              <article className={styles["chain-trigger-panel"]}>
                <p className="eyebrow">Prep plan</p>
                <strong>
                  {screen.chainTrigger.armedNodeIds.length}/{screen.chainTrigger.extraTriggerLimit} extra triggers armed
                </strong>
                <p className="compact-copy">Armed nodes join wave 1.</p>
              </article>

              <article className={styles["chain-trigger-panel"]}>
                <p className="eyebrow">Last result</p>
                <strong>{getResolutionCopy(screen)}</strong>
                <p className="compact-copy">Dark nodes show missing inputs. Lit nodes keep their last wave.</p>
              </article>
            </div>
          </GameplaySidecarLayout>

          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Start the run, arm the smallest useful set of helper nodes, then fire the source and read the propagation wave."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Chain graph ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
