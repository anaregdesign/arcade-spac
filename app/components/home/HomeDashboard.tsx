import { useAppLocale } from "../../lib/client/usecase/locale/use-app-locale";
import {
  formatHomeMatchCount,
  formatHomeVisibleFavoriteCount,
  getHomeHubCopy,
} from "../../lib/client/usecase/home-hub/home-hub-copy";
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
  const { locale } = useAppLocale();
  const copy = getHomeHubCopy(locale);

  return (
    <section className={["feature-card", styles["home-hub-card"]].join(" ")}>
      <div className={styles["home-hub-toolbar"]} aria-label={copy.discoveryControlsLabel}>
        <label className={["field-block", styles["home-hub-search"]].join(" ")}>
          <span className="field-label">{copy.searchLabel}</span>
          <input
            className="field-input"
            onChange={(event) => setSearch(event.currentTarget.value)}
            placeholder={copy.searchPlaceholder}
            value={search}
          />
        </label>
        <label className={["field-block", styles["home-hub-filter"]].join(" ")}>
          <span className="field-label">{copy.filterLabel}</span>
          <select className="field-select" onChange={(event) => setTag(event.currentTarget.value)} value={tag}>
            {tagOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className={["field-block", styles["home-hub-filter"]].join(" ")}>
          <span className="field-label">{copy.sortLabel}</span>
          <select className="field-select" onChange={(event) => setSort(event.currentTarget.value)} value={sort}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className={["field-block", styles["home-hub-filter"], styles["home-hub-toggle-block"]].join(" ")}>
          <span className="field-label">{copy.favoritesLabel}</span>
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
            {copy.favoritesOnlyLabel}
          </button>
        </label>
      </div>
      <div className={styles["home-hub-meta-row"]}>
        <span className="status-badge status-badge-neutral">{formatHomeMatchCount(locale, matchCount)}</span>
        <span className="status-badge status-badge-neutral">{formatHomeVisibleFavoriteCount(locale, visibleFavoriteCount)}</span>
      </div>
      <div className={["game-grid", styles["home-game-grid"], styles["home-primary-grid"]].join(" ")}>
        {games.map((game) => {
          return (
            <GamePreviewCard
              badges={[game.metricSummary, ...(game.isFavorite ? [copy.savedBadgeLabel] : [])]}
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
          <strong>{favoritesOnly ? copy.emptyFavoritesTitle : copy.emptySearchTitle}</strong>
          <p className="compact-copy">
            {favoritesOnly
              ? copy.emptyFavoritesBody
              : copy.emptySearchBody}
          </p>
          <div className="hero-actions compact-action-strip">
            <button className="action-link action-link-secondary" onClick={clearFilters} type="button">
              {copy.resetFiltersLabel}
            </button>
          </div>
        </article>
      ) : null}
      {hasMore ? (
        <div ref={loadMoreTriggerRef} className="hero-actions compact-actions">
          <button className="action-link action-link-secondary" type="button" onClick={showMore}>
            {copy.showMoreGamesLabel}
          </button>
        </div>
      ) : null}
    </section>
  );
}
