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
  return (
    <main className="login-shell">
      <section className="login-hero">
        <p className="eyebrow">Microsoft Entra ID</p>
        <h1>{authMode === "entra" ? "Sign in to Arcade" : "Choose a development identity"}</h1>
        <p className="hero-copy">
          {authMode === "entra"
            ? "Use your Microsoft Entra ID account to continue into the tenant-scoped Arcade experience."
            : "This local slice uses seeded tenant members so the authenticated flow can be built before Azure app registration values are wired."}
        </p>
        {returnTo ? <p className="hero-copy">After sign-in, you will return to {returnTo}.</p> : null}
        {authMode === "entra" && entraSignInHref ? (
          <div className="hero-actions">
            <a className="action-link action-link-primary" href={entraSignInHref}>
              Sign in with Microsoft Entra ID
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
                  Sign in as {user.displayName}
                </button>
              </form>
            </article>
          ))}
        </section>
      ) : null}
    </main>
  );
}