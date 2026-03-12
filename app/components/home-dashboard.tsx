import { Link } from "react-router";

type HomeDashboardProps = {
  user: {
    displayName: string;
    avatarUrl?: string | null;
    tagline: string;
    streakDays: number;
    totalPlayCount: number;
  };
  summaries: {
    seasonPoints: number;
    seasonRank: number | null;
    lifetimePoints: number;
    trendDelta: number;
    recentPlaySummary: string;
  };
  games: Array<{
    key: string;
    name: string;
    shortDescription: string;
    accentColor: string;
    currentRank: number | null;
    bestCompetitivePoints: number;
    personalBestMetric: number | null;
    playCount: number;
    completedCount: number;
    recommendationText: string | null;
    metricLabel: string;
    metricValue: string;
  }>;
  recentResults: Array<{
    id: string;
    gameName: string;
    status: string;
    summaryText: string;
    resultPath: string;
    totalPointsDelta: number;
    startedAt: string;
  }>;
};

export function HomeDashboard({ user, summaries, games, recentResults }: HomeDashboardProps) {
  return (
    <div className="dashboard-stack">
      <section className="summary-grid" aria-label="Summary cards">
        <article className="summary-card warm-card">
          <p className="eyebrow">Season standing</p>
          <h2 className="section-title">{summaries.seasonRank ? `#${summaries.seasonRank}` : "Unranked"}</h2>
          <p>{summaries.seasonPoints} total points</p>
        </article>
        <article className="summary-card cool-card">
          <p className="eyebrow">Momentum</p>
          <h2 className="section-title">{summaries.trendDelta >= 0 ? `+${summaries.trendDelta}` : summaries.trendDelta}</h2>
          <p>{summaries.recentPlaySummary}</p>
        </article>
        <article className="summary-card neutral-card">
          <p className="eyebrow">Activity</p>
          <h2 className="section-title">{user.streakDays} day streak</h2>
          <p>{user.totalPlayCount} total recorded plays</p>
        </article>
      </section>

      <section className="feature-grid">
        <article className="feature-card span-two">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Next play</p>
              <h2 className="section-title">Choose a game</h2>
            </div>
            <Link className="action-link action-link-secondary" to="/rankings">
              View rankings
            </Link>
          </div>
          <div className="game-grid">
            {games.map((game) => (
              <article key={game.key} className="game-card" style={{ borderColor: `${game.accentColor}33` }}>
                <div className="game-card-top">
                  <span className="status-badge" style={{ backgroundColor: `${game.accentColor}22`, color: game.accentColor }}>
                    {game.currentRank ? `Rank #${game.currentRank}` : "Unranked"}
                  </span>
                  <p className="game-points">{game.bestCompetitivePoints} pts</p>
                </div>
                <h3 className="card-title">{game.name}</h3>
                <p>{game.shortDescription}</p>
                <dl className="stat-grid compact-stat-grid">
                  <div>
                    <dt>{game.metricLabel}</dt>
                    <dd>{game.metricValue}</dd>
                  </div>
                  <div>
                    <dt>Completed runs</dt>
                    <dd>{game.completedCount} / {game.playCount}</dd>
                  </div>
                </dl>
                <p className="recommendation-copy">{game.recommendationText ?? "Play again to improve your total score."}</p>
                <Link className="action-link action-link-primary" to={`/games/${game.key}`}>
                  Open {game.name}
                </Link>
              </article>
            ))}
          </div>
        </article>

        <article className="feature-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Recent results</p>
              <h2 className="section-title">Latest activity</h2>
            </div>
          </div>
          <div className="recent-results-list">
            {recentResults.map((result) => (
              <article key={result.id} className="recent-result-item">
                <div>
                  <strong>{result.gameName}</strong>
                  <p>{result.summaryText}</p>
                  <Link className="inline-link" to={result.resultPath}>
                    Open result
                  </Link>
                </div>
                <div className="recent-result-meta">
                  <span className={result.status === "PENDING_SAVE" ? "status-badge status-badge-pending" : "status-badge status-badge-neutral"}>{result.status}</span>
                  <span>{result.totalPointsDelta >= 0 ? `+${result.totalPointsDelta}` : result.totalPointsDelta} pts</span>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}