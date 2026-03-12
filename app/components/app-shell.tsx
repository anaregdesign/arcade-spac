import fluentComponents from "@fluentui/react-components";
import { Link } from "react-router";

const { Avatar, Button, Subtitle2, Title2 } = fluentComponents;

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
          <Title2>{title}</Title2>
          <Subtitle2>{subtitle}</Subtitle2>
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
            <Avatar name={user.displayName} image={{ src: user.avatarUrl ?? undefined }} color="colorful" />
            <span>{user.displayName}</span>
          </div>
          <form method="post" action="/logout">
            <Button appearance="subtle" type="submit">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      <div className="page-content">{children}</div>
    </div>
  );
}