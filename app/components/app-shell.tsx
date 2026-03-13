import { useState } from "react";
import { Link } from "react-router";

import { AppHelpDialog } from "./shared/AppHelpDialog";
import type { AppHelpSection } from "./shared/help-content";

type AppShellProps = {
  children: React.ReactNode;
  currentPath: "home" | "rankings" | "profile" | "games";
  titleEmoji: string;
  sectionLabel: string;
  title: string;
  subtitle?: string;
  user: {
    displayName: string;
    avatarUrl?: string | null;
  };
  help?: {
    defaultOpen?: boolean;
    footer?: React.ReactNode;
    intro: string;
    sections: AppHelpSection[];
    title: string;
    titleEyebrow?: string;
    triggerLabel?: string;
  };
};

const navItems = [
  { key: "home", label: "Home", emoji: "🎮", to: "/home" },
  { key: "rankings", label: "Rankings", emoji: "🏆", to: "/rankings" },
  { key: "profile", label: "Profile", emoji: "🪪", to: "/profile" },
] as const;

export function AppShell({ children, currentPath, titleEmoji, sectionLabel, title, subtitle, user, help }: AppShellProps) {
  const [isHelpOpen, setHelpOpen] = useState(Boolean(help?.defaultOpen));

  return (
    <div className="page-shell">
      <header className="app-shell-header">
        <div className="app-shell-title-block">
          <p className="eyebrow shell-kicker">
            <span className="shell-kicker-emoji" aria-hidden="true">{titleEmoji}</span>
            <span>{sectionLabel}</span>
          </p>
          <div className="page-title-row">
            <h1 className="page-title">{title}</h1>
          </div>
          {subtitle ? <p className="page-subtitle">{subtitle}</p> : null}
        </div>
        <div className="app-shell-user">
          <nav className="app-shell-nav" aria-label="Primary">
            {navItems.map((item) => (
              <Link
                key={item.key}
                className={item.key === currentPath ? "nav-pill nav-pill-active" : "nav-pill"}
                to={item.to}
              >
                <span aria-hidden="true">{item.emoji}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <div className="user-chip">
            <span className="avatar-chip" aria-hidden="true">
              {user.displayName.slice(0, 1).toUpperCase()}
            </span>
            <span>{user.displayName}</span>
          </div>
          {help ? (
            <button className="action-link action-link-secondary" type="button" onClick={() => setHelpOpen(true)}>
              {help.triggerLabel ?? "Help"}
            </button>
          ) : null}
          <form method="post" action="/logout">
            <button className="action-link action-link-secondary" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <div className="page-content">{children}</div>
      {help ? (
        <AppHelpDialog
          footer={help.footer}
          intro={help.intro}
          isOpen={isHelpOpen}
          onClose={() => setHelpOpen(false)}
          sections={help.sections}
          title={help.title}
          titleEyebrow={help.titleEyebrow}
        />
      ) : null}
    </div>
  );
}
