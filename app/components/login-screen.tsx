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
  entraSignInHref: string | null;
  returnTo: string | null;
  users: LoginOption[];
};

export function LoginScreen({ authMode, entraSignInHref, returnTo, users }: LoginScreenProps) {
  const eyebrow = authMode === "entra" ? "🔐 Microsoft Entra ID" : "🧪 Local access";

  return (
    <main className="login-shell">
      <section className="login-hero">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{authMode === "entra" ? "Sign in to Arcade" : "Choose a development identity"}</h1>
        <div className="login-meta-row">
          {returnTo ? <span className="status-badge status-badge-neutral">Return {returnTo}</span> : null}
          {authMode === "entra" ? <span className="status-badge status-badge-neutral">Tenant sign-in</span> : <span className="status-badge status-badge-neutral">Seeded players</span>}
        </div>
        {authMode === "entra" && entraSignInHref ? (
          <div className="hero-actions">
            <a className="action-link action-link-primary" href={entraSignInHref}>
              Continue
            </a>
          </div>
        ) : null}
      </section>
      {authMode === "local" ? (
        <section className="login-grid" aria-label="Available users">
          {users.map((user) => (
            <article key={user.id} className="login-card">
              <div className="login-card-header">
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
              <form method="post" className="login-form">
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