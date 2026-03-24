import { useGameInstructionsDialog } from "../../../lib/client/usecase/game-instructions-dialog/use-game-instructions-dialog";
import { useAppLocale } from "../../../lib/client/usecase/locale/use-app-locale";
import { useGameWorkspaceRuntime } from "./game-workspace-runtime";

import styles from "./GameWorkspaceShared.module.css";

export type GameInstructionItem = {
  detail: string;
  label: string;
};

export type GameInstructionSection = {
  items: GameInstructionItem[];
  title: string;
};

export type GameInstructions = {
  sections: GameInstructionSection[];
  summary: string;
  title: string;
};

type GameInstructionsDialogProps = {
  instructions: GameInstructions;
  triggerLabel?: string;
};

export function GameInstructionsDialog({
  instructions,
  triggerLabel,
}: GameInstructionsDialogProps) {
  const dialog = useGameInstructionsDialog();
  const { copy } = useAppLocale();
  const runtime = useGameWorkspaceRuntime();

  return (
    <>
      <button className="action-link action-link-secondary" type="button" onClick={dialog.open}>
        {triggerLabel ?? copy.howToPlayLabel}
      </button>
      {runtime.instructionsActions}
      {dialog.isOpen ? (
        <section className="help-overlay" aria-label={`${instructions.title} ${copy.howToPlayLabel}`}>
          <div
            aria-labelledby={dialog.titleId}
            aria-modal="true"
            className={["help-dialog", "feature-card", styles["game-instructions-dialog"]].join(" ")}
            role="dialog"
          >
            <div className="section-heading">
              <div>
                <p className="eyebrow">{copy.helpEyebrow}</p>
                <h2 className="section-title" id={dialog.titleId}>{instructions.title}</h2>
              </div>
              <button className="action-link action-link-secondary" type="button" onClick={dialog.close}>
                {copy.closeLabel}
              </button>
            </div>
            <p className="compact-copy">{instructions.summary}</p>
            <div className={styles["game-instructions-grid"]}>
              {instructions.sections.map((section) => (
                <article className={styles["game-instructions-panel"]} key={section.title}>
                  <h3 className="card-title">{section.title}</h3>
                  <dl className={styles["game-instructions-list"]}>
                    {section.items.map((item) => (
                      <div className={styles["game-instructions-row"]} key={`${section.title}-${item.label}`}>
                        <dt>{item.label}</dt>
                        <dd>{item.detail}</dd>
                      </div>
                    ))}
                  </dl>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
