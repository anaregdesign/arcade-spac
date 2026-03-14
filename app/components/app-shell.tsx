import { Link } from "react-router";

import { useAppShell } from "../lib/client/usecase/app-shell/use-app-shell";
import { AppHelpDialog } from "./shared/AppHelpDialog";
import type { AppHelpSection } from "./shared/help-content";

type AppShellProps = {
  children: React.ReactNode;
  currentPath: "home" | "rankings" | "profile" | "games";
  sectionLabel: string;
  title: string;
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

export function AppShell({ children, currentPath, sectionLabel, title, user, help }: AppShellProps) {
  const shell = useAppShell({ defaultHelpOpen: help?.defaultOpen });

  return (
    <div className="page-shell">
      <header className="app-shell-header">
        <div className="app-shell-bar">
          <div className="app-shell-brand">
            <Link className="app-shell-home-link" to="/home">
              <h1 className="page-title">The Arcade</h1>
            </Link>
            <p className="eyebrow shell-kicker app-shell-kicker" title={`${sectionLabel}: ${title}`}>
              <span>{sectionLabel}</span>
              <span className="app-shell-context-separator" aria-hidden="true">/</span>
              <span>{title}</span>
            </p>
          </div>
          <button
            aria-label={shell.muted ? "Unmute sounds" : "Mute sounds"}
            aria-pressed={shell.muted}
            className="mute-toggle"
            type="button"
            onClick={shell.toggleMute}
          >
            <span aria-hidden="true">{shell.muted ? "🔇" : "🔊"}</span>
          </button>
          <button
            aria-controls={shell.navPanelId}
            aria-expanded={shell.isMenuOpen}
            className={shell.isMenuOpen ? "menu-toggle menu-toggle-open" : "menu-toggle"}
            type="button"
            onClick={shell.handleMenuToggle}
          >
            <span className="menu-toggle-label">{shell.isMenuOpen ? "Close menu" : "Open menu"}</span>
            <span className="menu-toggle-icon" aria-hidden="true">
              <span className="menu-toggle-bar" />
              <span className="menu-toggle-bar" />
              <span className="menu-toggle-bar" />
            </span>
          </button>
        </div>
        <div className={shell.isMenuOpen ? "app-shell-panel app-shell-panel-open" : "app-shell-panel"} id={shell.navPanelId}>
          <nav className="app-shell-nav" aria-label="Primary">
            {shell.navItems.map((item) => (
              <Link
                key={item.key}
                className={item.key === currentPath ? "nav-pill nav-pill-active" : "nav-pill"}
                onClick={shell.handleNavClick}
                to={item.to}
              >
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
          <div className="app-shell-actions">
            {help ? (
              <button
                className="action-link action-link-secondary"
                type="button"
                onClick={shell.handleHelpClick}
              >
                {help.triggerLabel ?? "Help"}
              </button>
            ) : null}
            <form method="post" action="/logout">
              <button className="action-link action-link-secondary" type="submit">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="page-content">{children}</div>
      {help ? (
        <AppHelpDialog
          footer={help.footer}
          intro={help.intro}
          isOpen={shell.isHelpOpen}
          onClose={shell.closeHelp}
          sections={help.sections}
          title={help.title}
          titleEyebrow={help.titleEyebrow}
        />
      ) : null}
    </div>
  );
}
