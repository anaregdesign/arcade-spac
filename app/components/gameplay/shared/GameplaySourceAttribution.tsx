import type { ReactNode } from "react";

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
  label = "Sources",
  sources,
}: GameplaySourceAttributionProps) {
  if (sources.length === 0) {
    return null;
  }

  return (
    <section aria-label={label} className={joinClassNames(styles["source-block"], className)}>
      <div className={styles["source-heading"]}>
        <span className={styles["source-heading-label"]}>{label}</span>
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