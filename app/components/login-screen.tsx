type LoginOption = {
  id: string;
  displayName: string;
  avatarUrl?: string | null;
  tagline: string;
  totalPoints: number;
  rank: number | null;
  favoriteGame: string;
};

export function LoginScreen({ users }: { users: LoginOption[] }) {
  return (
    <main className="login-shell">
      <section className="login-hero">
        <p className="eyebrow">Microsoft Entra ID</p>
        <h1>Choose a development identity</h1>
        <p className="hero-copy">
          This local slice uses seeded tenant members so the authenticated flow can be built before Azure app registration values are wired.
        </p>
      </section>
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
              <button className="action-link action-link-primary" type="submit">
                Sign in as {user.displayName}
              </button>
            </form>
          </article>
        ))}
      </section>
    </main>
  );
}