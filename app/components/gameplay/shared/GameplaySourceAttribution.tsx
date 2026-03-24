import type { ReactNode } from "react";

import { useAppLocale } from "../../../lib/client/usecase/locale/use-app-locale";
import { joinClassNames } from "../../../lib/client/ui/gameplay-layout";
import styles from "./GameplaySourceAttribution.module.css";

export type GameplaySourceAttributionItem = {
  href: string;
  label?: string;
  note?: ReactNode;
  title: string;
};

type GameplaySourceAttributionProps = {
  className?: string;
  label?: string;
  sources: GameplaySourceAttributionItem[];
};

export function GameplaySourceAttribution({
  className,
  label,
  sources,
}: GameplaySourceAttributionProps) {
  const { locale } = useAppLocale();

  if (sources.length === 0) {
    return null;
  }

  const resolvedLabel = label ?? (locale === "ja" ? "出典" : locale === "zh" ? "来源" : locale === "fr" ? "Sources" : "Sources");

  return (
    <section aria-label={resolvedLabel} className={joinClassNames(styles["source-block"], className)}>
      <div className={styles["source-heading"]}>
        <span className={styles["source-heading-label"]}>{resolvedLabel}</span>
      </div>

      <ul className={styles["source-list"]}>
        {sources.map((source) => (
          <li className={styles["source-item"]} key={`${source.href}:${source.title}`}>
            <div className={styles["source-copy"]}>
              {source.label ? <span className={styles["source-label"]}>{source.label}</span> : null}
              <a className={styles["source-link"]} href={source.href} rel="noreferrer" target="_blank">
                {source.title}
              </a>
              {source.note ? <div className={styles["source-note"]}>{source.note}</div> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}