import { Form, Link } from "react-router";

type ResultScreenProps = {
  result: {
    id: string;
    status: string;
    difficulty: string;
    summaryText: string;
    primaryMetric: number;
    totalPointsDelta: number;
    rankDelta: number | null;
    competitivePoints: number;
    gameKey: string;
    gameName: string;
    shareUrl: string;
    shareText: string;
  };
};

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function ResultScreen({ result }: ResultScreenProps) {
  const teamsShareHref = `https://teams.microsoft.com/share?href=${encodeURIComponent(result.shareUrl)}&msgText=${encodeURIComponent(result.shareText)}`;
  const canShare = result.status === "COMPLETED";

  return (
    <div className="dashboard-stack">
      <section className="feature-card workspace-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Result</p>
            <h2 className="section-title">{result.gameName} {result.difficulty.toLowerCase()}</h2>
          </div>
          <span className={result.status === "PENDING_SAVE" ? "status-badge status-badge-pending" : "status-badge status-badge-success"}>{result.status}</span>
        </div>
        <p>{result.summaryText}</p>
        <dl className="stat-grid compact-stat-grid">
          <div>
            <dt>Recorded time</dt>
            <dd>{formatDuration(result.primaryMetric)}</dd>
          </div>
          <div>
            <dt>Competitive points</dt>
            <dd>{result.competitivePoints}</dd>
          </div>
          <div>
            <dt>Total points delta</dt>
            <dd>{result.totalPointsDelta >= 0 ? `+${result.totalPointsDelta}` : result.totalPointsDelta}</dd>
          </div>
          <div>
            <dt>Rank delta</dt>
            <dd>{result.rankDelta === null ? "Pending" : `${result.rankDelta >= 0 ? "+" : ""}${result.rankDelta}`}</dd>
          </div>
        </dl>
      </section>

      {result.status === "PENDING_SAVE" ? (
        <section className="feature-card workspace-card">
          <p className="eyebrow">Pending save</p>
          <h2 className="section-title">Retry result persistence</h2>
          <p>This run is visible but not ranked yet. Retry to count it toward total points and rankings.</p>
          <Form method="post" className="hero-actions">
            <input type="hidden" name="intent" value="retryPending" />
            <button className="action-link action-link-primary" type="submit">
              Retry save
            </button>
          </Form>
        </section>
      ) : null}

      <section className="feature-card workspace-card">
        <p className="eyebrow">Actions</p>
        <h2 className="section-title">What next</h2>
        <div className="hero-actions">
          <Link className="action-link action-link-primary" to="/home">
            Back to home
          </Link>
          <Link className="action-link action-link-secondary" to="/rankings">
            Open rankings
          </Link>
          <Link className="action-link action-link-secondary" to={`/games/${result.gameKey}`}>
            Replay {result.gameName}
          </Link>
          {canShare ? (
            <a className="action-link action-link-secondary" href={teamsShareHref} target="_blank" rel="noreferrer">
              Microsoft Teams で共有
            </a>
          ) : (
            <span className="action-link action-link-secondary action-link-disabled" aria-disabled="true">
              Microsoft Teams で共有
            </span>
          )}
        </div>
        {!canShare ? <p>Pending-save or interrupted results stay private until the result is finalized.</p> : null}
      </section>
    </div>
  );
}