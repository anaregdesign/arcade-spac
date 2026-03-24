import type { ReactNode } from "react";

import { joinClassNames } from "../../../lib/client/ui/gameplay-layout";
import { GameplayContextCue, type GameplayContextCueTone } from "../GameplayContextCue";
import { GameplayMarkdown } from "../shared/GameplayMarkdown";
import { GameplaySourceAttribution, type GameplaySourceAttributionItem } from "../shared/GameplaySourceAttribution";
import { GameplaySequenceStageLayout } from "./GameplaySequenceStageLayout";
import styles from "./GameplayStudyLayout.module.css";

type GameplayStudyLayoutProps = {
  actions?: ReactNode;
  body: string;
  bodyLabel?: string;
  className?: string;
  detail?: ReactNode;
  footer?: ReactNode;
  phase?: ReactNode;
  progressLabel?: ReactNode;
  sources?: GameplaySourceAttributionItem[];
  sourcesLabel?: string;
  title: ReactNode;
  tone?: GameplayContextCueTone;
};

export function GameplayStudyLayout({
  actions,
  body,
  bodyLabel = "Study notes",
  className,
  detail,
  footer,
  phase,
  progressLabel,
  sources,
  sourcesLabel,
  title,
  tone = "review",
}: GameplayStudyLayoutProps) {
  return (
    <GameplaySequenceStageLayout className={joinClassNames(styles["study-layout"], className)}>
      <GameplayContextCue detail={detail} phase={phase} showDetailOnMobile title={title} tone={tone} />

      <section aria-label={bodyLabel} className={styles["study-panel"]}>
        <div className={styles["study-section-heading"]}>
          <span className={styles["study-section-label"]}>{bodyLabel}</span>
        </div>

        <GameplayMarkdown content={body} />

        {sources?.length ? <GameplaySourceAttribution label={sourcesLabel} sources={sources} /> : null}

        {progressLabel || footer || actions ? (
          <div className={styles["study-action-row"]}>
            <div className={styles["study-footer-column"]}>
              {progressLabel ? <div className={styles["study-progress"]}>{progressLabel}</div> : null}
              {footer ? <div className={styles["study-footer"]}>{footer}</div> : null}
            </div>
            {actions ? <div className={styles["study-actions"]}>{actions}</div> : null}
          </div>
        ) : null}
      </section>
    </GameplaySequenceStageLayout>
  );
}