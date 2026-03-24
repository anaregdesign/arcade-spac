import { useEffect, useMemo, useState } from "react";

import { playRunClear, playRunFail, playRunStart, playTapCorrect, playTapWrong } from "../../../infrastructure/browser/sound-effects";
import type { SupportedArcadeLocale } from "../../../../domain/entities/locale";
import { formatDuration } from "../display";
import { useShuffledQuizChoices } from "../use-shuffled-quiz-choices";
import { useTerminalResultSubmission } from "../use-terminal-result-submission";
import { useWorkspacePlayingSync } from "../use-workspace-playing-sync";
import type { GameWorkspaceController } from "../use-game-workspace";
import {
  getMcpPrimerContent,
  mcpPrimerQuestionCount,
  mcpPrimerStudyPageCount,
  mcpPrimerTimeLimitByDifficulty,
} from "./content";
import { getMcpPrimerUiCopy } from "./copy";

type PrimerState = "cleared" | "failed" | "idle" | "quiz" | "study";

type ReviewState = {
  correct: boolean;
};

function areSelectionsCorrect(expectedKeys: string[], selectedKeys: string[]) {
  if (expectedKeys.length !== selectedKeys.length) {
    return false;
  }

  return expectedKeys.every((key) => selectedKeys.includes(key));
}

