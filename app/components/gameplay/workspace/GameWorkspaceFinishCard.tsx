import type { ReactNode } from "react";

import styles from "./GameWorkspaceShared.module.css";

type GameWorkspaceFinishCardProps = {
  actions?: ReactNode;
  detail: ReactNode;
  emphasis: ReactNode;
};

export function GameWorkspaceFinishCard({ actions, detail, emphasis }: GameWorkspaceFinishCardProps) {
  return (
    <section className={["feature-card", styles["workspace-card"], styles["workspace-finish-card"]].join(" ")}>
      <div className={styles["workspace-finish-row"]}>
        <div className={styles["workspace-finish-copy"]}>
          <strong>{emphasis}</strong>
          <span>{detail}</span>
        </div>
        {actions ? (
          <div className="hero-actions compact-actions compact-action-strip">
            {actions}
          </div>
        ) : null}
      </div>
    </section>
  );
}
