import fluentComponents from "@fluentui/react-components";
import { Link } from "react-router";

const { Badge, Button, Card, Text, Title3 } = fluentComponents;

type HomeDashboardProps = {
  user: {
    displayName: string;
    avatarUrl?: string | null;
    tagline: string;
    streakDays: number;
    totalPlayCount: number;
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
    totalPointsDelta: number;
    startedAt: string;
  }>;
};

export function HomeDashboard({ user, summaries, games, recentResults }: HomeDashboardProps) {
  return (
    <div className="dashboard-stack">
      <section className="summary-grid" aria-label="Summary cards">
        <Card className="summary-card warm-card">
          <p className="eyebrow">Season standing</p>
          <Title3>{summaries.seasonRank ? `#${summaries.seasonRank}` : "Unranked"}</Title3>
          <Text>{summaries.seasonPoints} total points</Text>
        </Card>
        <Card className="summary-card cool-card">
          <p className="eyebrow">Momentum</p>
          <Title3>{summaries.trendDelta >= 0 ? `+${summaries.trendDelta}` : summaries.trendDelta}</Title3>
          <Text>{summaries.recentPlaySummary}</Text>
        </Card>
        <Card className="summary-card neutral-card">
          <p className="eyebrow">Activity</p>
          <Title3>{user.streakDays} day streak</Title3>
          <Text>{user.totalPlayCount} total recorded plays</Text>
        </Card>
      </section>

      <section className="feature-grid">
        <Card className="feature-card span-two">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Next play</p>
              <Title3>Choose a game</Title3>
            </div>
            <Link className="action-link action-link-secondary" to="/rankings">
              View rankings
            </Link>
          </div>
          <div className="game-grid">
            {games.map((game) => (
              <article key={game.key} className="game-card" style={{ borderColor: `${game.accentColor}33` }}>
                <div className="game-card-top">
                  <Badge appearance="tint" style={{ backgroundColor: `${game.accentColor}22`, color: game.accentColor }}>
                    {game.currentRank ? `Rank #${game.currentRank}` : "Unranked"}
                  </Badge>
                  <p className="game-points">{game.bestCompetitivePoints} pts</p>
                </div>
                <Title3>{game.name}</Title3>
                <p>{game.shortDescription}</p>
                <dl className="stat-grid compact-stat-grid">
                  <div>
                    <dt>{game.metricLabel}</dt>
                    <dd>{game.metricValue}</dd>
                  </div>
                  <div>
                    <dt>Completed runs</dt>
                    <dd>{game.completedCount} / {game.playCount}</dd>
                  </div>
                </dl>
                <p className="recommendation-copy">{game.recommendationText ?? "Play again to improve your total score."}</p>
                <Link className="action-link action-link-primary" to={`/games/${game.key}`}>
                  Open {game.name}
                </Link>
              </article>
            ))}
          </div>
        </Card>

        <Card className="feature-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Recent results</p>
              <Title3>Latest activity</Title3>
            </div>
          </div>
          <div className="recent-results-list">
            {recentResults.map((result) => (
              <article key={result.id} className="recent-result-item">
                <div>
                  <strong>{result.gameName}</strong>
                  <p>{result.summaryText}</p>
                </div>
                <div className="recent-result-meta">
                  <Badge appearance={result.status === "PENDING_SAVE" ? "filled" : "outline"}>{result.status}</Badge>
                  <span>{result.totalPointsDelta >= 0 ? `+${result.totalPointsDelta}` : result.totalPointsDelta} pts</span>
                </div>
              </article>
            ))}
          </div>
        </Card>
      </section>
    </div>
  );
}