export function useMcpPrimerWorkspace(workspace: GameWorkspaceController, locale: SupportedArcadeLocale) {
  const [state, setState] = useState<PrimerState>("idle");
  const [studyPageIndex, setStudyPageIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedChoiceKeys, setSelectedChoiceKeys] = useState<string[]>([]);
  const [reviewState, setReviewState] = useState<ReviewState | null>(null);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [runInstance, setRunInstance] = useState(0);

  const content = useMemo(() => getMcpPrimerContent(locale), [locale]);
  const copy = useMemo(() => getMcpPrimerUiCopy(locale), [locale]);
  const timeLimitSeconds = mcpPrimerTimeLimitByDifficulty[workspace.difficulty];
  const isRunIdle = state === "idle";
  const isStudyPhase = state === "study";
  const isQuizPhase = state === "quiz";
  const isRunCleared = state === "cleared";
  const isRunFailed = state === "failed";
  const isLiveRun = isStudyPhase || isQuizPhase;
  const currentStudyPage = content.studyPages[studyPageIndex] ?? content.studyPages[0];
  const currentQuestion = content.questions[questionIndex] ?? content.questions[0];
  const currentQuestionChoices = useShuffledQuizChoices(
    currentQuestion.choices,
    `${locale}:${runInstance}:${currentQuestion.key}`,
  );

  const correctChoiceKeys = useMemo(
    () => currentQuestion.choices.filter((choice) => choice.isCorrect).map((choice) => choice.key),
    [currentQuestion],
  );

  const outcome = isRunCleared ? "cleared" : isRunFailed ? "failed" : null;
  const submitter = useTerminalResultSubmission({
    outcome,
    submission: outcome
      ? {
          difficulty: workspace.difficulty,
          intent: outcome === "failed" ? "fail" : mistakeCount === 0 ? "completeClean" : "completeSteady",
          mistakeCount,
          primaryMetric: Math.max(1, elapsedSeconds),
        }
      : null,
    workspace,
  });

  useWorkspacePlayingSync(isLiveRun, workspace);

  useEffect(() => {
    if (!isLiveRun) {
      return;
    }

    const timerId = window.setInterval(() => {
      setElapsedSeconds((current) => {
        const nextValue = current + 1;

        if (nextValue >= timeLimitSeconds) {
          window.clearInterval(timerId);
          setState("failed");
          return timeLimitSeconds;
        }

        return nextValue;
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isLiveRun, timeLimitSeconds]);

  useEffect(() => {
    if (isRunCleared) {
      playRunClear();
    } else if (isRunFailed) {
      playRunFail();
    }
  }, [isRunCleared, isRunFailed]);

  function beginRun() {
    playRunStart();
    workspace.beginRun();
    setElapsedSeconds(0);
    setMistakeCount(0);
    setStudyPageIndex(0);
    setQuestionIndex(0);
    setSelectedChoiceKeys([]);
    setReviewState(null);
    setRunInstance((current) => current + 1);
    setState("study");
  }

  function goToPreviousStudyPage() {
    setStudyPageIndex((current) => Math.max(0, current - 1));
  }

  function goToNextStudyStep() {
    if (studyPageIndex < mcpPrimerStudyPageCount - 1) {
      setStudyPageIndex((current) => Math.min(mcpPrimerStudyPageCount - 1, current + 1));
      return;
    }

    setSelectedChoiceKeys([]);
    setReviewState(null);
    setQuestionIndex(0);
    setState("quiz");
  }

  function toggleChoice(choiceKey: string) {
    if (!isQuizPhase || reviewState) {
      return;
    }

    if (currentQuestion.selectionMode === "single") {
      setSelectedChoiceKeys([choiceKey]);
      return;
    }

    setSelectedChoiceKeys((current) =>
      current.includes(choiceKey) ? current.filter((value) => value !== choiceKey) : [...current, choiceKey],
    );
  }

  function submitCurrentAnswer() {
    if (!isQuizPhase || reviewState || selectedChoiceKeys.length === 0) {
      return;
    }

    const correct = areSelectionsCorrect(correctChoiceKeys, selectedChoiceKeys);

    setReviewState({ correct });

    if (correct) {
      playTapCorrect();
      return;
    }

    playTapWrong();
    setMistakeCount((current) => current + 1);
  }

  function advanceAfterReview() {
    if (!reviewState) {
      return;
    }

    if (questionIndex === mcpPrimerQuestionCount - 1) {
      setState("cleared");
      return;
    }

    setQuestionIndex((current) => current + 1);
    setSelectedChoiceKeys([]);
    setReviewState(null);
  }

  const runStatusLabel = isRunCleared
    ? copy.runStatusCleared
    : isRunFailed
      ? copy.runStatusTimedOut
      : isQuizPhase
        ? copy.runStatusQuiz
        : isStudyPhase
          ? copy.runStatusStudy
          : copy.runStatusPreview;

  const finishDetail = isRunCleared
    ? copy.finishDetailCleared
    : isRunFailed
      ? copy.finishDetailFailed
      : isStudyPhase
        ? copy.finishDetailStudy
        : copy.finishDetailQuiz;

  return {
    advanceAfterReview,
    beginRun,
    canMoveBackward: studyPageIndex > 0,
    canSubmitAnswer: isQuizPhase && selectedChoiceKeys.length > 0 && !reviewState,
    currentQuestion,
    currentQuestionChoices,
    currentStudyPage,
    elapsedSecondsLabel: formatDuration(elapsedSeconds),
    finishDetail,
    goToNextStudyStep,
    goToPreviousStudyPage,
    isLiveRun,
    isQuizPhase,
    isRunCleared,
    isRunFailed,
    isRunIdle,
    isStudyPhase,
    mistakeCount,
    questionCount: mcpPrimerQuestionCount,
    questionIndex,
    reviewState,
    reviewSummary: reviewState
      ? reviewState.correct
        ? copy.reviewSummaryCorrect
        : copy.reviewSummaryIncorrect(currentQuestion.explanation)
      : null,
    runStatusLabel,
    saveStatusLabel: submitter.isSubmitting
      ? copy.openingResultLabel
      : isRunCleared || isRunFailed
        ? copy.openingResultLabel
        : reviewState
          ? copy.reviewContinueLabel
          : isStudyPhase
            ? copy.nextPageLabel
            : copy.checkAnswerLabel,
    selectedChoiceKeys,
    startActionLabel: isRunIdle ? copy.startLessonLabel : isRunCleared || isRunFailed ? copy.startAnotherRunLabel : copy.reviewContinueLabel,
    studyPageCount: mcpPrimerStudyPageCount,
    studyPageIndex,
    submitCurrentAnswer,
    timeLeftLabel: formatDuration(Math.max(0, timeLimitSeconds - elapsedSeconds)),
    toggleChoice,
    uiCopy: copy,
  };
}