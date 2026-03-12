import { Form, Link } from "react-router";

type ResultScreenProps = {
  result: {
    id: string;
    status: string;
    difficulty: string;
    summaryText: string;
    primaryMetric: number;
    hintCount: number | null;
    mistakeCount: number | null;
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
          <span className={result.status === "PENDING_SAVE" ? "status-badge status-badge-pending" : "status-badge status-badge-success"}>{result.status}</span>
        </div>
        <p className="compact-copy">{result.summaryText}</p>
        <dl className="stat-grid compact-stat-grid">
          <div>
            <dt>Recorded time</dt>
            <dd>{formatDuration(result.primaryMetric)}</dd>
          </div>
          <div>
            <dt>Total points</dt>
            <dd>{result.totalPointsDelta >= 0 ? `+${result.totalPointsDelta}` : result.totalPointsDelta}</dd>
          </div>
          <div>
            <dt>Rank move</dt>
            <dd>{result.rankDelta === null ? "Pending" : `${result.rankDelta >= 0 ? "+" : ""}${result.rankDelta}`}</dd>
          </div>
          <div>
            <dt>Board score</dt>
            <dd>{result.competitivePoints}</dd>
          </div>
        </dl>
        <div className="hero-actions compact-action-strip">
          <Link className="action-link action-link-primary" to={`/games/${result.gameKey}`}>
            Replay {result.gameName}
          </Link>
          {alternateGame ? (
            <Link className="action-link action-link-secondary" to={alternateGame.href}>
              {alternateGame.label}
            </Link>
          ) : null}
          <Link className="action-link action-link-secondary" to="/rankings">
            Open rankings
          </Link>
          {canShare ? (
            <a className="action-link action-link-secondary" href={teamsShareHref} target="_blank" rel="noreferrer">
              Teams で共有
            </a>
          ) : (
            <span className="action-link action-link-secondary action-link-disabled" aria-disabled="true">
              Teams で共有
            </span>
          )}
        </div>
        <details className="disclosure-card workspace-disclosure">
          <summary>Run detail</summary>
          <div className="disclosure-body">
            <dl className="stat-grid compact-stat-grid">
              {result.hintCount !== null ? (
                <div>
                  <dt>Hints used</dt>
                  <dd>{result.hintCount}</dd>
                </div>
              ) : null}
              {result.mistakeCount !== null ? (
                <div>
                  <dt>Mistakes</dt>
                  <dd>{result.mistakeCount}</dd>
                </div>
              ) : null}
              <div>
                <dt>Share</dt>
                <dd>{canShare ? "Ready" : "Locked"}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{result.status}</dd>
              </div>
            </dl>
          </div>
        </details>
      </section>

      {result.status === "PENDING_SAVE" ? (
        <section className="feature-card workspace-card">
          <p className="eyebrow">⏳ Pending save</p>
          <h2 className="section-title">Retry result persistence</h2>
          <p className="compact-copy">Visible now. Ranked after retry succeeds.</p>
          <Form method="post" className="hero-actions">
            <input type="hidden" name="intent" value="retryPending" />
            <button className="action-link action-link-primary" type="submit">
              Retry save
            </button>
          </Form>
        </section>
      ) : null}

      <section className="feature-card workspace-card">
        <p className="eyebrow">🏠 Return</p>
        <h2 className="section-title">Leave this result</h2>
        <div className="hero-actions compact-action-strip">
          <Link className="action-link action-link-primary" to="/home">
            Back to home
          </Link>
        </div>
        {!canShare ? <p className="compact-copy">Pending or interrupted results stay private until finalized.</p> : null}
      </section>
    </div>
  );
}