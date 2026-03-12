import { Link } from "react-router";

type RankingsScreenProps = {
  filter: {
    period: "SEASON" | "LIFETIME";
    scope: "overall" | "minesweeper" | "sudoku";
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
  }>;
};

type RankingScope = RankingsScreenProps["filter"]["scope"];

function buildRankingsHref(period: "SEASON" | "LIFETIME", scope: "overall" | "minesweeper" | "sudoku") {
  return `/rankings?period=${period.toLowerCase()}&scope=${scope}`;
}

export function RankingsScreen({ filter, games, currentUserEntry, entries }: RankingsScreenProps) {
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
            <p className="eyebrow">Filters</p>
            <h2 className="section-title">Track your current standing</h2>
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
      </section>

      <section className="summary-grid">
        <article className="summary-card warm-card">
          <p className="eyebrow">Your position</p>
          <h2 className="section-title">{currentUserEntry ? `#${currentUserEntry.rank}` : "Unranked"}</h2>
          <p>{currentUserEntry ? `${currentUserEntry.points} competitive points` : "Play ranked runs to enter the board."}</p>
        </article>
        <article className="summary-card cool-card">
          <p className="eyebrow">Gap to leader</p>
          <h2 className="section-title">{currentUserEntry?.deltaToLeader ?? 0}</h2>
          <p>{currentUserEntry ? `${currentUserEntry.gameName} leaderboard` : "No comparison yet."}</p>
        </article>
        <article className="summary-card neutral-card">
          <p className="eyebrow">Gap to next</p>
          <h2 className="section-title">{currentUserEntry?.deltaToNext ?? 0}</h2>
          <p>{currentUserEntry ? "Use this to choose your next run." : "No adjacent rival yet."}</p>
        </article>
      </section>

      <section className="feature-card rankings-shell-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Leaderboard</p>
            <h2 className="section-title">{filter.scope === "overall" ? "Overall ranking" : "Game ranking"}</h2>
          </div>
          <div className="hero-actions compact-actions">
            {games.map((game) => (
              <Link key={game.key} className="action-link action-link-secondary" to={`/games/${game.key}`}>
                Play {game.name}
              </Link>
            ))}
          </div>
        </div>
        <div className="rankings-list" role="list">
          {entries.map((entry) => (
            <article key={entry.id} className={entry.isCurrentUser ? "ranking-row ranking-row-active" : "ranking-row"} role="listitem">
              <div className="ranking-main">
                <div>
                  <p className="ranking-rank">#{entry.rank}</p>
                  <h3 className="card-title">{entry.displayName}</h3>
                </div>
                <div className="ranking-points">
                  <strong>{entry.points}</strong>
                  <span>pts</span>
                </div>
              </div>
              <dl className="stat-grid compact-stat-grid">
                <div>
                  <dt>Gap to leader</dt>
                  <dd>{entry.deltaToLeader ?? 0}</dd>
                </div>
                <div>
                  <dt>Gap to next</dt>
                  <dd>{entry.deltaToNext ?? 0}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}