import { Link, useLocation } from "react-router";

import { useAppShell } from "../../lib/client/usecase/app-shell/use-app-shell";
import { useAppLocale } from "../../lib/client/usecase/locale/use-app-locale";
import { AppHelpDialog } from "./AppHelpDialog";
import type { AppHelpSection } from "./help-content";

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
  const location = useLocation();
  const { copy, localeSelection } = useAppLocale();
  const returnTo = `${location.pathname}${location.search}`;
  const navItems = [
    { key: "home", label: copy.navHomeLabel, to: "/home" },
    { key: "rankings", label: copy.navRankingsLabel, to: "/rankings" },
    { key: "profile", label: copy.navProfileLabel, to: "/profile" },
  ] as const;

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
            aria-label={shell.muted ? copy.unmuteLabel : copy.muteLabel}
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
            <span className="menu-toggle-label">{shell.isMenuOpen ? copy.menuCloseLabel : copy.menuOpenLabel}</span>
            <span className="menu-toggle-icon" aria-hidden="true">
              <span className="menu-toggle-bar" />
              <span className="menu-toggle-bar" />
              <span className="menu-toggle-bar" />
            </span>
          </button>
        </div>
        <div className={shell.isMenuOpen ? "app-shell-panel app-shell-panel-open" : "app-shell-panel"} id={shell.navPanelId}>
          <nav className="app-shell-nav" aria-label={copy.menuAriaLabel}>
            {navItems.map((item) => (
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
          <form action="/" className="locale-preference-form" method="post">
            <input type="hidden" name="intent" value="setLocale" />
            <input type="hidden" name="returnTo" value={returnTo} />
            <label className="locale-preference-label">
              <span>{copy.languageLabel}</span>
              <select
                className="locale-preference-select"
                name="locale"
                value={localeSelection}
                onChange={(event) => event.currentTarget.form?.requestSubmit()}
              >
                <option value="auto">{copy.browserDefaultLabel}</option>
                <option value="ja">日本語</option>
                <option value="zh">中文</option>
                <option value="en">English</option>
                <option value="fr">Français</option>
              </select>
            </label>
          </form>
          <div className="user-chip">
            <span className="avatar-chip" aria-hidden="true">
              {user.displayName.slice(0, 1).toUpperCase()}
            </span>
            <span>{user.displayName}</span>
          </div>
          <div className="app-shell-actions">
            <form method="post" action="/logout">
              <button className="action-link action-link-secondary" type="submit">
                {copy.signOutLabel}
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