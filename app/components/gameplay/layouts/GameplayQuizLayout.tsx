import type { ReactNode } from "react";

import { useAppLocale } from "../../../lib/client/usecase/locale/use-app-locale";
import { joinClassNames } from "../../../lib/client/ui/gameplay-layout";
import { GameplayContextCue, type GameplayContextCueTone } from "../GameplayContextCue";
import { GameplaySourceAttribution, type GameplaySourceAttributionItem } from "../shared/GameplaySourceAttribution";
import { GameplayMarkdown } from "../shared/GameplayMarkdown";
import { GameplayChoiceGrid } from "./GameplayChoiceGrid";
import { GameplaySequenceStageLayout } from "./GameplaySequenceStageLayout";
import styles from "./GameplayQuizLayout.module.css";

export type GameplayQuizSelectionMode = "multiple" | "single";

export type GameplayQuizChoice = {
  accessibilityLabel?: string;
  content: string;
  disabled?: boolean;
  key: string;
  label?: string;
  onSelect?: () => void;
  selected?: boolean;
  tone?: "correct" | "default" | "incorrect";
};

type GameplayQuizLayoutProps = {
  choiceColumns?: number;
  choices: GameplayQuizChoice[];
  choicesLabel?: string;
  className?: string;
  detail?: ReactNode;
  footer?: ReactNode;
  helperText?: ReactNode;
  mobileChoiceColumns?: number;
  phase?: ReactNode;
  prompt: string;
  promptLabel?: string;
  selectionMode?: GameplayQuizSelectionMode;
  sources?: GameplaySourceAttributionItem[];
  sourcesLabel?: string;
  submitAction?: ReactNode;
  title: ReactNode;
  tone?: GameplayContextCueTone;
};

function getChoiceMarker(index: number) {
  const letter = String.fromCharCode(65 + index);

  return /[A-Z]/.test(letter) ? letter : String(index + 1);
}

function getSelectionModeCopy(locale: "en" | "fr" | "ja" | "zh", selectionMode: GameplayQuizSelectionMode) {
  if (selectionMode === "multiple") {
    if (locale === "ja") {
      return "当てはまるものをすべて選んでから回答を確認します。";
    }

    if (locale === "zh") {
      return "先选择所有适用项，再检查答案。";
    }

    if (locale === "fr") {
      return "Sélectionnez toutes les réponses pertinentes, puis validez.";
    }

    return "Select all that apply, then submit.";
  }

  if (locale === "ja") {
    return "正解だと思う回答を 1 つ選びます。";
  }

  if (locale === "zh") {
    return "请选择一个答案。";
  }

  if (locale === "fr") {
    return "Sélectionnez une seule réponse.";
  }

  return "Select one answer.";
}

export function GameplayQuizLayout({
  choiceColumns,
  choices,
  choicesLabel,
  className,
  detail,
  footer,
  helperText,
  mobileChoiceColumns = 1,
  phase,
  prompt,
  promptLabel,
  selectionMode = "single",
  sources,
  sourcesLabel,
  submitAction,
  title,
  tone = "logic",
}: GameplayQuizLayoutProps) {
  const { locale } = useAppLocale();
  const resolvedColumns = choiceColumns ?? (choices.length <= 2 ? 1 : 2);
  const resolvedPromptLabel = promptLabel ?? (locale === "ja" ? "問題" : locale === "zh" ? "题目" : locale === "fr" ? "Question" : "Question");
  const resolvedChoicesLabel = choicesLabel ?? (locale === "ja" ? "選択肢" : locale === "zh" ? "选项" : locale === "fr" ? "Choix de reponse" : "Answer choices");
  const resolvedSourcesLabel = sourcesLabel ?? (locale === "ja" ? "出典" : locale === "zh" ? "来源" : locale === "fr" ? "Sources" : "Sources");
  const resolvedHelperText = helperText ?? getSelectionModeCopy(locale, selectionMode);

  return (
    <GameplaySequenceStageLayout className={joinClassNames(styles["quiz-layout"], className)}>
      <GameplayContextCue detail={detail} phase={phase} showDetailOnMobile title={title} tone={tone} />

      <section className={styles["quiz-panel"]} aria-label={resolvedPromptLabel}>
        <div className={styles["quiz-section-heading"]}>
          <span className={styles["quiz-section-label"]}>{resolvedPromptLabel}</span>
        </div>
        <GameplayMarkdown content={prompt} />

        {sources?.length ? <GameplaySourceAttribution label={resolvedSourcesLabel} sources={sources} /> : null}
      </section>

      <section className={styles["quiz-panel"]} aria-label={resolvedChoicesLabel}>
        <div className={styles["quiz-section-heading"]}>
          <span className={styles["quiz-section-label"]}>{resolvedChoicesLabel}</span>
          <p className={styles["quiz-helper-copy"]}>{resolvedHelperText}</p>
        </div>

        <div aria-label={resolvedChoicesLabel} className={styles["quiz-choice-region"]} role={selectionMode === "single" ? "radiogroup" : "group"}>
          <GameplayChoiceGrid className={styles["quiz-choice-grid"]} columns={resolvedColumns} mobileColumns={mobileChoiceColumns}>
            {choices.map((choice, index) => {
              const marker = getChoiceMarker(index);

              return (
                <button
                  aria-label={choice.accessibilityLabel}
                  aria-pressed={choice.selected ? "true" : "false"}
                  className={styles["quiz-choice-card"]}
                  data-selected={choice.selected ? "true" : "false"}
                  data-tone={choice.tone ?? "default"}
                  disabled={choice.disabled}
                  key={choice.key}
                  onClick={choice.onSelect}
                  type="button"
                >
                  <span aria-hidden="true" className={styles["quiz-choice-marker"]}>
                    {marker}
                  </span>
                  <div className={styles["quiz-choice-copy"]}>
                    <GameplayMarkdown content={choice.content} />
                  </div>
                </button>
              );
            })}
          </GameplayChoiceGrid>
        </div>

        {submitAction || footer ? (
          <div className={styles["quiz-action-row"]}>
            {footer ? <div className={styles["quiz-footer"]}>{typeof footer === "string" ? <GameplayMarkdown content={footer} /> : footer}</div> : <span />}
            {submitAction ? <div className={styles["quiz-submit-action"]}>{submitAction}</div> : null}
          </div>
        ) : null}
      </section>
    </GameplaySequenceStageLayout>
  );
}