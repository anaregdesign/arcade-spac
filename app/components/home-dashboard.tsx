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
  games: Array<{
    key: string;
    metricLabel: string;
    metricValue: string;
    name: string;
    playCount: number;
    recommendationText: string | null;
    shortDescription: string;
    currentRank: number | null;
  }>;
  hasMore: boolean;
  highlightedGame: {
    key: string;
    name: string;
  } | null;
  matchCount: number;
  recentResults: Array<{
    id: string;
    gameName: string;
    status: string;
    summaryText: string;
    resultPath: string;
    totalPointsDelta: number;
  }>;
  search: string;
  showMore: () => void;
  setSearch: (nextValue: string) => void;
  setSort: (nextValue: string) => void;
  setTag: (nextValue: string) => void;
  sort: string;
  sortOptions: Array<{
    label: string;
    value: string;
  }>;
  summaries: {
    seasonPoints: number;
    seasonRank: number | null;
    trendDelta: number;
  };
  tag: string;
  tagOptions: Array<{
    label: string;
    value: string;
  }>;
  user: {
    streakDays: number;
    totalPlayCount: number;
  };
};

export function HomeDashboard({
  games,
  hasMore,
  highlightedGame,
  matchCount,
  recentResults,
  search,
  showMore,
  setSearch,
  setSort,
  setTag,
  sort,
  sortOptions,
  summaries,
  tag,
  tagOptions,
  user,
}: HomeDashboardProps) {
  const latestResult = recentResults[0] ?? null;

  return (
    <div className="dashboard-stack home-hub-stack">
      <section className="feature-card home-hub-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">🎯 Game selection</p>
            <h2 className="section-title">Choose your next board</h2>
          </div>
          {highlightedGame ? (
            <Link className="action-link action-link-primary" to={`/games/${highlightedGame.key}`}>
              Start with {highlightedGame.name}
            </Link>
          ) : null}
        </div>
        <p className="compact-copy">Search or filter first, then jump straight into the next game. Rankings and profile stay available from the shared header when you need them.</p>
        <div className="home-hub-toolbar" aria-label="Game discovery controls">
          <label className="field-block home-hub-search">
            <span className="field-label">Search</span>
            <input
              className="field-input"
              onChange={(event) => setSearch(event.currentTarget.value)}
              placeholder="Find a game, style, or recommendation"
              value={search}
            />
          </label>
          <label className="field-block home-hub-filter">
            <span className="field-label">Filter</span>
            <select className="field-select" onChange={(event) => setTag(event.currentTarget.value)} value={tag}>
              {tagOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field-block home-hub-filter">
            <span className="field-label">Sort</span>
            <select className="field-select" onChange={(event) => setSort(event.currentTarget.value)} value={sort}>
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="home-hub-meta-row">
          <span className="status-badge status-badge-neutral">{matchCount} games</span>
          <span className="status-badge status-badge-neutral">{games.filter((game) => game.playCount === 0).length} visible unplayed</span>
          <span className="status-badge status-badge-neutral">{games.filter((game) => game.currentRank).length} visible ranked</span>
        </div>
        <div className="game-grid home-game-grid home-primary-grid">
          {games.map((game) => (
            <article key={game.key} className="game-card home-game-card">
              <div className="game-card-top">
                <span className="game-icon-chip" aria-hidden="true">{getGameEmoji(game.key)}</span>
                <span className="status-badge status-badge-neutral">
                  {game.currentRank ? `Rank #${game.currentRank}` : game.playCount > 0 ? "Played" : "New"}
                </span>
              </div>
              <div>
                <h3 className="card-title">{game.name}</h3>
                <p className="compact-copy">{game.shortDescription}</p>
              </div>
              <div className="home-card-meta">
                <span>{game.metricLabel}: {game.metricValue}</span>
                <span>{game.playCount > 0 ? `${game.playCount} runs` : "First run ready"}</span>
              </div>
              <div className="game-card-footer home-card-footer">
                <p className="recommendation-copy">{game.recommendationText ?? "Open and start immediately."}</p>
                <Link className="action-link action-link-primary" to={`/games/${game.key}`}>
                  Play {game.name}
                </Link>
              </div>
            </article>
          ))}
        </div>
        {games.length === 0 ? (
          <article className="latest-result-card home-empty-state">
            <strong>No games match this search</strong>
            <p className="compact-copy">Try a broader search or switch the filter so the game grid can come back into view.</p>
          </article>
        ) : null}
        {hasMore ? (
          <div className="hero-actions compact-actions">
            <button className="action-link action-link-secondary" type="button" onClick={showMore}>
              Show more games
            </button>
          </div>
        ) : null}
      </section>

      <section className="feature-grid home-secondary-grid">
        <article className="feature-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">📌 Quick context</p>
              <h2 className="section-title">Current standing</h2>
            </div>
          </div>
          <div className="summary-grid home-secondary-summary">
            <article className="summary-card warm-card">
              <p className="eyebrow">🏆 Season</p>
              <h2 className="section-title">{summaries.seasonRank ? `#${summaries.seasonRank}` : "Unranked"}</h2>
              <p>{summaries.seasonPoints} pts</p>
            </article>
            <article className="summary-card cool-card">
              <p className="eyebrow">📈 Trend</p>
              <h2 className="section-title">{summaries.trendDelta >= 0 ? `+${summaries.trendDelta}` : summaries.trendDelta}</h2>
              <p>Recent movement</p>
            </article>
            <article className="summary-card neutral-card">
              <p className="eyebrow">🔥 Activity</p>
              <h2 className="section-title">{user.streakDays} day streak</h2>
              <p>{user.totalPlayCount} recorded runs</p>
            </article>
          </div>
        </article>

        <article className="feature-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">🕒 Latest result</p>
              <h2 className="section-title">Most recent run</h2>
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
              <p className="compact-copy">Pick a game above and record a first result to unlock rankings, result history, and profile trends.</p>
            </article>
          )}
          {recentResults.length > 1 ? (
            <details className="disclosure-card">
              <summary>More recent results</summary>
              <div className="recent-results-list disclosure-body">
                {recentResults.slice(1).map((result) => (
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
