import { useEffect, useRef, type ReactNode } from "react";

import { useGameWorkspaceRuntime } from "./game-workspace-runtime";
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
  const { autoStartRequest } = useGameWorkspaceRuntime();
  const handledAutoStartRef = useRef(0);

  useEffect(() => {
    if (!isVisible || autoStartRequest === 0 || autoStartRequest === handledAutoStartRef.current) {
      return;
    }

    handledAutoStartRef.current = autoStartRequest;
    onAction();
  }, [autoStartRequest, isVisible, onAction]);

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
