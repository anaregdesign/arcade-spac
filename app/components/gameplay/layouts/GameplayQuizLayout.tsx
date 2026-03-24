import type { ReactNode } from "react";

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

function getSelectionModeCopy(selectionMode: GameplayQuizSelectionMode) {
  return selectionMode === "multiple" ? "Select all that apply, then submit." : "Select one answer.";
}

export function GameplayQuizLayout({
  choiceColumns,
  choices,
  choicesLabel = "Answer choices",
  className,
  detail,
  footer,
  helperText,
  mobileChoiceColumns = 1,
  phase,
  prompt,
  promptLabel = "Question",
  selectionMode = "single",
  sources,
  sourcesLabel = "Sources",
  submitAction,
  title,
  tone = "logic",
}: GameplayQuizLayoutProps) {
  const resolvedColumns = choiceColumns ?? (choices.length <= 2 ? 1 : 2);
  const resolvedHelperText = helperText ?? getSelectionModeCopy(selectionMode);

  return (
    <GameplaySequenceStageLayout className={joinClassNames(styles["quiz-layout"], className)}>
      <GameplayContextCue detail={detail} phase={phase} showDetailOnMobile title={title} tone={tone} />

      <section className={styles["quiz-panel"]} aria-label={promptLabel}>
        <div className={styles["quiz-section-heading"]}>
          <span className={styles["quiz-section-label"]}>{promptLabel}</span>
        </div>
        <GameplayMarkdown content={prompt} />

        {sources?.length ? <GameplaySourceAttribution label={sourcesLabel} sources={sources} /> : null}
      </section>

      <section className={styles["quiz-panel"]} aria-label={choicesLabel}>
        <div className={styles["quiz-section-heading"]}>
          <span className={styles["quiz-section-label"]}>{choicesLabel}</span>
          <p className={styles["quiz-helper-copy"]}>{resolvedHelperText}</p>
        </div>

        <div aria-label={choicesLabel} className={styles["quiz-choice-region"]} role={selectionMode === "single" ? "radiogroup" : "group"}>
          <GameplayChoiceGrid className={styles["quiz-choice-grid"]} columns={resolvedColumns} mobileColumns={mobileChoiceColumns}>
            {choices.map((choice, index) => {
              const marker = getChoiceMarker(index);
              const label = choice.label ?? `Option ${marker}`;

              return (
                <button
                  aria-label={choice.accessibilityLabel ?? label}
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
                    <span className={styles["quiz-choice-label"]}>{label}</span>
                    <GameplayMarkdown content={choice.content} />
                  </div>
                </button>
              );
            })}
          </GameplayChoiceGrid>
        </div>

        {submitAction || footer ? (
          <div className={styles["quiz-action-row"]}>
            {footer ? <div className={styles["quiz-footer"]}>{footer}</div> : <span />}
            {submitAction ? <div className={styles["quiz-submit-action"]}>{submitAction}</div> : null}
          </div>
        ) : null}
      </section>
    </GameplaySequenceStageLayout>
  );
}