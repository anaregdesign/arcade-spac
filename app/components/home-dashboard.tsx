import { useState } from "react";
import { Form, Link } from "react-router";

function getGameEmoji(gameKey: string) {
  switch (gameKey) {
    case "minesweeper":
      return "💣";
    case "sudoku":
      return "🔢";
    default:
      return "🎮";
  }
}

type HomeDashboardProps = {
  user: {
    displayName: string;
    avatarUrl?: string | null;
    tagline: string;
    streakDays: number;
    totalPlayCount: number;
    onboardingSeenAt: string | null;
  };
  onboarding: {
    showGuide: boolean;
  };
  summaries: {
    seasonPoints: number;
    seasonRank: number | null;
    lifetimePoints: number;
    trendDelta: number;
    recentPlaySummary: string;
  };
  games: Array<{
    key: string;
    name: string;
    shortDescription: string;
    accentColor: string;
    currentRank: number | null;
    bestCompetitivePoints: number;
    personalBestMetric: number | null;
    playCount: number;
    completedCount: number;
    recommendationText: string | null;
    metricLabel: string;
    metricValue: string;
  }>;
  recentResults: Array<{
    id: string;
    gameName: string;
    status: string;
    summaryText: string;
    resultPath: string;
    totalPointsDelta: number;
    startedAt: string;
  }>;
};

