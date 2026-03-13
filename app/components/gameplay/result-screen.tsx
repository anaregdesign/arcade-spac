import { Form, Link } from "react-router";

type ResultScreenProps = {
  result: {
    id: string;
    status: string;
    statusLabel: string;
    difficulty: string;
    summaryText: string;
    primaryMetric: string;
    supportMetricLabel: string;
    supportMetricValue: number;
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
    canShare: boolean;
  };
};

export function ResultScreen({ result }: ResultScreenProps) {
  const teamsShareHref = `https://teams.microsoft.com/share?href=${encodeURIComponent(result.shareUrl)}&msgText=${encodeURIComponent(result.shareText)}`;
  const alternateGame = result.gameKey === "minesweeper"
    ? { href: "/games/sudoku", label: "Play Sudoku" }
    : result.gameKey === "sudoku"
      ? { href: "/games/minesweeper", label: "Play Minesweeper" }
      : null;

  return (
    <div className="dashboard-stack">
      <section className="feature-card workspace-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">✨ Result</p>
            <h2 className="section-title">{result.gameName} {result.difficulty.toLowerCase()}</h2>
          </div>
          <div className="result-badge-row">
            <span className={result.status === "PENDING_SAVE" ? "status-badge status-badge-pending" : "status-badge status-badge-success"}>{result.statusLabel}</span>
            <span className="status-badge status-badge-neutral">{result.selfBestBadge}</span>
          </div>
        </div>
        <p className="compact-copy">{result.summaryText}</p>
        {result.stateExplanation ? <p className="workspace-note">{result.stateExplanation}</p> : null}
        <dl className="stat-grid compact-stat-grid">
          <div>
            <dt>Clear time</dt>
            <dd>{result.primaryMetric}</dd>
          </div>
          <div>
            <dt>{result.supportMetricLabel}</dt>
            <dd>{result.supportMetricValue}</dd>
          </div>
          <div>
            <dt>Vs best</dt>
            <dd>{result.selfBestDeltaLabel}</dd>
          </div>
          <div>
            <dt>Board score</dt>
            <dd>{result.competitivePoints}</dd>
          </div>
        </dl>
        <p className="compact-copy">{result.selfBestDetail} {result.supportMetricNote}</p>
      </section>

      <section className="summary-grid result-impact-grid" aria-label="Impact summary">
        <article className="summary-card warm-card">
          <p className="eyebrow">🏁 Game rank</p>
          <h2 className="section-title">{result.impact.gameRank.value}</h2>
          <p>{result.impact.gameRank.note}</p>
        </article>
        <article className="summary-card cool-card">
          <p className="eyebrow">➕ Total points</p>
          <h2 className="section-title">{result.impact.totalPoints.value}</h2>
          <p>{result.impact.totalPoints.note}</p>
        </article>
        <article className="summary-card neutral-card">
          <p className="eyebrow">🌍 Overall rank</p>
          <h2 className="section-title">{result.impact.overallRank.value}</h2>
          <p>{result.impact.overallRank.note}</p>
        </article>
      </section>

      <section className="feature-card workspace-card">
        <p className="eyebrow">⚡ Next action</p>
        <h2 className="section-title">Choose what to do next</h2>
        <div className="hero-actions compact-action-strip">
          <Link className="action-link action-link-primary" to={`/games/${result.gameKey}`}>
            Replay {result.gameName}
          </Link>
          {result.canShare ? (
            <a className="action-link action-link-secondary" href={teamsShareHref} target="_blank" rel="noreferrer">
              Microsoft Teams で共有
            </a>
          ) : (
            <span className="action-link action-link-secondary action-link-disabled" aria-disabled="true">
              Microsoft Teams で共有
            </span>
          )}
          {alternateGame ? (
            <Link className="action-link action-link-secondary" to={alternateGame.href}>
              {alternateGame.label}
            </Link>
          ) : null}
          <Link className="action-link action-link-secondary" to="/home">
            Back to home
          </Link>
        </div>
        <details className="disclosure-card workspace-disclosure">
          <summary>Run detail</summary>
          <div className="disclosure-body">
            <dl className="stat-grid compact-stat-grid">
              <div>
                <dt>Share</dt>
                <dd>{result.canShare ? "Ready" : "Locked"}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{result.statusLabel}</dd>
              </div>
              <div>
                <dt>Result link</dt>
                <dd>Ready for Teams share</dd>
              </div>
              <div>
                <dt>Best badge</dt>
                <dd>{result.selfBestBadge}</dd>
              </div>
            </dl>
          </div>
        </details>
      </section>

      {result.status === "PENDING_SAVE" ? (
        <section className="feature-card workspace-card">
          <p className="eyebrow">⏳ Pending save</p>
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