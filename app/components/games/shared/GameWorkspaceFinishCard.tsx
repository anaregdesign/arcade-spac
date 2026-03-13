import type { ReactNode } from "react";

type GameWorkspaceFinishCardProps = {
  actions?: ReactNode;
  detail: ReactNode;
  emphasis: ReactNode;
};

export function GameWorkspaceFinishCard({ actions, detail, emphasis }: GameWorkspaceFinishCardProps) {
  return (
    <section className="feature-card workspace-card workspace-finish-card">
      <div className="workspace-finish-row">
        <div className="workspace-finish-copy">
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
