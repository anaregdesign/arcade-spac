import { useEffect, useRef } from "react";
import { useNavigation, useSubmit } from "react-router";

import { usePatternEchoSession } from "../../../lib/client/usecase/game-workspace/use-pattern-echo-session";
import { playPadFlash, playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../../lib/client/sound-effects";
import sharedStyles from "../shared/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../shared/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../shared/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../shared/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../shared/game-instructions-dialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";
import styles from "./pattern-echo-game-workspace.module.css";

function formatDuration(totalSeconds: number) {
  return `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, "0")}`;
}

export function PatternEchoGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const navigation = useNavigation();
  const submit = useSubmit();
  const submittedOutcomeRef = useRef<"cleared" | "failed" | null>(null);
  const patternEcho = usePatternEchoSession(workspace.difficulty);
  const isRunIdle = patternEcho.state === "idle";
  const isWatching = patternEcho.state === "watching";
  const isInputting = patternEcho.state === "inputting";
  const isLiveRun = isWatching || isInputting;
  const isRunCleared = patternEcho.state === "cleared";
  const isRunFailed = patternEcho.state === "failed";
  const resultIntent = patternEcho.wrongInputCount === 0 ? "completeClean" : "completeSteady";
  const runStatusLabel = isRunCleared ? "Cleared" : isRunFailed ? "Timed out" : isWatching ? "Watching" : isInputting ? "Live" : "Ready";
  const startActionLabel = isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Start another board" : "Start run";
  const timeLeftSeconds = Math.max(0, patternEcho.timeLimitSeconds - patternEcho.elapsedSeconds);
  const saveStatusLabel = navigation.state === "submitting"
    ? "Opening result"
    : isRunCleared || isRunFailed
      ? "Opening result"
      : isWatching
        ? "Watch the sequence"
        : "Repeat the sequence";

  useEffect(() => {
    workspace.setPlaying(isLiveRun);
  }, [isLiveRun, workspace]);

  useEffect(() => {
    if (patternEcho.flashingPadIndex === null) {
      return;
    }

    const pad = patternEcho.pads[patternEcho.flashingPadIndex];

    if (pad) {
      playPadFlash(pad.color);
    }
  }, [patternEcho.flashingPadIndex, patternEcho.pads]);

  const prevInputStepRef = useRef(patternEcho.inputStep);
  const prevWrongInputCountRef = useRef(patternEcho.wrongInputCount);

  useEffect(() => {
    if (patternEcho.state !== "inputting") {
      prevInputStepRef.current = patternEcho.inputStep;
      prevWrongInputCountRef.current = patternEcho.wrongInputCount;
      return;
    }

    if (patternEcho.inputStep > prevInputStepRef.current) {
      playTapCorrect();
    } else if (patternEcho.wrongInputCount > prevWrongInputCountRef.current) {
      playTapWrong();
    }

    prevInputStepRef.current = patternEcho.inputStep;
    prevWrongInputCountRef.current = patternEcho.wrongInputCount;
  }, [patternEcho.inputStep, patternEcho.state, patternEcho.wrongInputCount]);

  useEffect(() => {
    if (patternEcho.state === "cleared") {
      playRunClear();
    } else if (patternEcho.state === "failed") {
      playRunFail();
    }
  }, [patternEcho.state]);

  useEffect(() => {
    if (patternEcho.state !== "cleared" && patternEcho.state !== "failed") {
      submittedOutcomeRef.current = null;
      return;
    }

    if (submittedOutcomeRef.current === patternEcho.state) {
      return;
    }

    submittedOutcomeRef.current = patternEcho.state;
    workspace.finishRun();

    const formData = new FormData();
    formData.set("intent", patternEcho.state === "failed" ? "fail" : resultIntent);
    formData.set("difficulty", workspace.difficulty);
    formData.set("primaryMetric", String(patternEcho.elapsedSeconds));
    formData.set("mistakeCount", String(patternEcho.wrongInputCount));
    submit(formData, { method: "post" });
  }, [patternEcho.elapsedSeconds, patternEcho.state, patternEcho.wrongInputCount, resultIntent, submit, workspace]);

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
              Step {isInputting ? patternEcho.inputStep + 1 : isWatching ? "—" : isRunCleared ? patternEcho.sequenceLength : "—"}/{patternEcho.sequenceLength}
            </span>
            <span className="status-badge status-badge-neutral">Wrong inputs {patternEcho.wrongInputCount}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], sharedStyles["board-card-minimal"], styles["pattern-echo-board-card"]].join(" ")} aria-label="Pattern Echo board">
        <div className={[styles["pattern-echo-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <div className={styles["pattern-echo-panel"]}>
            <div className={styles["pattern-echo-legend"]}>
              <div className={styles["pattern-echo-target-copy"]}>
                <p className="eyebrow">{isWatching ? "Watch" : isInputting ? "Repeat" : "Pattern Echo"}</p>
                <strong>{isWatching ? "Memorise the sequence" : isInputting ? "Tap in the same order" : "Watch, then repeat"}</strong>
              </div>
              <p className="compact-copy">
                {isWatching
                  ? "Each pad will flash once. Remember the order before your turn begins."
                  : isInputting
                    ? "Tap each pad in the exact order you saw. Wrong taps count but don't stop the run."
                    : "Watch all pads light up in sequence, then reproduce the same order."}
              </p>
            </div>
            <div
              className={styles["pattern-echo-grid"]}
              style={{ gridTemplateColumns: `repeat(${patternEcho.columns}, minmax(0, 1fr))` }}
            >
              {patternEcho.pads.map((pad) => {
                const isFlashing = patternEcho.flashingPadIndex === pad.index;
                const isActive = isInputting;

                return (
                  <button
                    aria-label={`Pad ${pad.index + 1}`}
                    className={[
                      styles["pattern-echo-pad"],
                      styles[`pattern-echo-pad-${pad.color}`],
                      isFlashing ? styles["pattern-echo-pad-flash"] : "",
                      !isActive && !isFlashing ? styles["pattern-echo-pad-dim"] : "",
                    ].filter(Boolean).join(" ")}
                    disabled={!isActive}
                    key={pad.index}
                    onClick={() => patternEcho.tapPad(pad.index)}
                    type="button"
                  />
                );
              })}
            </div>
          </div>
          <GameWorkspaceBoardOverlay
            actionLabel={startActionLabel}
            detail="Start the board, then watch the sequence and reproduce it before time runs out."
            isVisible={isRunIdle}
            onAction={() => {
              playRunStart();
              workspace.beginRun();
              patternEcho.beginRun();
            }}
            title="Board ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard
        detail={
          isRunCleared
            ? "The clear time and wrong input count were captured. The Result screen opens automatically."
            : isRunFailed
              ? "The timer expired before the sequence was completed."
              : isWatching
                ? "Watch every pad carefully — your input turn starts as soon as the last one fades."
                : "Tap each pad in the order it lit up. Wrong taps are counted but the run keeps going."
        }
        emphasis={saveStatusLabel}
      />
    </>
  );
}
