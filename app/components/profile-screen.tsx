import { Form, Link } from "react-router";

type ProfileScreenProps = {
  profile: {
    displayName: string;
    visibilityScope: "TENANT_ONLY" | "PRIVATE";
    tagline: string;
    favoriteGame: string;
    sharePreviewName: string;
  };
  activity: {
    streakDays: number;
    totalPlayCount: number;
    lastPlayedAt: string | null;
  };
  overall: Array<{
    period: string;
    totalPoints: number;
    currentRank: number | null;
    trendDelta: number;
    recentPlaySummary: string;
  }>;
  games: Array<{
    key: string;
    name: string;
    currentRank: number | null;
    bestCompetitivePoints: number;
    personalBestMetric: string;
    playCount: number;
    completedCount: number;
    recommendationText: string;
  }>;
  trend: Array<{
    index: number;
    gameName: string;
    status: string;
    totalPointsDelta: number;
    competitivePoints: number;
    label: string;
  }>;
};

function buildTrendPath(points: ProfileScreenProps["trend"]) {
  if (points.length === 0) {
    return "";
  }

  const values = points.map((point) => point.totalPointsDelta);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = max - min || 1;

  return points
    .map((point, index) => {
      const x = points.length === 1 ? 0 : (index / (points.length - 1)) * 100;
      const y = 100 - (((point.totalPointsDelta - min) / range) * 100);
      return `${index === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");
}

export function ProfileScreen({ profile, activity, overall, games, trend }: ProfileScreenProps) {
  const trendPath = buildTrendPath(trend);
  const recentTrend = trend.slice(-3).reverse();

  return (
    <div className="dashboard-stack">
      <section className="feature-card profile-shell-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">🪪 Identity</p>
            <h2 className="section-title">Identity and visibility</h2>
          </div>
          <Link className="action-link action-link-secondary" to="/rankings">
            Open rankings
          </Link>
        </div>
        <div className="profile-overview-grid">
          <article className="profile-preview-card feature-card">
            <p className="eyebrow">🏷️ Public name</p>
            <h3 className="card-title">{profile.sharePreviewName}</h3>
            <p className="compact-copy">{profile.visibilityScope === "TENANT_ONLY" ? "Visible inside the tenant" : "Private"}</p>
          </article>
          <article className="profile-preview-card feature-card">
            <p className="eyebrow">💬 Tagline</p>
            <h3 className="card-title">{profile.tagline || "No tagline yet"}</h3>
            <p className="compact-copy">Favorite: {profile.favoriteGame || "No preference yet"}</p>
          </article>
        </div>
        <details className="disclosure-card profile-edit-disclosure">
          <summary>Edit profile settings</summary>
          <div className="disclosure-body">
            <Form method="post" className="profile-form-grid">
              <label className="field-block">
                <span className="field-label">Display name</span>
                <input className="field-input" name="displayName" defaultValue={profile.displayName} maxLength={40} required />
              </label>
              <label className="field-block">
                <span className="field-label">Visibility scope</span>
                <select className="field-select" name="visibilityScope" defaultValue={profile.visibilityScope}>
                  <option value="TENANT_ONLY">Tenant only</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </label>
              <label className="field-block profile-form-wide">
                <span className="field-label">Tagline</span>
                <input className="field-input" name="tagline" defaultValue={profile.tagline} maxLength={120} />
              </label>
              <label className="field-block">
                <span className="field-label">Favorite game</span>
                <select className="field-select" name="favoriteGame" defaultValue={profile.favoriteGame || ""}>
                  <option value="">No preference yet</option>
                  {games.map((game) => (
                    <option key={game.key} value={game.key.toUpperCase()}>
                      {game.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="hero-actions profile-form-actions profile-form-wide">
                <button className="action-link action-link-primary" type="submit">
                  Save profile
                </button>
                <Link className="action-link action-link-secondary" to="/home">
                  Back to home
                </Link>
              </div>
            </Form>
          </div>
        </details>
      </section>

      <section className="summary-grid">
        <article className="summary-card warm-card">
          <p className="eyebrow">🔥 Activity</p>
          <h2 className="section-title">{activity.streakDays} day streak</h2>
          <p>{activity.totalPlayCount} recorded plays</p>
        </article>
        {overall.map((summary) => (
          <article key={summary.period} className="summary-card cool-card">
            <p className="eyebrow">{summary.period === "SEASON" ? "🏆 Season" : "📚 Lifetime"}</p>
            <h2 className="section-title">{summary.totalPoints} pts</h2>
            <p>{summary.currentRank ? `Rank #${summary.currentRank}` : "Unranked"} · {summary.recentPlaySummary}</p>
          </article>
        ))}
      </section>

      <section className="feature-grid">
        <article className="feature-card span-two">
          <div className="section-heading">
            <div>
              <p className="eyebrow">🎯 Best records</p>
              <h2 className="section-title">Per-game performance</h2>
            </div>
          </div>
          <div className="game-grid">
            {games.map((game) => (
              <article key={game.key} className="game-card">
                <div className="game-card-top">
                  <span className="status-badge status-badge-neutral">{game.currentRank ? `Rank #${game.currentRank}` : "Unranked"}</span>
                  <p className="game-points">{game.bestCompetitivePoints} pts</p>
                </div>
                <h3 className="card-title">{game.name}</h3>
                <dl className="stat-grid compact-stat-grid">
                  <div>
                    <dt>Best metric</dt>
                    <dd>{game.personalBestMetric}</dd>
                  </div>
                  <div>
                    <dt>Completed</dt>
                    <dd>{game.completedCount} / {game.playCount}</dd>
                  </div>
                </dl>
                <p className="recommendation-copy">{game.recommendationText}</p>
                <Link className="action-link action-link-secondary" to={`/games/${game.key}`}>
                  Play {game.name}
                </Link>
              </article>
            ))}
          </div>
        </article>

        <article className="feature-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">📈 Growth trend</p>
              <h2 className="section-title">Recent score movement</h2>
            </div>
          </div>
          {trendPath ? (
            <div className="trend-chart-shell">
              <svg viewBox="0 0 100 100" className="trend-chart" preserveAspectRatio="none" aria-label="Recent score trend">
                <path d={trendPath} fill="none" stroke="#173043" strokeWidth="3" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
          ) : (
            <p>No trend data yet.</p>
          )}
          <div className="trend-list">
            {recentTrend.map((item) => (
              <article key={`${item.label}-${item.index}`} className="recent-result-item">
                <div>
                  <strong>{item.gameName}</strong>
                  <p className="compact-copy">{item.label} · {item.status}</p>
                </div>
                <div className="recent-result-meta">
                  <span className="status-badge status-badge-neutral">{item.competitivePoints} pts</span>
                  <span>{item.totalPointsDelta >= 0 ? `+${item.totalPointsDelta}` : item.totalPointsDelta}</span>
                </div>
              </article>
            ))}
          </div>
          {trend.length > 3 ? (
            <details className="disclosure-card">
              <summary>More score movement</summary>
              <div className="trend-list disclosure-body">
                {trend.slice(0, -3).reverse().map((item) => (
                  <article key={`${item.label}-${item.index}`} className="recent-result-item">
                    <div>
                      <strong>{item.gameName}</strong>
                      <p className="compact-copy">{item.label} · {item.status}</p>
                    </div>
                    <div className="recent-result-meta">
                      <span className="status-badge status-badge-neutral">{item.competitivePoints} pts</span>
                      <span>{item.totalPointsDelta >= 0 ? `+${item.totalPointsDelta}` : item.totalPointsDelta}</span>
                    </div>
                  </article>
                ))}
              </div>
            </details>
          ) : null}
        </article>
      </section>
    </div>
  );
}