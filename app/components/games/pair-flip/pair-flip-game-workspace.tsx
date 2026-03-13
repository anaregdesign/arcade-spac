import { useEffect, useRef } from "react";
import { useNavigation, useSubmit } from "react-router";

import { usePairFlipSession } from "../../../lib/client/usecase/game-workspace/use-pair-flip-session";
import sharedStyles from "../shared/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../shared/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../shared/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../shared/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../shared/game-instructions-dialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";
import styles from "./pair-flip-game-workspace.module.css";

function formatDuration(totalSeconds: number) {
  return `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, "0")}`;
}

export function PairFlipGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const navigation = useNavigation();
  const submit = useSubmit();
  const submittedOutcomeRef = useRef<"cleared" | "failed" | null>(null);
  const pairFlip = usePairFlipSession(workspace.difficulty);
  const isRunIdle = pairFlip.state === "idle";
  const isLiveRun = pairFlip.state === "playing";
  const isRunCleared = pairFlip.state === "cleared";
  const isRunFailed = pairFlip.state === "failed";
  const resultIntent = pairFlip.mismatchCount === 0 ? "completeClean" : "completeSteady";
  const runStatusLabel = isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isLiveRun ? "Live" : "Ready";
  const startActionLabel = isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another board" : "Start run";
  const timeLeftSeconds = Math.max(0, pairFlip.timeLimitSeconds - pairFlip.elapsedSeconds);
  const saveStatusLabel = navigation.state === "submitting"
    ? "Opening result"
    : isRunCleared || isRunFailed
      ? "Opening result"
      : "Match every pair";

  useEffect(() => {
    workspace.setPlaying(pairFlip.state === "playing");
  }, [pairFlip.state, workspace]);

  useEffect(() => {
    if (pairFlip.state !== "cleared" && pairFlip.state !== "failed") {
      submittedOutcomeRef.current = null;
      return;
    }

    if (submittedOutcomeRef.current === pairFlip.state) {
      return;
    }

    submittedOutcomeRef.current = pairFlip.state;
    workspace.finishRun();

    const formData = new FormData();
    formData.set("intent", pairFlip.state === "failed" ? "fail" : resultIntent);
    formData.set("difficulty", workspace.difficulty);
    formData.set("primaryMetric", String(pairFlip.elapsedSeconds));
    formData.set("mistakeCount", String(pairFlip.mismatchCount));
    submit(formData, { method: "post" });
  }, [pairFlip.elapsedSeconds, pairFlip.mismatchCount, pairFlip.state, resultIntent, submit, workspace]);

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
            <span className="status-badge status-badge-neutral">Left {formatDuration(timeLeftSeconds)}</span>
            <span className="status-badge status-badge-neutral">
              Matched {pairFlip.matchedPairCount}/{pairFlip.totalPairs}
            </span>
            <span className="status-badge status-badge-neutral">Pairs left {pairFlip.remainingPairs}</span>
            <span className="status-badge status-badge-neutral">Mismatches {pairFlip.mismatchCount}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], sharedStyles["board-card-minimal"], styles["pair-flip-board-card"]].join(" ")} aria-label="Pair Flip board">
        <div className={[styles["pair-flip-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <div className={styles["pair-flip-panel"]}>
            <div className={styles["pair-flip-legend"]}>
              <div className={styles["pair-flip-target-copy"]}>
                <p className="eyebrow">Memory board</p>
                <strong>Match every pair</strong>
              </div>
              <p className="compact-copy">Open two cards at a time. Mismatched cards flip back after a short reveal.</p>
            </div>
            <div
              className={styles["pair-flip-grid"]}
              style={{ gridTemplateColumns: `repeat(${pairFlip.columns}, minmax(0, 1fr))` }}
            >
              {pairFlip.board.flatMap((row, rowIndex) =>
                row.map((card, columnIndex) => (
                  <button
                    aria-label={`Card ${rowIndex + 1}-${columnIndex + 1}`}
                    className={[
                      styles["pair-flip-card"],
                      card.isOpen ? styles["pair-flip-card-open"] : "",
                      card.isMatched ? styles["pair-flip-card-matched"] : "",
                    ].filter(Boolean).join(" ")}
                    key={card.id}
                    onClick={() => pairFlip.tapCard(rowIndex, columnIndex)}
                    type="button"
                  >
                    <span className={styles["pair-flip-card-face"]}>
                      {card.isOpen || card.isMatched ? card.symbol : ""}
                    </span>
                  </button>
                )),
              )}
            </div>
          </div>
          <GameWorkspaceBoardOverlay
            actionLabel={startActionLabel}
            detail="Start the board, then flip pairs and remember their positions before the timer expires."
            isVisible={isRunIdle}
            onAction={() => {
              workspace.beginRun();
              pairFlip.beginRun();
            }}
            title="Board ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard
        detail={
          isRunCleared
            ? "The clear time and mismatch count were captured. The Result screen opens automatically."
            : isRunFailed
              ? "The timer expired before every pair was matched."
              : "Two open cards lock the board briefly. Memorize each reveal so you can finish with fewer mismatches."
        }
        emphasis={saveStatusLabel}
      />
    </>
  );
}
