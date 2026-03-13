import { Link } from "react-router";

type RankingsScreenProps = {
  filter: {
    period: "SEASON" | "LIFETIME";
    scope: "overall" | "minesweeper" | "sudoku";
  };
  boardMeta: {
    boardLabel: string;
    periodLabel: string;
    visibilityNote: string;
  };
  games: Array<{
    key: string;
    name: string;
  }>;
  currentUserEntry: {
    rank: number;
    points: number;
    deltaToLeader: number | null;
    deltaToNext: number | null;
    gameName: string;
    leaderGapCopy: string;
    rivalGapCopy: string;
  } | null;
  entries: Array<{
    id: string;
    rank: number;
    displayName: string;
    points: number;
    deltaToLeader: number | null;
    deltaToNext: number | null;
    gameName: string;
    isCurrentUser: boolean;
    isNearbyRival: boolean;
    leaderGapCopy: string;
    rivalGapCopy: string;
    leaderGapValue: string;
    rivalGapValue: string;
  }>;
};

type RankingScope = RankingsScreenProps["filter"]["scope"];

function buildRankingsHref(period: "SEASON" | "LIFETIME", scope: "overall" | "minesweeper" | "sudoku") {
  return `/rankings?period=${period.toLowerCase()}&scope=${scope}`;
}

export function RankingsScreen({ filter, boardMeta, games, currentUserEntry, entries }: RankingsScreenProps) {
  const scopes = [
    { key: "overall" as RankingScope, label: "Overall" },
    ...games.map((game) => ({ key: game.key as RankingScope, label: game.name })),
  ];
  const periods = [
    { key: "SEASON", label: "Season" },
    { key: "LIFETIME", label: "Lifetime" },
  ] as const;

  return (
    <div className="dashboard-stack">
      <section className="feature-card workspace-card rankings-shell-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Board switch</p>
            <h2 className="section-title">Standings</h2>
          </div>
          <Link className="action-link action-link-secondary" to="/home">
            Back to home
          </Link>
        </div>
        <div className="filter-stack">
          <div className="pill-row">
            {scopes.map((scope) => (
              <Link
                key={scope.key}
                className={filter.scope === scope.key ? "filter-pill filter-pill-active" : "filter-pill"}
                to={buildRankingsHref(filter.period, scope.key)}
              >
                {scope.label}
              </Link>
            ))}
          </div>
          <div className="pill-row">
            {periods.map((period) => (
              <Link
                key={period.key}
                className={filter.period === period.key ? "filter-pill filter-pill-active" : "filter-pill"}
                to={buildRankingsHref(period.key, filter.scope)}
              >
                {period.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="help-inline-grid compact-copy rankings-context-copy">
          <p><strong>Viewing:</strong> {boardMeta.periodLabel} / {boardMeta.boardLabel}. Your row stays highlighted and the rows nearest to you stay marked as rivals.</p>
          <p><strong>Display names:</strong> {boardMeta.visibilityNote}</p>
        </div>
      </section>

      <section className="summary-grid">
        <article className="summary-card warm-card">
          <p className="eyebrow">You</p>
          <h2 className="section-title">{currentUserEntry ? `#${currentUserEntry.rank}` : "Unranked"}</h2>
          <p>{currentUserEntry ? `${currentUserEntry.points} pts on ${boardMeta.boardLabel}` : "No rank yet"}</p>
        </article>
        <article className="summary-card cool-card">
          <p className="eyebrow">Leader gap</p>
          <h2 className="section-title">{currentUserEntry?.deltaToLeader ?? 0}</h2>
          <p>{currentUserEntry ? currentUserEntry.leaderGapCopy : "No comparison yet."}</p>
        </article>
        <article className="summary-card neutral-card">
          <p className="eyebrow">Next gap</p>
          <h2 className="section-title">{currentUserEntry?.deltaToNext ?? 0}</h2>
          <p>{currentUserEntry ? currentUserEntry.rivalGapCopy : "No rival yet"}</p>
        </article>
      </section>

      <section className="feature-card rankings-shell-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Leaderboard</p>
            <h2 className="section-title">{filter.scope === "overall" ? "Overall ranking" : "Game ranking"}</h2>
          </div>
        </div>
        <details className="disclosure-card">
          <summary>Play</summary>
          <div className="hero-actions disclosure-body compact-actions">
            {games.map((game) => (
              <Link key={game.key} className="action-link action-link-secondary" to={`/games/${game.key}`}>
                Play {game.name}
              </Link>
            ))}
          </div>
        </details>
        <div className="rankings-list" role="list">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className={entry.isCurrentUser ? "ranking-row ranking-row-active" : entry.isNearbyRival ? "ranking-row ranking-row-rival" : "ranking-row"}
              role="listitem"
            >
              <div className="ranking-main">
                <div className="ranking-name-block">
                  <p className="ranking-rank">#{entry.rank}</p>
                  <h3 className="card-title">{entry.displayName}</h3>
                  <div className="ranking-inline-meta">
                    {entry.isCurrentUser ? <span className="status-badge status-badge-neutral">You</span> : null}
                    {entry.isNearbyRival ? <span className="status-badge status-badge-pending">Rival</span> : null}
                    <span className="ranking-meta-copy">{entry.gameName}</span>
                  </div>
                </div>
                <div className="ranking-points">
                  <strong>{entry.points}</strong>
                  <span>pts</span>
                </div>
              </div>
              <dl className="ranking-gap-grid">
                <div>
                  <dt>Leader gap</dt>
                  <dd>{entry.leaderGapValue}</dd>
                </div>
                <div>
                  <dt>Nearest rival</dt>
                  <dd>{entry.rivalGapValue}</dd>
                </div>
              </dl>
              <p className="ranking-meta-copy">{entry.leaderGapCopy} {entry.rivalGapCopy}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
