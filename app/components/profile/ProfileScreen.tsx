import { Form, Link } from "react-router";

import { useProfileScreen } from "../../lib/client/usecase/profile-screen/use-profile-screen";
import { SummaryCard } from "../shared/SummaryCard";
import styles from "./ProfileScreen.module.css";

type ProfileScreenProps = {
  profile: {
    displayName: string;
    visibilityScope: "TENANT_ONLY" | "PRIVATE";
    tagline: string;
    favoriteGame: string;
    themePreference: "LIGHT" | "DARK";
    sharePreviewName: string;
    visibilitySummary: string;
    teamsShareSummary: string;
  };
  activity: {
    streakDays: number;
    totalPlayCount: number;
    lastPlayedAt: string | null;
  };
  overall: Array<{
    period: string;
    totalPoints: number;
    currentRank: number | null;
    trendDelta: number;
    recentPlaySummary: string;
  }>;
  games: Array<{
    key: string;
    name: string;
    currentRank: number | null;
    bestCompetitivePoints: number;
    personalBestMetric: string;
    playCount: number;
    completedCount: number;
    recommendationText: string;
    contributionShare: number;
  }>;
  breakdown: {
    totalPoints: number;
    items: Array<{
      key: string;
      name: string;
      points: number;
      contributionShare: number;
      rankLabel: string;
      recommendationText: string;
    }>;
  };
  growthGuidance: {
    title: string;
    detail: string;
  };
  trend: Array<{
    index: number;
    gameName: string;
    status: string;
    totalPointsDelta: number;
    competitivePoints: number;
    label: string;
  }>;
};

