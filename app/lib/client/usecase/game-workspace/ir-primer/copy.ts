import type { SupportedArcadeLocale } from "../../../../domain/entities/locale";

type IrPrimerUiCopy = {
  backLabel: string;
  boardAriaLabel: string;
  checkAnswerLabel: string;
  finishDetailCleared: string;
  finishDetailFailed: string;
  finishDetailQuiz: string;
  finishDetailStudy: string;
  finishRunLabel: string;
  helperCorrect: string;
  helperIncorrect: string;
  lessonPreviewDetail: string;
  lessonPreviewFooter: string;
  lessonPreviewPhase: string;
  lessonPreviewTitle: string;
  mistakesLabel: (count: number) => string;
  nextPageLabel: string;
  nextQuestionLabel: string;
  openingResultLabel: string;
  progressCompleted: (count: number) => string;
  progressPage: (current: number, total: number) => string;
  progressQuestion: (current: number, total: number) => string;
  progressTimedOut: (timeLabel: string) => string;
  quizDetail: string;
  quizFooter: (current: number, total: number) => string;
  quizPhase: (current: number) => string;
  quizTitle: string;
  readyProgressLabel: (studyPages: number, questionCount: number) => string;
  reviewContinueLabel: string;
  reviewSummaryCorrect: string;
  reviewSummaryIncorrect: (explanation: string) => string;
  runStatusCleared: string;
  runStatusPreview: string;
  runStatusQuiz: string;
  runStatusStudy: string;
  runStatusTimedOut: string;
  startAnotherRunLabel: string;
  startLessonLabel: string;
  startQuizLabel: string;
  studyFooter: string;
  studyPhase: (current: number) => string;
  studyProgress: (current: number, total: number) => string;
  timeLeftLabel: (timeLabel: string) => string;
};

