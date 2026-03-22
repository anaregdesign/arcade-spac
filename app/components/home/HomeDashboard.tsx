import { FavoriteToggle } from "../shared/FavoriteToggle";
import { GamePreviewCard } from "../shared/GamePreviewCard";
import styles from "./HomeDashboard.module.css";

type HomeDashboardProps = {
  clearFilters: () => void;
  favoritesOnly: boolean;
  games: Array<{
    isFavorite: boolean;
    key: string;
    metricSummary: string;
    name: string;
    playCount: number;
    previewAlt: string | null;
    previewObjectPosition?: string;
    previewSrc: string | null;
    runLabel: string;
    shortDescription: string;
  }>;
  hasMore: boolean;
  loadMoreTriggerRef: (node: HTMLDivElement | null) => void;
  matchCount: number;
  search: string;
  showMore: () => void;
  setFavoritesOnly: (nextValue: boolean) => void;
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
  visibleFavoriteCount: number;
};

export function HomeDashboard({
  clearFilters,
  favoritesOnly,
  games,
  hasMore,
  loadMoreTriggerRef,
  matchCount,
  search,
  showMore,
  setFavoritesOnly,
  setSearch,
  setSort,
  setTag,
  sort,
  sortOptions,
  tag,
  tagOptions,
  visibleFavoriteCount,
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
        <label className={["field-block", styles["home-hub-filter"], styles["home-hub-toggle-block"]].join(" ")}>
          <span className="field-label">Favorites</span>
          <button
            aria-pressed={favoritesOnly}
            className={[
              "action-link",
              favoritesOnly ? "action-link-primary" : "action-link-secondary",
              styles["home-hub-toggle"],
            ].join(" ")}
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            type="button"
          >
            Favorites only
          </button>
        </label>
      </div>
      <div className={styles["home-hub-meta-row"]}>
        <span className="status-badge status-badge-neutral">{matchCount} games</span>
        <span className="status-badge status-badge-neutral">{visibleFavoriteCount} visible favorites</span>
      </div>
      <div className={["game-grid", styles["home-game-grid"], styles["home-primary-grid"]].join(" ")}>
        {games.map((game) => {
          return (
            <GamePreviewCard
              badges={[game.metricSummary, ...(game.isFavorite ? ["Saved"] : [])]}
              className={styles["home-game-card"]}
              description={game.shortDescription}
              gameKey={game.key}
              headerAction={<FavoriteToggle compact gameKey={game.key} gameName={game.name} isFavorite={game.isFavorite} />}
              key={game.key}
              kicker={game.runLabel}
              name={game.name}
              previewAlt={game.previewAlt}
              previewObjectPosition={game.previewObjectPosition}
              previewSrc={game.previewSrc}
            />
          );
        })}
      </div>
      {games.length === 0 ? (
        <article className="latest-result-card home-empty-state">
          <strong>{favoritesOnly ? "No favorite games match this view" : "No games match this search"}</strong>
          <p className="compact-copy">
            {favoritesOnly
              ? "Try a broader search or turn off Favorites only so the full catalog comes back into view."
              : "Try a broader search or switch the filter so the game grid can come back into view."}
          </p>
          <div className="hero-actions compact-action-strip">
            <button className="action-link action-link-secondary" onClick={clearFilters} type="button">
              Reset filters
            </button>
          </div>
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
