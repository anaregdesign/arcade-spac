import type { ReactNode } from "react";

import styles from "./GameWorkspaceShared.module.css";

type GameWorkspaceBoardOverlayProps = {
  actionLabel: string;
  detail: ReactNode;
  isVisible: boolean;
  onAction: () => void;
  title?: ReactNode;
};

export function GameWorkspaceBoardOverlay({
  actionLabel,
  detail,
  isVisible,
  onAction,
  title = "Ready",
}: GameWorkspaceBoardOverlayProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles["game-board-overlay"]} aria-live="polite">
      <div className={styles["game-board-overlay-card"]}>
        <p className={styles["game-board-overlay-title"]}>{title}</p>
        <button className="action-link action-link-primary" type="button" onClick={onAction}>
          {actionLabel}
        </button>
        <p className={styles["game-board-overlay-detail"]}>{detail}</p>
      </div>
    </div>
  );
}
