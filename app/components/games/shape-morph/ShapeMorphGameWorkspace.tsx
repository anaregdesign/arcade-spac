import { useShapeMorphWorkspace } from "../../../lib/client/usecase/game-workspace/use-shape-morph-workspace";
import type { Glyph } from "../../../lib/client/usecase/game-workspace/use-shape-morph-session";
import { GameplayContextCue } from "../../gameplay/GameplayContextCue";
import { GameplayChoiceGrid } from "../../gameplay/layouts/GameplayChoiceGrid";
import { GameplaySequenceStageLayout } from "../../gameplay/layouts/GameplaySequenceStageLayout";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceBoardOverlay } from "../../gameplay/workspace/GameWorkspaceBoardOverlay";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./ShapeMorphGameWorkspace.module.css";

function renderShapePath(shape: Glyph["shape"]) {
  if (shape === "triangle") {
    return <polygon fill="currentColor" points="50,14 84,78 16,78" />;
  }

  if (shape === "diamond") {
    return <polygon fill="currentColor" points="50,10 86,50 50,90 14,50" />;
  }

  if (shape === "hex") {
    return <polygon fill="currentColor" points="28,16 72,16 90,50 72,84 28,84 10,50" />;
  }

  return <rect fill="currentColor" height="64" rx="18" width="64" x="18" y="18" />;
}

function glyphScale(scaleStep: number) {
  return 0.72 + scaleStep * 0.1;
}

function ShapeMorphGlyph({ glyph }: { glyph: Glyph }) {
  const rotation = glyph.rotationQuarter * 90;
  const scale = glyphScale(glyph.scaleStep);
  const notchPositions = [24, 50, 76, 34, 66];

  return (
    <svg aria-hidden="true" className={styles["shape-morph-glyph"]} viewBox="0 0 100 100">
      <defs>
        <radialGradient cx="34%" cy="28%" id={`shape-morph-grad-${glyph.shape}-${glyph.color.replace("#", "")}`} r="70%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.88)" />
          <stop offset="34%" stopColor={glyph.color} />
          <stop offset="100%" stopColor="rgba(15,23,42,0.94)" />
        </radialGradient>
      </defs>
      <g transform={`translate(50 50) rotate(${rotation}) scale(${scale}) translate(-50 -50)`}>
        <g style={{ color: glyph.color }}>
          {renderShapePath(glyph.shape)}
        </g>
        <g fill="#ffffff" opacity="0.82">
          {Array.from({ length: glyph.notches }, (_, index) => (
            <circle cx={notchPositions[index] ?? 50} cy="15" key={`notch-${glyph.shape}-${index}`} r="4" />
          ))}
        </g>
        <circle cx="38" cy="34" fill="rgba(255,255,255,0.38)" r="8" />
      </g>
    </svg>
  );
}

export function ShapeMorphGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useShapeMorphWorkspace(workspace);

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
            <span className="status-badge status-badge-neutral">Prompt {screen.shapeMorph.currentProblemIndex + 1}/{screen.shapeMorph.problemCount}</span>
            <span className="status-badge status-badge-neutral">Wrong answers {screen.shapeMorph.wrongAnswerCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["shape-morph-board-card"]].join(" ")} aria-label="Shape Morph board">
        <div className={[styles["shape-morph-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          <GameplaySequenceStageLayout className={styles["shape-morph-stage"]}>
            <GameplayContextCue
              phase="Read"
              title={screen.shapeMorph.currentProblem.promptLabel}
              tone="logic"
            />
            <div className={styles["shape-morph-sequence"]}>
              {screen.shapeMorph.currentProblem.promptGlyphs.map((glyph, index) => (
                <div className={styles["shape-morph-sequence-card"]} key={`prompt-glyph-${index}`}>
                  <span className={styles["shape-morph-label"]}>Step {index + 1}</span>
                  <ShapeMorphGlyph glyph={glyph} />
                </div>
              ))}
              <div className={styles["shape-morph-sequence-card"]}>
                <span className={styles["shape-morph-label"]}>Next</span>
                <div className={styles["shape-morph-missing"]}>?</div>
              </div>
            </div>
            <GameplayChoiceGrid className={styles["shape-morph-choice-grid"]}>
              {screen.shapeMorph.currentProblem.choices.map((choice, index) => (
                <button
                  className={styles["shape-morph-choice"]}
                  disabled={!screen.isLiveRun}
                  key={`shape-morph-choice-${index}`}
                  onClick={() => screen.handleAnswer(choice)}
                  type="button"
                >
                  <ShapeMorphGlyph glyph={choice} />
                  <span className={styles["shape-morph-choice-copy"]}>Choice {index + 1}</span>
                </button>
              ))}
            </GameplayChoiceGrid>
          </GameplaySequenceStageLayout>
          <GameWorkspaceBoardOverlay
            actionLabel={screen.startActionLabel}
            detail="Track how the glyph changes from step to step, then choose the next transformed shape before the timer expires."
            isVisible={screen.isRunIdle}
            onAction={screen.handleStartRun}
            title="Morph sprint ready"
          />
        </div>
      </section>

      <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
    </>
  );
}
