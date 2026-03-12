import { Link } from "react-router";

type AppShellProps = {
  children: React.ReactNode;
  currentPath: "home" | "rankings" | "profile" | "games";
  title: string;
  subtitle: string;
  user: {
    displayName: string;
    avatarUrl?: string | null;
  };
};

const navItems = [
  { key: "home", label: "Home", to: "/home" },
  { key: "rankings", label: "Rankings", to: "/rankings" },
  { key: "profile", label: "Profile", to: "/profile" },
] as const;

export function AppShell({ children, currentPath, title, subtitle, user }: AppShellProps) {
  return (
    <div className="page-shell">
      <header className="app-shell-header">
        <div>
          <p className="eyebrow">Arcade</p>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">{subtitle}</p>
        </div>
        <div className="app-shell-user">
          <nav className="app-shell-nav" aria-label="Primary">
            {navItems.map((item) => (
              <Link
                key={item.key}
                className={item.key === currentPath ? "nav-pill nav-pill-active" : "nav-pill"}
                to={item.to}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="user-chip">
            <span className="avatar-chip" aria-hidden="true">
              {user.displayName.slice(0, 1).toUpperCase()}
            </span>
            <span>{user.displayName}</span>
          </div>
          <form method="post" action="/logout">
            <button className="action-link action-link-secondary" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <div className="page-content">{children}</div>
    </div>
  );
}