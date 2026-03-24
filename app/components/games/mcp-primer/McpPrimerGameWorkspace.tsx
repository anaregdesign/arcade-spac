import { useMemo } from "react";

import { useMcpPrimerWorkspace } from "../../../lib/client/usecase/game-workspace/mcp-primer/use-mcp-primer-workspace";
import { GameplayQuizLayout } from "../../gameplay/layouts/GameplayQuizLayout";
import { GameplayStudyLayout } from "../../gameplay/layouts/GameplayStudyLayout";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./McpPrimerGameWorkspace.module.css";

export function McpPrimerGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const screen = useMcpPrimerWorkspace(workspace);
  const progressStatusLabel = screen.isRunIdle
    ? `Page 1/${screen.studyPageCount}`
    : screen.isStudyPhase
      ? `Page ${screen.studyPageIndex + 1}/${screen.studyPageCount}`
      : screen.isQuizPhase
        ? `Question ${screen.questionIndex + 1}/${screen.questionCount}`
        : screen.isRunCleared
          ? `Completed ${screen.questionCount}/${screen.questionCount}`
          : `Timed out at ${screen.timeLeftLabel}`;

  const questionChoices = useMemo(
    () =>
      screen.currentQuestion.choices.map((choice) => {
        const isSelected = screen.selectedChoiceKeys.includes(choice.key);
        const tone = screen.reviewState
          ? choice.isCorrect
            ? "correct"
            : isSelected
              ? "incorrect"
              : "default"
          : "default";

        return {
          content: choice.content,
          disabled: Boolean(screen.reviewState),
          key: choice.key,
          label: choice.label,
          onSelect: () => screen.toggleChoice(choice.key),
          selected: screen.reviewState ? choice.isCorrect || isSelected : isSelected,
          tone,
        } as const;
      }),
    [screen.currentQuestion, screen.reviewState, screen.selectedChoiceKeys, screen.toggleChoice],
  );

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
            <span className="status-badge status-badge-neutral">{progressStatusLabel}</span>
            <span className="status-badge status-badge-neutral">Mistakes {screen.mistakeCount}</span>
            <span className="status-badge status-badge-neutral">Left {screen.timeLeftLabel}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["primer-board-card"]].join(" ")} aria-label="MCP Primer board">
        <div className={[styles["primer-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          {screen.isRunIdle ? (
            <GameplayStudyLayout
              actions={(
                <button className="action-link action-link-primary" onClick={screen.beginRun} type="button">
                  Start lesson
                </button>
              )}
              body={screen.currentStudyPage.body}
              detail="Preview the lesson structure before the timer starts."
              footer="You will review four study pages before the timed quiz begins."
              phase="Lesson preview"
              progressLabel={`${screen.studyPageCount} study pages, ${screen.questionCount} questions`}
              sources={screen.currentStudyPage.sources}
              title="MCP primer ready"
              tone="review"
            />
          ) : null}

          {screen.isStudyPhase ? (
            <GameplayStudyLayout
              actions={(
                <>
                  <button
                    className="action-link action-link-secondary"
                    disabled={!screen.canMoveBackward}
                    onClick={screen.goToPreviousStudyPage}
                    type="button"
                  >
                    Back
                  </button>
                  <button className="action-link action-link-primary" onClick={screen.goToNextStudyStep} type="button">
                    {screen.studyPageIndex === screen.studyPageCount - 1 ? "Start quiz" : "Next page"}
                  </button>
                </>
              )}
              body={screen.currentStudyPage.body}
              detail={screen.currentStudyPage.detail}
              footer="Read the study notes before moving to the quiz."
              phase={`Study ${screen.studyPageIndex + 1}`}
              progressLabel={`Page ${screen.studyPageIndex + 1} of ${screen.studyPageCount}`}
              sources={screen.currentStudyPage.sources}
              title={screen.currentStudyPage.title}
              tone="review"
            />
          ) : null}

          {screen.isQuizPhase ? (
            <GameplayQuizLayout
              choices={questionChoices}
              detail="Answer the current question from the study material you just reviewed."
              footer={screen.reviewState ? screen.reviewSummary : `Question ${screen.questionIndex + 1} of ${screen.questionCount}`}
              helperText={
                screen.reviewState
                  ? screen.reviewState.correct
                    ? "Correct answer confirmed."
                    : "Correct answers stay highlighted before you continue."
                  : undefined
              }
              phase={`Question ${screen.questionIndex + 1}`}
              prompt={screen.currentQuestion.prompt}
              selectionMode={screen.currentQuestion.selectionMode}
              sources={screen.currentQuestion.sources}
              submitAction={(
                <button
                  className="action-link action-link-primary"
                  disabled={screen.reviewState ? false : !screen.canSubmitAnswer}
                  onClick={screen.reviewState ? screen.advanceAfterReview : screen.submitCurrentAnswer}
                  type="button"
                >
                  {screen.reviewState
                    ? screen.questionIndex === screen.questionCount - 1
                      ? "Finish run"
                      : "Next question"
                    : "Check answer"}
                </button>
              )}
              title="MCP comprehension check"
              tone="logic"
            />
          ) : null}
        </div>
      </section>

      {screen.isRunCleared || screen.isRunFailed ? (
        <GameWorkspaceFinishCard detail={screen.finishDetail} emphasis={screen.saveStatusLabel} />
      ) : null}
    </>
  );
}