export function ProfileScreen({ profile, activity, overall, games, breakdown, growthGuidance, trend }: ProfileScreenProps) {
  const screen = useProfileScreen({ profile, trend });

  return (
    <div className="dashboard-stack">
      <section className={["feature-card", styles["profile-shell-card"]].join(" ")}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Identity</p>
            <h2 className="section-title">Identity and visibility</h2>
          </div>
          <Link className="action-link action-link-secondary" to="/rankings">
            Open rankings
          </Link>
        </div>
        <div className={styles["profile-overview-grid"]}>
          <article className={["feature-card", styles["profile-preview-card"]].join(" ")}>
            <p className="eyebrow">Public name</p>
            <h3 className="card-title">{profile.sharePreviewName}</h3>
            <p className="compact-copy">{profile.visibilityScope === "TENANT_ONLY" ? "Visible to signed-in players" : "Private"}</p>
            <p className="compact-copy">{profile.visibilitySummary}</p>
          </article>
          <article className={["feature-card", styles["profile-preview-card"]].join(" ")}>
            <p className="eyebrow">Tagline</p>
            <h3 className="card-title">{profile.tagline || "No tagline yet"}</h3>
            <p className="compact-copy">Favorite: {profile.favoriteGame || "No preference yet"}</p>
            <p className="compact-copy">{profile.teamsShareSummary}</p>
          </article>
        </div>
        <details className={["disclosure-card", styles["profile-edit-disclosure"]].join(" ")}>
          <summary>Edit</summary>
          <div className="disclosure-body">
            <Form method="post" className={styles["profile-form-grid"]}>
              <label className="field-block">
                <span className="field-label">Display name</span>
                <input className="field-input" name="displayName" defaultValue={profile.displayName} maxLength={40} required />
              </label>
              <label className="field-block">
                <span className="field-label">Visibility scope</span>
                <select className="field-select" name="visibilityScope" defaultValue={profile.visibilityScope}>
                  <option value="TENANT_ONLY">Visible to signed-in players</option>
                  <option value="PRIVATE">Private</option>
                </select>
              </label>
              <label className={["field-block", styles["profile-form-wide"]].join(" ")}>
                <span className="field-label">Tagline</span>
                <input className="field-input" name="tagline" defaultValue={profile.tagline} maxLength={120} />
              </label>
              <label className="field-block">
                <span className="field-label">Favorite game</span>
                <select className="field-select" name="favoriteGame" defaultValue={profile.favoriteGame || ""}>
                  <option value="">No preference yet</option>
                  {games.map((game) => (
                    <option key={game.key} value={game.key}>
                      {game.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field-block">
                <span className="field-label">Theme</span>
                <select
                  className="field-select"
                  name="themePreference"
                  onChange={(event) => screen.handleThemePreferenceChange(event.currentTarget.value)}
                  value={screen.themePreference}
                >
                  <option value="LIGHT">Light</option>
                  <option value="DARK">Dark</option>
                </select>
              </label>
              <div className={["hero-actions", styles["profile-form-actions"], styles["profile-form-wide"]].join(" ")}>
                <button className="action-link action-link-primary" type="submit">
                  Save profile
                </button>
                <Link className="action-link action-link-secondary" to="/home">
                  Back to home
                </Link>
              </div>
            </Form>
          </div>
        </details>
      </section>

      <section className="summary-grid">
        <SummaryCard
          description={`${activity.totalPlayCount} recorded plays`}
          eyebrow="Activity"
          title={`${activity.streakDays} day streak`}
          tone="warm"
        />
        {overall.map((summary) => (
          <SummaryCard
            key={summary.period}
            description={`${summary.currentRank ? `Rank #${summary.currentRank}` : "Unranked"} · ${summary.recentPlaySummary}`}
            eyebrow={summary.period === "SEASON" ? "Season" : "Lifetime"}
            title={`${summary.totalPoints} pts`}
            tone="cool"
          />
        ))}
      </section>

      <section className="feature-grid">
        <article className="feature-card span-two">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Best records</p>
              <h2 className="section-title">Per-game performance</h2>
            </div>
          </div>
          <div className={styles["profile-breakdown-card"]}>
            <div className="section-heading">
              <div>
                <p className="eyebrow">Total points</p>
                <h3 className="card-title">How your overall score is built</h3>
              </div>
              <span className="status-badge status-badge-neutral">{breakdown.totalPoints} pts total</span>
            </div>
            <div className={styles["breakdown-list"]}>
              {breakdown.items.map((item) => (
                <article key={item.key} className={styles["breakdown-row"]}>
                  <div>
                    <strong>{item.name}</strong>
                    <p className="compact-copy">{item.rankLabel} · {item.recommendationText}</p>
                  </div>
                  <div className={styles["breakdown-metric-block"]}>
                    <strong>{item.points} pts</strong>
                    <span>{item.contributionShare}%</span>
                  </div>
                  <div className={styles["breakdown-bar"]} aria-hidden="true">
                    <span style={{ width: `${item.contributionShare}%` }} />
                  </div>
                </article>
              ))}
            </div>
          </div>
          <div className="game-grid">
            {games.map((game) => (
              <article key={game.key} className={["game-card", styles["profile-game-card"]].join(" ")}>
                <div className={styles["game-card-top"]}>
                  <span className="status-badge status-badge-neutral">{game.currentRank ? `Rank #${game.currentRank}` : "Unranked"}</span>
                  <p className={styles["game-points"]}>{game.bestCompetitivePoints} pts</p>
                </div>
                <h3 className="card-title">{game.name}</h3>
                <dl className="stat-grid compact-stat-grid">
                  <div>
                    <dt>Best metric</dt>
                    <dd>{game.personalBestMetric}</dd>
                  </div>
                  <div>
                    <dt>Completed</dt>
                    <dd>{game.completedCount} / {game.playCount}</dd>
                  </div>
                  <div>
                    <dt>Total share</dt>
                    <dd>{game.contributionShare}%</dd>
                  </div>
                </dl>
                <p className={styles["recommendation-copy"]}>{game.recommendationText}</p>
                <Link className="action-link action-link-secondary" to={`/games/${game.key}`}>
                  Play {game.name}
                </Link>
              </article>
            ))}
          </div>
        </article>

        <article className="feature-card">
          <div className="section-heading">
            <div>
              <p className="eyebrow">📈 Growth trend</p>
              <h2 className="section-title">Recent score movement</h2>
            </div>
          </div>
          <div className={styles["profile-growth-note"]}>
            <strong>{growthGuidance.title}</strong>
            <p className="compact-copy">{growthGuidance.detail}</p>
          </div>
          {screen.trendPath ? (
            <div className={styles["trend-chart-shell"]}>
              <svg viewBox="0 0 100 100" className={styles["trend-chart"]} preserveAspectRatio="none" aria-label="Recent score trend">
                <path d={screen.trendPath} fill="none" stroke="var(--surface-strong)" strokeWidth="3" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
          ) : (
            <p className="compact-copy">No runs yet.</p>
          )}
          <div className={styles["trend-list"]}>
            {screen.recentTrend.map((item) => (
              <article key={`${item.label}-${item.index}`} className={styles["recent-result-item"]}>
                <div>
                  <strong>{item.gameName}</strong>
                  <p className="compact-copy">{item.label} · {item.status}</p>
                </div>
                <div className={styles["recent-result-meta"]}>
                  <span className="status-badge status-badge-neutral">{item.competitivePoints} pts</span>
                  <span>{item.totalPointsDelta >= 0 ? `+${item.totalPointsDelta}` : item.totalPointsDelta}</span>
                </div>
              </article>
            ))}
          </div>
          {screen.archivedTrend.length > 0 ? (
            <details className="disclosure-card">
              <summary>More</summary>
              <div className={["disclosure-body", styles["trend-list"]].join(" ")}>
                {screen.archivedTrend.map((item) => (
                  <article key={`${item.label}-${item.index}`} className={styles["recent-result-item"]}>
                    <div>
                      <strong>{item.gameName}</strong>
                      <p className="compact-copy">{item.label} · {item.status}</p>
                    </div>
                    <div className={styles["recent-result-meta"]}>
                      <span className="status-badge status-badge-neutral">{item.competitivePoints} pts</span>
                      <span>{item.totalPointsDelta >= 0 ? `+${item.totalPointsDelta}` : item.totalPointsDelta}</span>
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