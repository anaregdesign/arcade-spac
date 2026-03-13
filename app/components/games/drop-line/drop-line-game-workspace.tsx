import { useEffect, useRef } from "react";
import { Link, useNavigation, useSubmit } from "react-router";

import type { GameDifficulty } from "../../../lib/client/usecase/game-workspace/use-game-workspace";
import { useDropLineSession } from "../../../lib/client/usecase/game-workspace/use-drop-line-session";
import { GameInstructionsDialog } from "../shared/game-instructions-dialog";
import type { GameWorkspaceComponentProps } from "../shared/game-workspace-types";

function formatElapsedMs(elapsedMs: number) {
  return `${(elapsedMs / 1000).toFixed(2)}s`;
}

export function DropLineGameWorkspace({ alternateGames, instructions, workspace }: GameWorkspaceComponentProps) {
  const navigation = useNavigation();
  const submit = useSubmit();
  const submittedOutcomeRef = useRef<"cleared" | "failed" | null>(null);
  const dropLine = useDropLineSession(workspace.difficulty);
  const isLiveRun = dropLine.state === "playing";
  const isRunCleared = dropLine.state === "cleared";
  const isRunFailed = dropLine.state === "failed";
  const resolvedOffsetPx = dropLine.resolvedOffsetPx ?? dropLine.currentOffsetPx;
  const resultIntent = resolvedOffsetPx <= 6 ? "completeClean" : "completeSteady";
  const runStatusLabel = isRunCleared ? "Hit" : isRunFailed ? "Missed" : isLiveRun ? "Live" : "Ready";
  const startActionLabel = isLiveRun ? "Running" : isRunCleared || isRunFailed ? "Drop again" : "Start run";
  const saveStatusLabel = navigation.state === "submitting"
    ? "Opening result"
    : isRunCleared || isRunFailed
      ? "Opening result"
      : isLiveRun
        ? "Tap on overlap"
        : "Start run to arm the lane";
  const lanePrompt = isLiveRun
    ? "Tap anywhere in the lane when the ball overlaps the line."
    : isRunCleared
      ? "Hit recorded. The Result screen opens automatically."
      : isRunFailed
        ? "The ball passed the line before the hit landed."
        : "Press Start run, then tap when the ball overlaps the line.";

  useEffect(() => {
    workspace.setPlaying(dropLine.state === "playing");
  }, [dropLine.state, workspace]);

  useEffect(() => {
    if (dropLine.state !== "cleared" && dropLine.state !== "failed") {
      submittedOutcomeRef.current = null;
      return;
    }

    if (submittedOutcomeRef.current === dropLine.state) {
      return;
    }

    submittedOutcomeRef.current = dropLine.state;
    workspace.finishRun();

    const formData = new FormData();
    formData.set("intent", dropLine.state === "failed" ? "fail" : resultIntent);
    formData.set("difficulty", workspace.difficulty);
    formData.set("primaryMetric", String(resolvedOffsetPx));
    submit(formData, { method: "post" });
  }, [dropLine.state, resolvedOffsetPx, resultIntent, submit, workspace]);

  return (
    <>
      <section className="feature-card workspace-card workspace-controls-card">
        <div className="workspace-toolbar workspace-toolbar-minimal">
          <label className="field-block workspace-toolbar-field">
            <span className="field-label">Difficulty</span>
            <select
              className="field-select"
              value={workspace.difficulty}
              disabled={isLiveRun}
              onChange={(event) => workspace.changeDifficulty(event.currentTarget.value as GameDifficulty)}
            >
              <option value="EASY">Easy</option>
              <option value="NORMAL">Normal</option>
              <option value="HARD">Hard</option>
              <option value="EXPERT">Expert</option>
            </select>
          </label>
          <div className="workspace-chip-row" aria-label="Run status">
            <span className="status-badge status-badge-neutral">{runStatusLabel}</span>
            <span className="status-badge status-badge-neutral">Offset {resolvedOffsetPx} px</span>
            <span className="status-badge status-badge-neutral">Elapsed {formatElapsedMs(dropLine.elapsedMs)}</span>
            <span className="status-badge status-badge-neutral">Speed {dropLine.speedPxPerSecond} px/s</span>
          </div>
          <div className="hero-actions compact-actions workspace-primary-actions">
            <button
              className="action-link action-link-primary"
              type="button"
              onClick={() => {
                workspace.beginRun();
                dropLine.beginRun();
              }}
            >
              {startActionLabel}
            </button>
            <GameInstructionsDialog instructions={instructions} />
            {isLiveRun ? (
              <button className="action-link action-link-secondary" type="button" onClick={() => workspace.openLeaveConfirm("home")}>
                Go home
              </button>
            ) : (
              <Link className="action-link action-link-secondary" to="/home">
                Go home
              </Link>
            )}
            {alternateGames.map((game) =>
              isLiveRun
                ? (
                  <button className="action-link action-link-secondary" key={game.key} type="button" onClick={() => workspace.openLeaveConfirm(game.href)}>
                    {game.label}
                  </button>
                )
                : (
                  <Link className="action-link action-link-secondary" key={game.key} to={game.href}>
                    {game.label}
                  </Link>
                ),
            )}
          </div>
        </div>
      </section>

      <section className="feature-card workspace-card board-card board-card-minimal" aria-label="Drop Line lane">
        <div className="drop-line-shell">
          <button
            aria-label={isLiveRun ? "Tap when the ball overlaps the line" : "Drop Line play area"}
            className="drop-line-lane"
            disabled={!isLiveRun}
            onClick={() => dropLine.captureHit()}
            type="button"
          >
            <span aria-hidden="true" className="drop-line-grid" />
            <span
              aria-hidden="true"
              className="drop-line-target-line"
              style={{ top: `${(dropLine.lineCenterY / dropLine.laneHeight) * 100}%` }}
            />
            <span
              aria-hidden="true"
              className="drop-line-ball"
              style={{ top: `${(dropLine.ballCenterY / dropLine.laneHeight) * 100}%` }}
            />
            <span className="drop-line-lane-copy">{lanePrompt}</span>
          </button>
        </div>
      </section>

      <section className="feature-card workspace-card workspace-finish-card">
        <div className="workspace-finish-row">
          <div className="workspace-finish-copy">
            <strong>{saveStatusLabel}</strong>
            <span>
              {isRunCleared
                ? "A smaller offset scores better and opens the Result screen automatically."
                : isRunFailed
                  ? "Missed runs are recorded for history and open the Result screen automatically."
                  : "Tap once when the ball overlaps the line. If the ball drops past the lane, the run is recorded as missed."}
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
