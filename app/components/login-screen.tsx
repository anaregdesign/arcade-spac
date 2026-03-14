import { useLoginScreen } from "../lib/client/usecase/login-screen/use-login-screen";
import styles from "./login-screen.module.css";

type LoginOption = {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  tagline: string;
  totalPoints: number;
  rank: number | null;
  favoriteGame: string;
};

type LoginScreenProps = {
  authMode: "local" | "entra";
  errorMessage: string | null;
  entraSignInHref: string | null;
  returnTo: string | null;
  users: LoginOption[];
};

export function LoginScreen({ authMode, errorMessage, entraSignInHref, returnTo, users }: LoginScreenProps) {
  const screen = useLoginScreen({ authMode });

  return (
    <main className={styles["login-shell"]}>
      <section className={styles["login-hero"]}>
        <p className="eyebrow">{screen.eyebrow}</p>
        <h1>{screen.heroTitle}</h1>
        <div className={styles["login-meta-row"]}>
          {returnTo ? <span className="status-badge status-badge-neutral">Return {returnTo}</span> : null}
          <span className="status-badge status-badge-neutral">{screen.rosterStatusLabel}</span>
        </div>
        <p className="hero-copy">
          Arcade is a sign-in-required game hub for quick game runs, shared rankings, and result review across organization accounts.
          Sign-in is required for Home, Game, Result, Rankings, and Profile.
        </p>
        <div className="help-inline-grid compact-copy login-context-grid">
          <p><strong>Without sign-in:</strong> You can still open Privacy and Terms.</p>
          <p><strong>After sign-in:</strong> The app returns to the board, shared result, or screen you originally requested.</p>
        </div>
        {errorMessage ? (
          <article className={styles["login-error-card"]} role="alert">
            <strong>Sign-in could not complete</strong>
            <p className="compact-copy">{errorMessage}</p>
          </article>
        ) : null}
        {screen.showEntraActions && entraSignInHref ? (
          <div className="hero-actions">
            <a className="action-link action-link-primary" href={entraSignInHref}>
              Continue with Microsoft Entra ID
            </a>
            <a className="action-link action-link-secondary" href="/privacy">
              Privacy
            </a>
            <a className="action-link action-link-secondary" href="/terms">
              Terms
            </a>
          </div>
        ) : null}
        {screen.showLocalRoster ? (
          <div className="hero-actions">
            <a className="action-link action-link-secondary" href="/privacy">
              Privacy
            </a>
            <a className="action-link action-link-secondary" href="/terms">
              Terms
            </a>
          </div>
        ) : null}
      </section>
      {screen.showLocalRoster ? (
        <section className={styles["login-grid"]} aria-label="Available users">
          {users.map((user) => (
            <article key={user.id} className={styles["login-card"]}>
              <div className={styles["login-card-header"]}>
                <div className="user-chip">
                  <span className="avatar-chip" aria-hidden="true">
                    {user.displayName.slice(0, 1).toUpperCase()}
                  </span>
                  <div>
                    <strong>{user.displayName}</strong>
                    <p>{user.tagline}</p>
                  </div>
                </div>
              </div>
              <dl className="stat-grid compact-stat-grid">
                <div>
                  <dt>Season rank</dt>
                  <dd>{user.rank ? `#${user.rank}` : "Unranked"}</dd>
                </div>
                <div>
                  <dt>Season points</dt>
                  <dd>{user.totalPoints}</dd>
                </div>
                <div>
                  <dt>Favorite game</dt>
                  <dd>{user.favoriteGame}</dd>
                </div>
              </dl>
              <form method="post" className={styles["login-form"]}>
                <input type="hidden" name="userId" value={user.id} />
                <input type="hidden" name="redirectTo" value={returnTo ?? "/home"} />
                <button className="action-link action-link-primary" type="submit">
                  Continue as {user.displayName}
                </button>
              </form>
            </article>
          ))}
        </section>
      ) : null}
    </main>
  );
}
