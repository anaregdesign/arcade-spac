import { Link } from "react-router";

import styles from "./HomeDashboard.module.css";

type HomeDashboardProps = {
  games: Array<{
    key: string;
    name: string;
    playCount: number;
    previewAlt: string | null;
    previewObjectPosition?: string;
    previewSrc: string | null;
    recordLabel: string;
    runLabel: string;
    statusLabel: string;
  }>;
  hasMore: boolean;
  loadMoreTriggerRef: (node: HTMLDivElement | null) => void;
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
  visibleRankedCount: number;
  visibleUnplayedCount: number;
};

export function HomeDashboard({
  games,
  hasMore,
  loadMoreTriggerRef,
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
  visibleRankedCount,
  visibleUnplayedCount,
}: HomeDashboardProps) {
  return (
    <section className={["feature-card", styles["home-hub-card"]].join(" ")}>
      <div className={styles["home-hub-toolbar"]} aria-label="Game discovery controls">
        <label className={["field-block", styles["home-hub-search"]].join(" ")}>
          <span className="field-label">Search</span>
          <input
            className="field-input"
            onChange={(event) => setSearch(event.currentTarget.value)}
            placeholder="Find a game or style"
            value={search}
          />
        </label>
        <label className={["field-block", styles["home-hub-filter"]].join(" ")}>
          <span className="field-label">Filter</span>
          <select className="field-select" onChange={(event) => setTag(event.currentTarget.value)} value={tag}>
            {tagOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className={["field-block", styles["home-hub-filter"]].join(" ")}>
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
      <div className={styles["home-hub-meta-row"]}>
        <span className="status-badge status-badge-neutral">{matchCount} games</span>
        <span className="status-badge status-badge-neutral">{visibleUnplayedCount} visible unplayed</span>
        <span className="status-badge status-badge-neutral">{visibleRankedCount} visible ranked</span>
      </div>
      <div className={["game-grid", styles["home-game-grid"], styles["home-primary-grid"]].join(" ")}>
        {games.map((game) => {
          return (
            <article key={game.key} className={["game-card", styles["home-game-card"]].join(" ")}>
              <Link
                aria-label={`Open ${game.name}`}
                className={styles["game-preview-link"]}
                to={`/games/${game.key}`}
              >
                <div className={styles["game-preview-frame"]}>
                  {game.previewSrc && game.previewAlt ? (
                    <img
                      alt={game.previewAlt}
                      className={styles["game-preview-image"]}
                      loading="lazy"
                      src={game.previewSrc}
                      style={{ objectPosition: game.previewObjectPosition ?? "center center" }}
                    />
                  ) : (
                    <div className={styles["game-preview-fallback"]} aria-hidden="true">
                      <span>{game.name.slice(0, 2).toUpperCase()}</span>
                    </div>
                  )}
                </div>
              </Link>
              <div className={styles["home-card-body"]}>
                <div className={styles["home-card-status-row"]}>
                  <span className="status-badge status-badge-neutral">{game.statusLabel}</span>
                  <span className="status-badge status-badge-neutral">{game.recordLabel}</span>
                </div>
                <div className={styles["home-card-heading"]}>
                  <h3 className="card-title">{game.name}</h3>
                  <span className={styles["home-card-kicker"]}>{game.runLabel}</span>
                </div>
                <Link className={["action-link", "action-link-primary", styles["home-card-action"]].join(" ")} to={`/games/${game.key}`}>
                  Play
                </Link>
              </div>
            </article>
          );
        })}
      </div>
      {games.length === 0 ? (
        <article className="latest-result-card home-empty-state">
          <strong>No games match this search</strong>
          <p className="compact-copy">Try a broader search or switch the filter so the game grid can come back into view.</p>
        </article>
      ) : null}
      {hasMore ? (
        <div ref={loadMoreTriggerRef} className="hero-actions compact-actions">
          <button className="action-link action-link-secondary" type="button" onClick={showMore}>
            Show more games
          </button>
        </div>
      ) : null}
    </section>
  );
}
