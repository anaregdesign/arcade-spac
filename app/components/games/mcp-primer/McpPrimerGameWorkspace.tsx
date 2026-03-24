import { useMemo } from "react";

import { useMcpPrimerWorkspace } from "../../../lib/client/usecase/game-workspace/mcp-primer/use-mcp-primer-workspace";
import { useAppLocale } from "../../../lib/client/usecase/locale/use-app-locale";
import { GameplayQuizLayout } from "../../gameplay/layouts/GameplayQuizLayout";
import { GameplayStudyLayout } from "../../gameplay/layouts/GameplayStudyLayout";
import sharedStyles from "../../gameplay/workspace/GameWorkspaceShared.module.css";
import { GameWorkspaceControlsCard } from "../../gameplay/workspace/GameWorkspaceControlsCard";
import { GameWorkspaceFinishCard } from "../../gameplay/workspace/GameWorkspaceFinishCard";
import { GameInstructionsDialog } from "../../gameplay/workspace/GameInstructionsDialog";
import type { GameWorkspaceComponentProps } from "../../gameplay/workspace/game-workspace-types";
import styles from "./McpPrimerGameWorkspace.module.css";

export function McpPrimerGameWorkspace({ instructions, workspace }: GameWorkspaceComponentProps) {
  const { locale } = useAppLocale();
  const screen = useMcpPrimerWorkspace(workspace, locale);
  const copy = screen.uiCopy;
  const progressStatusLabel = screen.isRunIdle
    ? copy.progressPage(1, screen.studyPageCount)
    : screen.isStudyPhase
      ? copy.progressPage(screen.studyPageIndex + 1, screen.studyPageCount)
      : screen.isQuizPhase
        ? copy.progressQuestion(screen.questionIndex + 1, screen.questionCount)
        : screen.isRunCleared
          ? copy.progressCompleted(screen.questionCount)
          : copy.progressTimedOut(screen.timeLeftLabel);

  const questionChoices = useMemo(
    () =>
      screen.currentQuestionChoices.map((choice) => {
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
    [screen.currentQuestionChoices, screen.reviewState, screen.selectedChoiceKeys, screen.toggleChoice],
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
            <span className="status-badge status-badge-neutral">{copy.mistakesLabel(screen.mistakeCount)}</span>
            <span className="status-badge status-badge-neutral">{copy.timeLeftLabel(screen.timeLeftLabel)}</span>
          </>
        )}
      />

      <section className={["feature-card", sharedStyles["workspace-card"], sharedStyles["board-card"], styles["primer-board-card"]].join(" ")} aria-label={copy.boardAriaLabel}>
        <div className={[styles["primer-shell"], sharedStyles["game-board-overlay-shell"]].join(" ")}>
          {screen.isRunIdle ? (
            <GameplayStudyLayout
              actions={(
                <button className="action-link action-link-primary" onClick={screen.beginRun} type="button">
                  {copy.startLessonLabel}
                </button>
              )}
              body={screen.currentStudyPage.body}
              detail={copy.lessonPreviewDetail}
              footer={copy.lessonPreviewFooter}
              phase={copy.lessonPreviewPhase}
              progressLabel={copy.readyProgressLabel(screen.studyPageCount, screen.questionCount)}
              sources={screen.currentStudyPage.sources}
              title={copy.lessonPreviewTitle}
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
                    {copy.backLabel}
                  </button>
                  <button className="action-link action-link-primary" onClick={screen.goToNextStudyStep} type="button">
                    {screen.isLastStudyPageInSection ? copy.startQuizLabel : copy.nextPageLabel}
                  </button>
                </>
              )}
              body={screen.currentStudyPage.body}
              detail={screen.currentStudyPage.detail}
              footer={copy.studyFooter}
              phase={copy.studyPhase(screen.studyPageIndex + 1)}
              progressLabel={copy.studyProgress(screen.studyPageIndex + 1, screen.studyPageCount)}
              sources={screen.currentStudyPage.sources}
              title={screen.currentStudyPage.title}
              tone="review"
            />
          ) : null}

          {screen.isQuizPhase ? (
            <GameplayQuizLayout
              choices={questionChoices}
              detail={copy.quizDetail}
              footer={screen.reviewState ? screen.reviewSummary : copy.quizFooter(screen.questionIndex + 1, screen.questionCount)}
              helperText={
                screen.reviewState
                  ? screen.reviewState.correct
                    ? copy.helperCorrect
                    : copy.helperIncorrect
                  : undefined
              }
              phase={copy.quizPhase(screen.questionIndex + 1)}
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
                      ? copy.finishRunLabel
                      : copy.nextQuestionLabel
                    : copy.checkAnswerLabel}
                </button>
              )}
              title={copy.quizTitle}
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