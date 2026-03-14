import { Link } from "react-router";

import { useRankingsScreen } from "../../lib/client/usecase/rankings-screen/use-rankings-screen";
import type { GameKey } from "../../lib/domain/entities/game-catalog";
import { SummaryCard } from "../shared/SummaryCard";
import styles from "./RankingsScreen.module.css";

type RankingsScreenProps = {
  filter: {
    period: "SEASON" | "LIFETIME";
    scope: "overall" | GameKey;
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

export function RankingsScreen({ filter, boardMeta, games, currentUserEntry, entries }: RankingsScreenProps) {
  const screen = useRankingsScreen({ filter, games });

  return (
    <div className="dashboard-stack">
      <section className={["feature-card", styles["rankings-shell-card"]].join(" ")}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Board switch</p>
            <h2 className="section-title">Standings</h2>
          </div>
          <Link className="action-link action-link-secondary" to="/home">
            Back to home
          </Link>
        </div>
        <div className={styles["filter-stack"]}>
          <div className={styles["pill-row"]}>
            {screen.scopes.map((scope) => (
              <Link
                key={scope.key}
                className={filter.scope === scope.key ? [styles["filter-pill"], styles["filter-pill-active"]].join(" ") : styles["filter-pill"]}
                to={scope.href}
              >
                {scope.label}
              </Link>
            ))}
          </div>
          <div className={styles["pill-row"]}>
            {screen.periods.map((period) => (
              <Link
                key={period.key}
                className={filter.period === period.key ? [styles["filter-pill"], styles["filter-pill-active"]].join(" ") : styles["filter-pill"]}
                to={period.href}
              >
                {period.label}
              </Link>
            ))}
          </div>
        </div>
        <div className={["help-inline-grid", "compact-copy", styles["rankings-context-copy"]].join(" ")}>
          <p><strong>Viewing:</strong> {boardMeta.periodLabel} / {boardMeta.boardLabel}. Your row stays highlighted and the rows nearest to you stay marked as rivals.</p>
          <p><strong>Display names:</strong> {boardMeta.visibilityNote}</p>
        </div>
      </section>

      <section className="summary-grid">
        <SummaryCard
          description={currentUserEntry ? `${currentUserEntry.points} pts on ${boardMeta.boardLabel}` : "No rank yet"}
          eyebrow="You"
          title={currentUserEntry ? `#${currentUserEntry.rank}` : "Unranked"}
          tone="warm"
        />
        <SummaryCard
          description={currentUserEntry ? currentUserEntry.leaderGapCopy : "No comparison yet."}
          eyebrow="Leader gap"
          title={currentUserEntry?.deltaToLeader ?? 0}
          tone="cool"
        />
        <SummaryCard
          description={currentUserEntry ? currentUserEntry.rivalGapCopy : "No rival yet"}
          eyebrow="Next gap"
          title={currentUserEntry?.deltaToNext ?? 0}
          tone="neutral"
        />
      </section>

      <section className={["feature-card", styles["rankings-shell-card"]].join(" ")}>
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
        <div className={styles["rankings-list"]} role="list">
          {entries.map((entry) => (
            <article
              key={entry.id}
              className={entry.isCurrentUser
                ? [styles["ranking-row"], styles["ranking-row-active"]].join(" ")
                : entry.isNearbyRival
                  ? [styles["ranking-row"], styles["ranking-row-rival"]].join(" ")
                  : styles["ranking-row"]}
              role="listitem"
            >
              <div className={styles["ranking-main"]}>
                <div className={styles["ranking-name-block"]}>
                  <p className={styles["ranking-rank"]}>#{entry.rank}</p>
                  <h3 className="card-title">{entry.displayName}</h3>
                  <div className={styles["ranking-inline-meta"]}>
                    {entry.isCurrentUser ? <span className="status-badge status-badge-neutral">You</span> : null}
                    {entry.isNearbyRival ? <span className="status-badge status-badge-pending">Rival</span> : null}
                    <span className={styles["ranking-meta-copy"]}>{entry.gameName}</span>
                  </div>
                </div>
                <div className={styles["ranking-points"]}>
                  <strong>{entry.points}</strong>
                  <span>pts</span>
                </div>
              </div>
              <dl className={styles["ranking-gap-grid"]}>
                <div>
                  <dt>Leader gap</dt>
                  <dd>{entry.leaderGapValue}</dd>
                </div>
                <div>
                  <dt>Nearest rival</dt>
                  <dd>{entry.rivalGapValue}</dd>
                </div>
              </dl>
              <p className={styles["ranking-meta-copy"]}>{entry.leaderGapCopy} {entry.rivalGapCopy}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}