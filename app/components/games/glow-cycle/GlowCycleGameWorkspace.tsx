import { useGlowCycleWorkspace } from "../../../lib/client/usecase/game-workspace/use-glow-cycle-workspace";
import sharedStyles from "../shared/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../shared/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../shared/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../shared/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../shared/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";
import styles from "./GlowCycleGameWorkspace.module.css";

function getJudgmentCopy(judgment: "good" | "miss" | "perfect" | "wrong-node" | null) {
  if (judgment === "perfect") {
    return "Perfect";
  }

  if (judgment === "good") {
    return "Good";
  }

  if (judgment === "wrong-node") {
    return "Wrong node";
  }

  if (judgment === "miss") {
    return "Miss";
  }

  return "—";
}

function getWindowCopy(window: "good" | "miss" | "perfect") {
  if (window === "perfect") {
    return "Perfect sync";
  }

  if (window === "good") {
    return "Good sync";
  }

  return "Off sync";
}

function getNodeActionCopy(isTarget: boolean, window: "good" | "miss" | "perfect") {
  if (!isTarget) {
    return "Decoy node";
  }

  if (window === "perfect") {
    return "Tap target now";
  }

  if (window === "good") {
    return "Target window open";
  }

  return "Track the crest";
}

function toGlowStyle(brightnessPercent: number) {
  const intensity = brightnessPercent / 100;

  return {
    opacity: clampOpacity(0.34 + intensity * 0.64),
    transform: `scale(${0.86 + intensity * 0.26})`,
  };
}

function toProgressStyle(progressPercent: number) {
  return {
    left: `${progressPercent}%`,
  };
}

function toWindowBandStyle(centerPercent: number, widthPercent: number) {
  return {
    left: `${centerPercent}%`,
    width: `${widthPercent}%`,
  };
}

function clampOpacity(value: number) {
  return Math.max(0.18, Math.min(1, value));
}

export function GlowCycleGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useGlowCycleWorkspace(workspace);
  const currentCycleLabel =
    screen.glowCycle.clearedCycleCount >= screen.glowCycle.cycleGoal ? "—" : screen.glowCycle.clearedCycleCount + 1;
  const targetNode = screen.glowCycle.nodes.find((node) => node.isTarget) ?? null;

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
              Cycle {currentCycleLabel}/{screen.glowCycle.cycleGoal}
            </span>
            <span className="status-badge status-badge-neutral">Target {targetNode?.label ?? "—"}</span>
            <span className="status-badge status-badge-neutral">Perfect {screen.glowCycle.perfectCycleCount}</span>
            <span className="status-badge status-badge-neutral">Mistimed {screen.glowCycle.mistimedTapCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["glow-cycle-board-card"]].join(" ")} aria-label="Glow Cycle board">
        <div
          className={[styles["glow-cycle-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}
          data-cycle-progress={screen.glowCycle.cycleProgressPercent}
          data-state={screen.glowCycle.state}
          data-target-node={targetNode?.id ?? "none"}
          data-window={screen.glowCycle.window}
          data-window-spread={screen.glowCycle.windowSpreadPercent}
          data-glow-cycle-root="true"
        >
          <div className={styles["glow-cycle-copy"]}>
            <p className="eyebrow">Visual rhythm target selection</p>
            <strong>Wait for the whole node board to crest together, then tap only the highlighted target.</strong>
            <p className="compact-copy">
              Every node pulses on a different cycle. Read the shared sync meter, avoid decoy taps, and keep the mistimed count low while the target changes each round.
            </p>
          </div>

          <div className={styles["glow-cycle-legend"]}>
            <span className={styles["glow-cycle-legend-target"]}>Target {targetNode?.label ?? "—"}</span>
            <span className={styles["glow-cycle-legend-window"]}>{getWindowCopy(screen.glowCycle.window)}</span>
            <span className={styles["glow-cycle-legend-status"]}>Last {getJudgmentCopy(screen.glowCycle.lastJudgment)}</span>
          </div>

          <div className={styles["glow-cycle-meter"]}>
            <span className={styles["glow-cycle-meter-track"]} />
            <span
              aria-hidden="true"
              className={styles["glow-cycle-meter-good"]}
              style={toWindowBandStyle(screen.glowCycle.syncProgressPercent, 18)}
            />
            <span
              aria-hidden="true"
              className={styles["glow-cycle-meter-perfect"]}
              style={toWindowBandStyle(screen.glowCycle.syncProgressPercent, 8)}
            />
            <span
              aria-hidden="true"
              className={styles["glow-cycle-meter-sync-marker"]}
              style={toProgressStyle(screen.glowCycle.syncProgressPercent)}
            />
            <span
              aria-hidden="true"
              className={styles["glow-cycle-meter-progress"]}
              style={toProgressStyle(screen.glowCycle.cycleProgressPercent)}
            />
          </div>

          <div className={styles["glow-cycle-grid"]}>
            {screen.glowCycle.nodes.map((node) => (
              <article
                className={[
                  styles["glow-cycle-node-card"],
                  styles[`glow-cycle-node-card-${node.theme}`],
                  node.isTarget ? styles["glow-cycle-node-card-target"] : "",
                  node.isTarget && screen.glowCycle.window === "perfect" ? styles["glow-cycle-node-card-target-perfect"] : "",
                ].filter(Boolean).join(" ")}
                data-brightness={node.brightnessPercent}
                data-glow-cycle-node={node.id}
                data-phase={node.phasePercent}
                data-target={node.isTarget ? "true" : "false"}
                key={node.id}
              >
                <header className={styles["glow-cycle-node-header"]}>
                  <div>
                    <p className="eyebrow">{node.label}</p>
                    <strong>{node.isTarget ? "Tap target" : "Read the pulse"}</strong>
                  </div>
                  <div className={styles["glow-cycle-node-meta"]}>
                    <span>{(node.periodMs / 1000).toFixed(2)}s cycle</span>
                    <span>{node.brightnessPercent}% glow</span>
                  </div>
                </header>

                <button
                  aria-label={`Glow Cycle ${node.label}${node.isTarget ? " target" : ""}`}
                  className={[
                    styles["glow-cycle-node-button"],
                    node.isTarget ? styles["glow-cycle-node-button-target"] : "",
                    node.isTarget && screen.glowCycle.window === "good" ? styles["glow-cycle-node-button-good"] : "",
                    node.isTarget && screen.glowCycle.window === "perfect" ? styles["glow-cycle-node-button-perfect"] : "",
                  ].filter(Boolean).join(" ")}
                  data-brightness={node.brightnessPercent}
                  data-cycle-index={screen.glowCycle.clearedCycleCount}
                  data-glow-cycle-node-button={node.id}
                  data-phase={node.phasePercent}
                  data-target={node.isTarget ? "true" : "false"}
                  data-window={screen.glowCycle.window}
                  disabled={!screen.isLiveRun}
                  onClick={() => screen.handleNodePress(node.id)}
                  type="button"
                >
                  <span aria-hidden="true" className={styles["glow-cycle-node-stage"]} />
                  <span aria-hidden="true" className={styles["glow-cycle-node-orb"]} style={toGlowStyle(node.brightnessPercent)} />
                  <span aria-hidden="true" className={styles["glow-cycle-node-ring"]} />
                  <span className={styles["glow-cycle-node-button-label"]}>{node.label}</span>
                  <span className={styles["glow-cycle-node-button-copy"]}>{getNodeActionCopy(node.isTarget, screen.glowCycle.window)}</span>
                </button>
              </article>
            ))}
          </div>

          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Start the run, watch the shared sync meter cross the glow crest, and tap only the highlighted node once the full board glows together."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Glow board ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
