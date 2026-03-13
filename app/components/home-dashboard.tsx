import { Link } from "react-router";

function getGameEmoji(gameKey: string) {
  switch (gameKey) {
    case "minesweeper":
      return "MS";
    case "sudoku":
      return "SU";
    default:
      return "AR";
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
  tag: string;
  tagOptions: Array<{
    label: string;
    value: string;
  }>;
};

export function HomeDashboard({
  games,
  hasMore,
  highlightedGame,
  matchCount,
  search,
  showMore,
  setSearch,
  setSort,
  setTag,
  sort,
  sortOptions,
  tag,
  tagOptions,
}: HomeDashboardProps) {
  return (
    <section className="feature-card home-hub-card">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Game selection</p>
          <h2 className="section-title">Choose your next board</h2>
        </div>
        {highlightedGame ? (
          <Link className="action-link action-link-primary" to={`/games/${highlightedGame.key}`}>
            Start with {highlightedGame.name}
          </Link>
        ) : null}
      </div>
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
  );
}
