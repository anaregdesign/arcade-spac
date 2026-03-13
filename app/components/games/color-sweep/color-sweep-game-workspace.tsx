import { useEffect, useRef } from "react";
import { useNavigation, useSubmit } from "react-router";

import { useColorSweepSession } from "../../../lib/client/usecase/game-workspace/use-color-sweep-session";
import sharedStyles from "../shared/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../shared/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../shared/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../shared/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../shared/game-instructions-dialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";
import styles from "./color-sweep-game-workspace.module.css";

const targetColorLabelByKey = {
  amber: "Amber",
  coral: "Coral",
  mint: "Mint",
  plum: "Plum",
  sky: "Sky",
  slate: "Slate",
} as const;

function formatDuration(totalSeconds: number) {
  return `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, "0")}`;
}

export function ColorSweepGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const navigation = useNavigation();
  const submit = useSubmit();
  const submittedOutcomeRef = useRef<"cleared" | "failed" | null>(null);
  const colorSweep = useColorSweepSession(workspace.difficulty);
  const isRunIdle = colorSweep.state === "idle";
  const isLiveRun = colorSweep.state === "playing";
  const isRunCleared = colorSweep.state === "cleared";
  const isRunFailed = colorSweep.state === "failed";
  const resultIntent = colorSweep.wrongTapCount === 0 ? "completeClean" : "completeSteady";
  const runStatusLabel = isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isLiveRun ? "Live" : "Ready";
  const startActionLabel = isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another board" : "Start run";
  const timeLeftSeconds = Math.max(0, colorSweep.timeLimitSeconds - colorSweep.elapsedSeconds);
  const saveStatusLabel = navigation.state === "submitting"
    ? "Opening result"
    : isRunCleared || isRunFailed
      ? "Opening result"
      : "Clear every target tile";

  useEffect(() => {
    workspace.setPlaying(colorSweep.state === "playing");
  }, [colorSweep.state, workspace]);

  useEffect(() => {
    if (colorSweep.state !== "cleared" && colorSweep.state !== "failed") {
      submittedOutcomeRef.current = null;
      return;
    }

    if (submittedOutcomeRef.current === colorSweep.state) {
      return;
    }

    submittedOutcomeRef.current = colorSweep.state;
    workspace.finishRun();

    const formData = new FormData();
    formData.set("intent", colorSweep.state === "failed" ? "fail" : resultIntent);
    formData.set("difficulty", workspace.difficulty);
    formData.set("primaryMetric", String(colorSweep.elapsedSeconds));
    formData.set("mistakeCount", String(colorSweep.wrongTapCount));
    submit(formData, { method: "post" });
  }, [colorSweep.elapsedSeconds, colorSweep.state, colorSweep.wrongTapCount, resultIntent, submit, workspace]);

  return (
    <>
      <GameWorkspaceControlsCard
        difficulty={workspace.difficulty}
        isDifficultyDisabled={isLiveRun}
        onDifficultyChange={workspace.changeDifficulty}
        primaryActions={(
          <GameInstructionsDialog instructions={instructions} />
        )}
        statusChips={(
          <>
            <span className="status-badge status-badge-neutral">{runStatusLabel}</span>
            <span className="status-badge status-badge-neutral">Target {targetColorLabelByKey[colorSweep.targetColorKey]}</span>
            <span className="status-badge status-badge-neutral">Left {formatDuration(timeLeftSeconds)}</span>
            <span className="status-badge status-badge-neutral">
              Tiles {colorSweep.targetCount - colorSweep.remainingTargetCount}/{colorSweep.targetCount}
            </span>
            <span className="status-badge status-badge-neutral">Wrong taps {colorSweep.wrongTapCount}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], sharedStyles["board-card-minimal"], styles["color-sweep-board-card"]].join(" ")} aria-label="Color Sweep board">
        <div className={[styles["color-sweep-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <div className={styles["color-sweep-panel"]}>
            <div className={styles["color-sweep-legend"]}>
              <div className={styles["color-sweep-target-copy"]}>
                <p className="eyebrow">Target color</p>
                <strong>{targetColorLabelByKey[colorSweep.targetColorKey]}</strong>
              </div>
              <span
                aria-hidden="true"
                className={[styles["color-sweep-swatch"], styles[`color-sweep-swatch-${colorSweep.targetColorKey}`]].join(" ")}
              />
            </div>
            <div
              className={styles["color-sweep-grid"]}
              style={{ gridTemplateColumns: `repeat(${colorSweep.columns}, minmax(0, 1fr))` }}
            >
              {colorSweep.board.flatMap((row, rowIndex) =>
                row.map((cell, columnIndex) => (
                  <button
                    aria-label={`Color tile ${rowIndex + 1}-${columnIndex + 1}`}
                    className={[
                      styles["color-sweep-tile"],
                      styles[`color-sweep-tile-${cell.colorKey}`],
                      cell.isCleared ? styles["color-sweep-tile-cleared"] : "",
                    ].filter(Boolean).join(" ")}
                    key={cell.id}
                    onClick={() => colorSweep.tapCell(rowIndex, columnIndex)}
                    type="button"
                  >
                    <span className={styles["color-sweep-tile-core"]} />
                  </button>
                )),
              )}
            </div>
          </div>
          <GameWorkspaceBoardOverlay
            actionLabel={startActionLabel}
            detail="Clear every tile that matches the target color before the timer runs out."
            isVisible={isRunIdle}
            onAction={() => {
              workspace.beginRun();
              colorSweep.beginRun();
            }}
            title="Board ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard
        detail={
          isRunCleared
            ? "Clear time and wrong taps were captured. The Result screen opens automatically."
            : isRunFailed
              ? "The time limit expired before every target tile was cleared."
              : "Tap only the target color. Wrong taps count against quality, and the run ends when the timer expires."
        }
        emphasis={saveStatusLabel}
      />
    </>
  );
}