const copyByLocale: Record<SupportedArcadeLocale, IrPrimerUiCopy> = {
  en: {
    backLabel: "Back",
    boardAriaLabel: "IR Primer board",
    checkAnswerLabel: "Check answer",
    finishDetailCleared: "All study pages and quiz questions were completed. The Result screen opens automatically.",
    finishDetailFailed: "The timer expired before the IR Primer run finished.",
    finishDetailQuiz: "Complete each section quiz to unlock the next study section. Mistakes are recorded, but the run continues.",
    finishDetailStudy: "Read the current section, then move into its quiz when you are ready.",
    finishRunLabel: "Finish run",
    helperCorrect: "Correct answer confirmed.",
    helperIncorrect: "Correct answers stay highlighted before you continue.",
    lessonPreviewDetail: "Preview the lesson structure before the timer starts.",
    lessonPreviewFooter: "Each topic section ends with a short quiz before the next section begins.",
    lessonPreviewPhase: "Lesson preview",
    lessonPreviewTitle: "IR primer ready",
    mistakesLabel: (count) => `Mistakes ${count}`,
    nextPageLabel: "Next page",
    nextQuestionLabel: "Next question",
    openingResultLabel: "Opening result",
    progressCompleted: (count) => `Completed ${count}/${count}`,
    progressPage: (current, total) => `Page ${current}/${total}`,
    progressQuestion: (current, total) => `Question ${current}/${total}`,
    progressTimedOut: (timeLabel) => `Timed out at ${timeLabel}`,
    quizDetail: "Answer the current question from the study section you just reviewed.",
    quizFooter: (current, total) => `Question ${current} of ${total}`,
    quizPhase: (current) => `Question ${current}`,
    quizTitle: "IR comprehension check",
    readyProgressLabel: (studyPages, questionCount) => `${studyPages} study pages, ${questionCount} questions`,
    reviewContinueLabel: "Review the answer and continue",
    reviewSummaryCorrect: "Correct. Move to the next question.",
    reviewSummaryIncorrect: (explanation) => `${explanation} Mistake recorded.`,
    runStatusCleared: "Cleared",
    runStatusPreview: "Preview",
    runStatusQuiz: "Quiz",
    runStatusStudy: "Study",
    runStatusTimedOut: "Timed out",
    startAnotherRunLabel: "Start another run",
    startLessonLabel: "Start lesson",
    startQuizLabel: "Start quiz",
    studyFooter: "Read the study notes for this section before moving to its quiz.",
    studyPhase: (current) => `Study ${current}`,
    studyProgress: (current, total) => `Page ${current} of ${total}`,
    timeLeftLabel: (timeLabel) => `Left ${timeLabel}`,
  },
  ja: {
    backLabel: "戻る",
    boardAriaLabel: "IR Primer ボード",
    checkAnswerLabel: "回答を確認",
    finishDetailCleared: "すべての学習ページとクイズ問題を完了しました。結果画面が自動で開きます。",
    finishDetailFailed: "IR Primer を完了する前にタイマーが終了しました。",
    finishDetailQuiz: "各 section のクイズを終えると次の学習 section へ進みます。ミスは記録されますが、プレイは継続します。",
    finishDetailStudy: "現在の section を読んだら、準備ができたタイミングでそのクイズへ進んでください。",
    finishRunLabel: "プレイを終了",
    helperCorrect: "正解です。",
    helperIncorrect: "続行する前に正解の選択肢がハイライトされたまま表示されます。",
    lessonPreviewDetail: "タイマーが始まる前にレッスン構成を確認します。",
    lessonPreviewFooter: "各 topic section は短いクイズで終わり、次の学習 section へ進みます。",
    lessonPreviewPhase: "レッスンプレビュー",
    lessonPreviewTitle: "IR Primer の準備完了",
    mistakesLabel: (count) => `ミス ${count}`,
    nextPageLabel: "次のページ",
    nextQuestionLabel: "次の問題",
    openingResultLabel: "結果を開いています",
    progressCompleted: (count) => `完了 ${count}/${count}`,
    progressPage: (current, total) => `ページ ${current}/${total}`,
    progressQuestion: (current, total) => `問題 ${current}/${total}`,
    progressTimedOut: (timeLabel) => `${timeLabel} で時間切れ`,
    quizDetail: "直前に確認した学習 section の内容をもとに現在の問題へ答えてください。",
    quizFooter: (current, total) => `問題 ${current} / ${total}`,
    quizPhase: (current) => `問題 ${current}`,
    quizTitle: "IR 理解度チェック",
    readyProgressLabel: (studyPages, questionCount) => `学習ページ ${studyPages} 件、クイズ ${questionCount} 問`,
    reviewContinueLabel: "回答を見直して続行",
    reviewSummaryCorrect: "正解です。次の問題へ進んでください。",
    reviewSummaryIncorrect: (explanation) => `${explanation} ミスを記録しました。`,
    runStatusCleared: "クリア",
    runStatusPreview: "プレビュー",
    runStatusQuiz: "クイズ",
    runStatusStudy: "学習",
    runStatusTimedOut: "時間切れ",
    startAnotherRunLabel: "もう一度プレイ",
    startLessonLabel: "レッスンを開始",
    startQuizLabel: "クイズを開始",
    studyFooter: "この section のクイズへ進む前に学習ノートを読んでください。",
    studyPhase: (current) => `学習 ${current}`,
    studyProgress: (current, total) => `ページ ${current} / ${total}`,
    timeLeftLabel: (timeLabel) => `残り ${timeLabel}`,
  },
  zh: {
    backLabel: "返回",
    boardAriaLabel: "IR Primer 面板",
    checkAnswerLabel: "检查答案",
    finishDetailCleared: "所有学习页面和测验题都已完成。结果页面会自动打开。",
    finishDetailFailed: "计时器在 IR Primer 完成前结束了。",
    finishDetailQuiz: "完成当前 section 的测验后才会进入下一段学习内容。失误会被记录，但本次挑战会继续。",
    finishDetailStudy: "先阅读当前 section，准备好后再进入这一段的测验。",
    finishRunLabel: "结束挑战",
    helperCorrect: "答案正确。",
    helperIncorrect: "继续之前会保留高亮显示的正确选项。",
    lessonPreviewDetail: "在计时开始前先预览课程结构。",
    lessonPreviewFooter: "每个 topic section 结束后都会先做一小段测验，再进入下一段学习。",
    lessonPreviewPhase: "课程预览",
    lessonPreviewTitle: "IR Primer 已就绪",
    mistakesLabel: (count) => `失误 ${count}`,
    nextPageLabel: "下一页",
    nextQuestionLabel: "下一题",
    openingResultLabel: "正在打开结果页面",
    progressCompleted: (count) => `已完成 ${count}/${count}`,
    progressPage: (current, total) => `第 ${current}/${total} 页`,
    progressQuestion: (current, total) => `第 ${current}/${total} 题`,
    progressTimedOut: (timeLabel) => `在 ${timeLabel} 时超时`,
    quizDetail: "根据刚刚阅读的学习 section 回答这道题。",
    quizFooter: (current, total) => `第 ${current} / ${total} 题`,
    quizPhase: (current) => `第 ${current} 题`,
    quizTitle: "IR 理解检查",
    readyProgressLabel: (studyPages, questionCount) => `${studyPages} 个学习页面，${questionCount} 道测验题`,
    reviewContinueLabel: "查看答案并继续",
    reviewSummaryCorrect: "回答正确，进入下一题。",
    reviewSummaryIncorrect: (explanation) => `${explanation} 已记录这次失误。`,
    runStatusCleared: "已通关",
    runStatusPreview: "预览",
    runStatusQuiz: "测验",
    runStatusStudy: "学习",
    runStatusTimedOut: "超时",
    startAnotherRunLabel: "重新开始",
    startLessonLabel: "开始课程",
    startQuizLabel: "开始测验",
    studyFooter: "进入这一段的测验之前，请先阅读本 section 的学习笔记。",
    studyPhase: (current) => `学习 ${current}`,
    studyProgress: (current, total) => `第 ${current} / ${total} 页`,
    timeLeftLabel: (timeLabel) => `剩余 ${timeLabel}`,
  },
  fr: {
    backLabel: "Retour",
    boardAriaLabel: "Tableau IR Primer",
    checkAnswerLabel: "Vérifier la réponse",
    finishDetailCleared: "Toutes les pages d'etude et les questions du quiz sont terminees. L'ecran de resultat s'ouvre automatiquement.",
    finishDetailFailed: "Le minuteur a expire avant la fin de IR Primer.",
    finishDetailQuiz: "Terminez le quiz de la section en cours pour debloquer la section d'etude suivante. Les erreurs sont enregistrees, mais la partie continue.",
    finishDetailStudy: "Lisez la section actuelle, puis passez a son quiz quand vous etes pret.",
    finishRunLabel: "Terminer la partie",
    helperCorrect: "Bonne reponse confirmee.",
    helperIncorrect: "Les bonnes reponses restent en surbrillance avant que vous continuiez.",
    lessonPreviewDetail: "Previsualisez la structure de la lecon avant le demarrage du minuteur.",
    lessonPreviewFooter: "Chaque section thematique se termine par un court quiz avant la section suivante.",
    lessonPreviewPhase: "Apercu de la lecon",
    lessonPreviewTitle: "IR Primer pret",
    mistakesLabel: (count) => `Erreurs ${count}`,
    nextPageLabel: "Page suivante",
    nextQuestionLabel: "Question suivante",
    openingResultLabel: "Ouverture du resultat",
    progressCompleted: (count) => `Termine ${count}/${count}`,
    progressPage: (current, total) => `Page ${current}/${total}`,
    progressQuestion: (current, total) => `Question ${current}/${total}`,
    progressTimedOut: (timeLabel) => `Temps ecoule a ${timeLabel}`,
    quizDetail: "Repondez a la question actuelle a partir de la section d'etude que vous venez de relire.",
    quizFooter: (current, total) => `Question ${current} sur ${total}`,
    quizPhase: (current) => `Question ${current}`,
    quizTitle: "Verification de comprehension IR",
    readyProgressLabel: (studyPages, questionCount) => `${studyPages} pages d'etude, ${questionCount} questions de quiz`,
    reviewContinueLabel: "Relire la reponse et continuer",
    reviewSummaryCorrect: "Bonne reponse. Passez a la question suivante.",
    reviewSummaryIncorrect: (explanation) => `${explanation} Une erreur a ete enregistree.`,
    runStatusCleared: "Termine",
    runStatusPreview: "Apercu",
    runStatusQuiz: "Quiz",
    runStatusStudy: "Etude",
    runStatusTimedOut: "Temps ecoule",
    startAnotherRunLabel: "Recommencer",
    startLessonLabel: "Commencer la lecon",
    startQuizLabel: "Commencer le quiz",
    studyFooter: "Lisez les notes d'etude de cette section avant de passer a son quiz.",
    studyPhase: (current) => `Etude ${current}`,
    studyProgress: (current, total) => `Page ${current} sur ${total}`,
    timeLeftLabel: (timeLabel) => `Reste ${timeLabel}`,
  },
};

export function getIrPrimerUiCopy(locale: SupportedArcadeLocale) {
  return copyByLocale[locale];
}