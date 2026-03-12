import { Link } from "react-router";

function getGameEmoji(gameKey: string) {
  switch (gameKey) {
    case "minesweeper":
      return "💣";
    case "sudoku":
      return "🔢";
    default:
      return "🎮";
  }
}

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
  const featuredGames = games.slice(0, 2);
  const latestResult = recentResults[0] ?? null;
  const remainingResults = recentResults.slice(1, 5);

  return (
    <div className="dashboard-stack">
      <section className="summary-grid" aria-label="Summary cards">
        <article className="summary-card warm-card">
          <p className="eyebrow">🏆 Season</p>
          <h2 className="section-title">{summaries.seasonRank ? `#${summaries.seasonRank}` : "Unranked"}</h2>
          <p>{summaries.seasonPoints} pts</p>
        </article>
        <article className="summary-card cool-card">
          <p className="eyebrow">📈 Momentum</p>
          <h2 className="section-title">{summaries.trendDelta >= 0 ? `+${summaries.trendDelta}` : summaries.trendDelta}</h2>
          <p>{summaries.recentPlaySummary}</p>
        </article>
        <article className="summary-card neutral-card">
          <p className="eyebrow">🔥 Activity</p>
          <h2 className="section-title">{user.streakDays} day streak</h2>
          <p>{user.totalPlayCount} recorded runs</p>
        </article>
      </section>

      <section className="feature-grid">
        <article className="feature-card span-two">
          <div className="section-heading">
            <div>
              <p className="eyebrow">🎯 Next play</p>
              <h2 className="section-title">Pick a board and go</h2>
            </div>
            <div className="hero-actions compact-actions">
              <Link className="action-link action-link-primary" to={`/games/${featuredGames[0]?.key ?? games[0]?.key ?? "minesweeper"}`}>
                Play now
              </Link>
              <Link className="action-link action-link-secondary" to="/rankings">
                Open board
              </Link>
            </div>
          </div>
          <div className="game-grid home-game-grid">
            {games.map((game) => (
              <article key={game.key} className="game-card" style={{ borderColor: `${game.accentColor}33` }}>
                <div className="game-card-top">
                  <span className="game-icon-chip" aria-hidden="true">{getGameEmoji(game.key)}</span>
                  <span className="status-badge" style={{ backgroundColor: `${game.accentColor}22`, color: game.accentColor }}>
                    {game.currentRank ? `Rank #${game.currentRank}` : "Unranked"}
                  </span>
                </div>
                <div>
                  <h3 className="card-title">{game.name}</h3>
                  <p className="compact-copy">{game.shortDescription}</p>
                </div>
                <dl className="stat-grid compact-stat-grid">
                  <div>
                    <dt>{game.metricLabel}</dt>
                    <dd>{game.metricValue}</dd>
                  </div>
                  <div>
                    <dt>Score</dt>
                    <dd>{game.bestCompetitivePoints} pts</dd>
                  </div>
                  <div>
                    <dt>Clears</dt>
                    <dd>{game.completedCount} / {game.playCount}</dd>
                  </div>
                  <div>
                    <dt>Focus</dt>
                    <dd>{game.currentRank ? `#${game.currentRank}` : "First run"}</dd>
                  </div>
                </dl>
                <div className="game-card-footer">
                  <p className="recommendation-copy">{game.recommendationText ?? "Play again to improve your total score."}</p>
                  <Link className="action-link action-link-primary" to={`/games/${game.key}`}>
                    Open {game.name}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="feature-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">🧭 Right now</p>
              <h2 className="section-title">Keep context light</h2>
            </div>
          </div>
          {latestResult ? (
            <article className="latest-result-card">
              <div className="latest-result-head">
                <strong>{latestResult.gameName}</strong>
                <span className={latestResult.status === "PENDING_SAVE" ? "status-badge status-badge-pending" : "status-badge status-badge-neutral"}>{latestResult.status}</span>
              </div>
              <p className="compact-copy">{latestResult.summaryText}</p>
              <div className="inline-stat-row">
                <span>{latestResult.totalPointsDelta >= 0 ? `+${latestResult.totalPointsDelta}` : latestResult.totalPointsDelta} pts</span>
                <Link className="inline-link" to={latestResult.resultPath}>
                  Open result
                </Link>
              </div>
            </article>
          ) : (
            <article className="latest-result-card">
              <strong>No runs yet</strong>
              <p className="compact-copy">Start with either board and the latest result will appear here.</p>
            </article>
          )}
          {remainingResults.length > 0 ? (
            <details className="disclosure-card">
              <summary>More recent activity</summary>
              <div className="recent-results-list disclosure-body">
                {remainingResults.map((result) => (
                  <article key={result.id} className="recent-result-item">
                    <div>
                      <strong>{result.gameName}</strong>
                      <p className="compact-copy">{result.summaryText}</p>
                    </div>
                    <div className="recent-result-meta">
                      <span>{result.totalPointsDelta >= 0 ? `+${result.totalPointsDelta}` : result.totalPointsDelta} pts</span>
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