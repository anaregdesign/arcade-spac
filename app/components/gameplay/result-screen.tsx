import { Form, Link } from "react-router";

import { useResultScreen } from "../../lib/client/usecase/result-screen/use-result-screen";
import sharedStyles from "../games/shared/GameWorkspaceShared.module.css";
import styles from "./result-screen.module.css";

type ResultScreenProps = {
  result: {
    id: string;
    viewerMode: "owner" | "shared";
    status: string;
    statusLabel: string;
    difficulty: string;
    summaryText: string;
    primaryMetricLabel: string;
    primaryMetric: string;
    supportMetricLabel: string;
    supportMetricValue: string;
    supportMetricNote: string;
    selfBestBadge: string;
    selfBestDeltaLabel: string;
    selfBestDetail: string;
    competitivePoints: number;
    impact: {
      gameRank: {
        value: string;
        note: string;
      };
      totalPoints: {
        value: string;
        note: string;
      };
      overallRank: {
        value: string;
        note: string;
      };
    };
    stateExplanation: string | null;
    gameKey: string;
    gameName: string;
    shareUrl: string;
    shareText: string;
    shareAvailabilityNote: string;
    canShare: boolean;
    rankingsHref: string;
  };
};

export function ResultScreen({ result }: ResultScreenProps) {
  const screen = useResultScreen(result);

  return (
    <div className="dashboard-stack">
      <section className={["feature-card", sharedStyles["workspace-card"], styles["result-hero-card"]].join(" ")}>
        <div className={["section-heading", styles["result-meta-heading"]].join(" ")}>
          <div>
            <p className="eyebrow">Result</p>
            <h2 className="section-title">{result.gameName} {result.difficulty.toLowerCase()}</h2>
          </div>
          <div className={styles["result-badge-row"]}>
            <span className={screen.statusBadgeClass}>{result.statusLabel}</span>
            <span className="status-badge status-badge-neutral">{result.selfBestBadge}</span>
          </div>
        </div>
        <div className={styles["result-score-stage"]} aria-label="Primary score">
          <p className={styles["result-score-label"]}>{result.primaryMetricLabel}</p>
          <p className={styles["result-score-value"]}>{result.primaryMetric}</p>
          {screen.compactStateCopy ? <p className={styles["result-state-inline"]}>{screen.compactStateCopy}</p> : null}
        </div>
        <dl className={styles["result-quick-grid"]} aria-label="Score summary">
          {screen.quickStats.map((item) => (
            <div key={item.label} className={styles["result-quick-item"]}>
              <dt>{item.label}</dt>
              <dd>{item.value}</dd>
            </div>
          ))}
        </dl>
        <div className={["hero-actions", "compact-action-strip", styles["result-primary-actions"]].join(" ")}>
          <Link className="action-link action-link-primary" to={`/games/${result.gameKey}`}>
            <span aria-hidden="true" className="action-link-icon-mark">↺</span>
            <span>Replay {result.gameName}</span>
          </Link>
          <Link
            aria-label="Open rankings"
            className="action-link action-link-secondary action-link-icon"
            title="Open rankings"
            to={result.rankingsHref}
          >
            <span aria-hidden="true" className="action-link-icon-mark">🏆</span>
          </Link>
          {result.viewerMode === "owner"
            ? result.canShare ? (
              <a className="action-link action-link-secondary" href={screen.teamsShareHref} target="_blank" rel="noreferrer">
                <span aria-hidden="true" className="action-link-icon-mark">⇪</span>
                <span>Share to Teams</span>
              </a>
            ) : (
              <span className="action-link action-link-secondary action-link-disabled" aria-disabled="true">
                <span aria-hidden="true" className="action-link-icon-mark">⇪</span>
                <span>Share to Teams</span>
              </span>
            )
            : null}
          <Link
            aria-label="Back to home"
            className="action-link action-link-secondary action-link-icon"
            title="Back to home"
            to="/home"
          >
            <span aria-hidden="true" className="action-link-icon-mark">⌂</span>
          </Link>
        </div>
      </section>

      <section className={["summary-grid", styles["result-impact-grid"]].join(" ")} aria-label="Impact summary">
        {screen.impactCards.map((card) => (
          <article key={card.key} className={["summary-card", styles["result-impact-card"]].join(" ")}>
            <p className="eyebrow">{card.label}</p>
            <h2 className="section-title">{card.value}</h2>
          </article>
        ))}
      </section>

      <section className={["feature-card", sharedStyles["workspace-card"], styles["result-detail-card"]].join(" ")}>
        <details className={["disclosure-card", styles["workspace-disclosure"]].join(" ")}>
          <summary>Run detail</summary>
          <div className="disclosure-body">
            <p className="compact-copy">{result.summaryText}</p>
            {result.stateExplanation ? <p className="compact-copy">{result.stateExplanation}</p> : null}
            <dl className={["stat-grid", "compact-stat-grid", styles["result-detail-grid"]].join(" ")}>
              <div>
                <dt>{result.supportMetricLabel}</dt>
                <dd>{result.supportMetricValue}</dd>
              </div>
              <div>
                <dt>Vs best</dt>
                <dd>{result.selfBestDeltaLabel}</dd>
              </div>
              <div>
                <dt>Game rank</dt>
                <dd>{result.impact.gameRank.value}</dd>
              </div>
              <div>
                <dt>Total points</dt>
                <dd>{result.impact.totalPoints.value}</dd>
              </div>
              <div>
                <dt>Overall rank</dt>
                <dd>{result.impact.overallRank.value}</dd>
              </div>
              <div>
                <dt>Share</dt>
                <dd>{screen.shareStatusLabel}</dd>
                </div>
              </dl>
            <div className={styles["result-detail-copy"]}>
              <p className="compact-copy">{result.selfBestDetail}</p>
              <p className="compact-copy">{result.supportMetricNote}</p>
              <p className="compact-copy">{result.impact.gameRank.note}</p>
              <p className="compact-copy">{result.impact.totalPoints.note}</p>
              <p className="compact-copy">{result.impact.overallRank.note}</p>
              <p className="compact-copy">{result.shareAvailabilityNote}</p>
            </div>
            {screen.alternateGames.length > 0 ? (
              <div className="hero-actions compact-action-strip">
                {screen.alternateGames.map((game) => (
                  <Link key={game.key} className="action-link action-link-secondary" to={game.href}>
                    {game.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </details>
      </section>

      {result.status === "PENDING_SAVE" && result.viewerMode === "owner" ? (
        <section className={["feature-card", sharedStyles["workspace-card"]].join(" ")}>
          <p className="eyebrow">Pending save</p>
          <h2 className="section-title">Retry save</h2>
          <p className="compact-copy">This result stays provisional until the save retry succeeds. Rankings and total points will update only after confirmation.</p>
          <Form method="post" className="hero-actions">
            <input type="hidden" name="intent" value="retryPending" />
            <button className="action-link action-link-primary" type="submit">
              Retry save
            </button>
          </Form>
        </section>
      ) : null}
    </div>
  );
}