export function HomeDashboard({ user, onboarding, summaries, games, recentResults }: HomeDashboardProps) {
  const featuredGames = games.slice(0, 2);
  const latestResult = recentResults[0] ?? null;
  const remainingResults = recentResults.slice(1, 5);
  const shouldShowOnboarding = onboarding.showGuide;
  const primaryGame = featuredGames[0] ?? games[0] ?? null;
  const secondaryGame = featuredGames[1] ?? games[1] ?? null;
  const [isHelpOpen, setHelpOpen] = useState(shouldShowOnboarding);

  return (
    <div className="dashboard-stack">
      <section className="feature-card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">🧭 Help</p>
            <h2 className="section-title">{shouldShowOnboarding ? "First run guide" : "Help and scoring"}</h2>
          </div>
          <button className="action-link action-link-secondary" type="button" onClick={() => setHelpOpen(true)}>
            {shouldShowOnboarding ? "Open guide" : "Open help"}
          </button>
        </div>
        <p className="compact-copy">
          {shouldShowOnboarding
            ? "Your first sign-in now opens a focused guide instead of keeping the explanation inline on the page."
            : "Reopen the guide any time to review how game choice, total points, rankings, and saved results fit together."}
        </p>
        <div className="hero-actions compact-actions">
          {primaryGame ? (
            <Link className="action-link action-link-primary" to={`/games/${primaryGame.key}`}>
              Start with {primaryGame.name}
            </Link>
          ) : null}
          {secondaryGame ? (
            <Link className="action-link action-link-secondary" to={`/games/${secondaryGame.key}`}>
              Try {secondaryGame.name}
            </Link>
          ) : null}
        </div>
        <div className="help-inline-grid compact-copy">
          <p><strong>Pick a lane:</strong> Start with the game that gives the quickest ranked result, or switch games to grow your total faster.</p>
          <p><strong>Total points:</strong> Arcade adds your strongest confirmed score from each game, so broad improvement beats staying in one lane.</p>
        </div>
      </section>

      {isHelpOpen ? (
        <section className="help-overlay" aria-label="First-use help">
          <div className="help-dialog feature-card" role="dialog" aria-modal="true" aria-labelledby="home-help-title">
            <div className="section-heading">
              <div>
                <p className="eyebrow">🧭 First-use help</p>
                <h2 className="section-title" id="home-help-title">Start, score, and switch with confidence</h2>
              </div>
              {!shouldShowOnboarding ? (
                <button className="action-link action-link-secondary" type="button" onClick={() => setHelpOpen(false)}>
                  Close
                </button>
              ) : null}
            </div>
            <div className="help-grid">
              <article className="help-panel">
                <p className="eyebrow">1. Choose a game</p>
                <h3 className="card-title">Start from the board that matches your goal</h3>
                <p className="compact-copy">Minesweeper is the quickest path to a first ranked clear. Sudoku gives you a slower run with hints when you want a steadier start.</p>
              </article>
              <article className="help-panel">
                <p className="eyebrow">2. Read total points</p>
                <h3 className="card-title">Overall points reward cross-game strength</h3>
                <p className="compact-copy">Your total grows from the best confirmed score in each game. A better result in a second game usually moves the overall board more than repeating a score you already own.</p>
              </article>
              <article className="help-panel">
                <p className="eyebrow">3. Read rankings</p>
                <h3 className="card-title">Use overall and game boards together</h3>
                <p className="compact-copy">Overall rankings show your cross-game standing. Game boards show where a single stronger clear could cut the gap to the next rival.</p>
              </article>
              <article className="help-panel">
                <p className="eyebrow">4. Know run states</p>
                <h3 className="card-title">Confirmed clears count, pending saves wait</h3>
                <p className="compact-copy">Leaving a live board records an abandoned run. Pending saves stay visible but do not change rankings or total points until the retry succeeds.</p>
              </article>
            </div>
            <div className="hero-actions">
              {primaryGame ? (
                <Link className="action-link action-link-primary" to={`/games/${primaryGame.key}`}>
                  Start with {primaryGame.name}
                </Link>
              ) : null}
              {secondaryGame ? (
                <Link className="action-link action-link-secondary" to={`/games/${secondaryGame.key}`}>
                  Try {secondaryGame.name}
                </Link>
              ) : null}
              <Link className="action-link action-link-secondary" to="/rankings">
                Open rankings
              </Link>
              {shouldShowOnboarding ? (
                <Form method="post">
                  <input type="hidden" name="intent" value="dismissOnboarding" />
                  <button className="action-link action-link-secondary" type="submit">
                    Got it
                  </button>
                </Form>
              ) : (
                <button className="action-link action-link-secondary" type="button" onClick={() => setHelpOpen(false)}>
                  Back to home
                </button>
              )}
            </div>
          </div>
        </section>
      ) : null}

      <section className="summary-grid" aria-label="Summary cards">
        <article className="summary-card warm-card">
          <p className="eyebrow">🏆 Season</p>
          <h2 className="section-title">{summaries.seasonRank ? `#${summaries.seasonRank}` : "Unranked"}</h2>
          <p>{summaries.seasonPoints} pts</p>
        </article>
        <article className="summary-card cool-card">
          <p className="eyebrow">📈 Momentum</p>
          <h2 className="section-title">{summaries.trendDelta >= 0 ? `+${summaries.trendDelta}` : summaries.trendDelta}</h2>
          <p>Recent trend</p>
        </article>
        <article className="summary-card neutral-card">
          <p className="eyebrow">🔥 Activity</p>
          <h2 className="section-title">{user.streakDays} day streak</h2>
          <p>{user.totalPlayCount} recorded runs</p>
        </article>
      </section>

      <section className="feature-grid">
        <article className="feature-card span-two">
          <div className="section-heading">
            <div>
              <p className="eyebrow">🎯 Next play</p>
              <h2 className="section-title">Pick a board and go</h2>
            </div>
            <div className="hero-actions compact-actions">
              <Link className="action-link action-link-primary" to={`/games/${featuredGames[0]?.key ?? games[0]?.key ?? "minesweeper"}`}>
                Play now
              </Link>
              <Link className="action-link action-link-secondary" to="/rankings">
                Open board
              </Link>
            </div>
          </div>
          <div className="game-grid home-game-grid">
            {games.map((game) => (
              <article key={game.key} className="game-card" style={{ borderColor: `${game.accentColor}33` }}>
                <div className="game-card-top">
                  <span className="game-icon-chip" aria-hidden="true">{getGameEmoji(game.key)}</span>
                  <span className="status-badge" style={{ backgroundColor: `${game.accentColor}22`, color: game.accentColor }}>
                    {game.currentRank ? `Rank #${game.currentRank}` : "Unranked"}
                  </span>
                </div>
                <div>
                  <h3 className="card-title">{game.name}</h3>
                  <p className="compact-copy">{game.shortDescription}</p>
                </div>
                <dl className="stat-grid compact-stat-grid">
                  <div>
                    <dt>{game.metricLabel}</dt>
                    <dd>{game.metricValue}</dd>
                  </div>
                  <div>
                    <dt>Score</dt>
                    <dd>{game.bestCompetitivePoints} pts</dd>
                  </div>
                  <div>
                    <dt>Clears</dt>
                    <dd>{game.completedCount} / {game.playCount}</dd>
                  </div>
                  <div>
                    <dt>Focus</dt>
                    <dd>{game.currentRank ? `#${game.currentRank}` : "First run"}</dd>
                  </div>
                </dl>
                <div className="game-card-footer">
                  <p className="recommendation-copy">{game.recommendationText ?? "Next run"}</p>
                  <Link className="action-link action-link-primary" to={`/games/${game.key}`}>
                    Open {game.name}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </article>

        <article className="feature-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">🧭 Right now</p>
              <h2 className="section-title">Now</h2>
            </div>
          </div>
          {latestResult ? (
            <article className="latest-result-card">
              <div className="latest-result-head">
                <strong>{latestResult.gameName}</strong>
                <span className={latestResult.status === "PENDING_SAVE" ? "status-badge status-badge-pending" : "status-badge status-badge-neutral"}>{latestResult.status}</span>
              </div>
              <p className="compact-copy">{latestResult.summaryText}</p>
              <div className="inline-stat-row">
                <span>{latestResult.totalPointsDelta >= 0 ? `+${latestResult.totalPointsDelta}` : latestResult.totalPointsDelta} pts</span>
                <Link className="inline-link" to={latestResult.resultPath}>
                  Open result
                </Link>
              </div>
            </article>
          ) : (
            <article className="latest-result-card">
              <strong>No runs yet</strong>
              <p className="compact-copy">Pick a game above to record a first result and unlock rankings, result history, and profile trends.</p>
              <div className="hero-actions compact-actions">
                {primaryGame ? (
                  <Link className="action-link action-link-primary" to={`/games/${primaryGame.key}`}>
                    Open {primaryGame.name}
                  </Link>
                ) : null}
                {secondaryGame ? (
                  <Link className="action-link action-link-secondary" to={`/games/${secondaryGame.key}`}>
                    Open {secondaryGame.name}
                  </Link>
                ) : null}
              </div>
            </article>
          )}
          {remainingResults.length > 0 ? (
            <details className="disclosure-card">
              <summary>More</summary>
              <div className="recent-results-list disclosure-body">
                {remainingResults.map((result) => (
                  <article key={result.id} className="recent-result-item">
                    <div>
                      <strong>{result.gameName}</strong>
                      <p className="compact-copy">{result.summaryText}</p>
                    </div>
                    <div className="recent-result-meta">
                      <span>{result.totalPointsDelta >= 0 ? `+${result.totalPointsDelta}` : result.totalPointsDelta} pts</span>
                    </div>
                  </article>
                ))}
              </div>
            </details>
          ) : null}
        </article>
      </section>
    </div>
  );
}