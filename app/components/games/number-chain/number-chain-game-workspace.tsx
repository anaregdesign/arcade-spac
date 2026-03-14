import { useEffect, useRef } from "react";
import { useNavigation, useSubmit } from "react-router";

import { useNumberChainSession } from "../../../lib/client/usecase/game-workspace/use-number-chain-session";
import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../../lib/client/sound-effects";
import sharedStyles from "../shared/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../shared/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../shared/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../shared/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../shared/game-instructions-dialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";
import styles from "./number-chain-game-workspace.module.css";

function formatDuration(totalSeconds: number) {
  return `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, "0")}`;
}

export function NumberChainGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const navigation = useNavigation();
  const submit = useSubmit();
  const submittedOutcomeRef = useRef<"cleared" | "failed" | null>(null);
  const numberChain = useNumberChainSession(workspace.difficulty);
  const isRunIdle = numberChain.state === "idle";
  const isLiveRun = numberChain.state === "playing";
  const isRunCleared = numberChain.state === "cleared";
  const isRunFailed = numberChain.state === "failed";
  const resultIntent = numberChain.wrongTapCount === 0 ? "completeClean" : "completeSteady";
  const runStatusLabel = isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isLiveRun ? "Live" : "Ready";
  const startActionLabel = isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another board" : "Start run";
  const timeLeftSeconds = Math.max(0, numberChain.timeLimitSeconds - numberChain.elapsedSeconds);
  const saveStatusLabel = navigation.state === "submitting"
    ? "Opening result"
    : isRunCleared || isRunFailed
      ? "Opening result"
      : "Tap in order";

  useEffect(() => {
    workspace.setPlaying(numberChain.state === "playing");
  }, [numberChain.state, workspace]);

  useEffect(() => {
    if (numberChain.state === "cleared") {
      playRunClear();
    } else if (numberChain.state === "failed") {
      playRunFail();
    }
  }, [numberChain.state]);

  useEffect(() => {
    if (numberChain.state !== "cleared" && numberChain.state !== "failed") {
      submittedOutcomeRef.current = null;
      return;
    }

    if (submittedOutcomeRef.current === numberChain.state) {
      return;
    }

    submittedOutcomeRef.current = numberChain.state;
    workspace.finishRun();

    const formData = new FormData();
    formData.set("intent", numberChain.state === "failed" ? "fail" : resultIntent);
    formData.set("difficulty", workspace.difficulty);
    formData.set("primaryMetric", String(numberChain.elapsedSeconds));
    formData.set("mistakeCount", String(numberChain.wrongTapCount));
    submit(formData, { method: "post" });
  }, [numberChain.elapsedSeconds, numberChain.state, numberChain.wrongTapCount, resultIntent, submit, workspace]);

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
            <span className="status-badge status-badge-neutral">Next {numberChain.nextNumber}</span>
            <span className="status-badge status-badge-neutral">Left {formatDuration(timeLeftSeconds)}</span>
            <span className="status-badge status-badge-neutral">
              Cleared {numberChain.totalCount - numberChain.remainingCount}/{numberChain.totalCount}
            </span>
            <span className="status-badge status-badge-neutral">Wrong taps {numberChain.wrongTapCount}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], sharedStyles["board-card-minimal"], styles["number-chain-board-card"]].join(" ")} aria-label="Number Chain board">
        <div className={[styles["number-chain-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <div className={styles["number-chain-panel"]}>
            <div className={styles["number-chain-legend"]}>
              <div className={styles["number-chain-target-copy"]}>
                <p className="eyebrow">Next number</p>
                <strong>{numberChain.nextNumber}</strong>
              </div>
              <p className="compact-copy">Tap the numbers in ascending order before the timer expires.</p>
            </div>
            <div
              className={styles["number-chain-grid"]}
              style={{ gridTemplateColumns: `repeat(${numberChain.columns}, minmax(0, 1fr))` }}
            >
              {numberChain.board.flatMap((row, rowIndex) =>
                row.map((cell, columnIndex) => (
                  <button
                    aria-label={`Number ${cell.value}`}
                    className={[
                      styles["number-chain-tile"],
                      cell.isCleared ? styles["number-chain-tile-cleared"] : "",
                      isLiveRun && cell.value === numberChain.nextNumber ? styles["number-chain-tile-next"] : "",
                    ].filter(Boolean).join(" ")}
                    key={cell.id}
                    onClick={() => {
                      if (numberChain.state === "playing" && !cell.isCleared) {
                        if (cell.value === numberChain.nextNumber) {
                          playTapCorrect();
                        } else {
                          playTapWrong();
                        }
                      }

                      numberChain.tapCell(rowIndex, columnIndex);
                    }}
                    type="button"
                  >
                    {cell.isCleared ? "" : cell.value}
                  </button>
                )),
              )}
            </div>
          </div>
          <GameWorkspaceBoardOverlay
            actionLabel={startActionLabel}
            detail="Start the board, then tap the numbers in ascending order before time runs out."
            isVisible={isRunIdle}
            onAction={() => {
              playRunStart();
              workspace.beginRun();
              numberChain.beginRun();
            }}
            title="Board ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard
        detail={
          isRunCleared
            ? "The clear time and wrong taps were captured. The Result screen opens automatically."
            : isRunFailed
              ? "The timer expired before the last number was reached."
              : "Only the current next number advances the chain. Wrong taps count against quality."
        }
        emphasis={saveStatusLabel}
      />
    </>
  );
}
