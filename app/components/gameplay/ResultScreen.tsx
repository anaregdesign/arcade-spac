import { useState } from "react";
import { Form } from "react-router";

import { useResultScreen } from "../../lib/client/usecase/result-screen/use-result-screen";
import sharedStyles from "./workspace/GameWorkspaceShared.module.css";
import { FavoriteToggle } from "../shared/FavoriteToggle";
import { GamePreviewCard } from "../shared/GamePreviewCard";
import { SummaryCard } from "../shared/SummaryCard";
import styles from "./ResultScreen.module.css";

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
    gameDescription: string;
    gameKey: string;
    gameName: string;
    isFavorite: boolean;
    recommendations: Array<{
      key: string;
      name: string;
      previewAlt: string | null;
      previewObjectPosition?: string;
      previewSrc: string | null;
      recommendationText: string;
      shortDescription: string;
    }>;
    shareUrl: string;
    shareText: string;
    shareAvailabilityNote: string;
    canShare: boolean;
    rankingsHref: string;
  };
};

export function ResultScreen({ result }: ResultScreenProps) {
  const screen = useResultScreen(result);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");

  async function handleCopyShareText() {
    try {
      await navigator.clipboard.writeText(result.shareText);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  }

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
          <Form method="post">
            <input type="hidden" name="intent" value="replayFromResult" />
            <button className="action-link action-link-primary" type="submit">
              <span aria-hidden="true" className="action-link-icon-mark">↺</span>
              <span>Replay {result.gameName}</span>
            </button>
          </Form>
          <button className="action-link action-link-secondary" onClick={() => setIsShareOpen(true)} type="button">
            <span aria-hidden="true" className="action-link-icon-mark">⇪</span>
            <span>Share</span>
          </button>
          <FavoriteToggle compact gameKey={result.gameKey} gameName={result.gameName} isFavorite={result.isFavorite} />
        </div>
      </section>

      <section className={["summary-grid", styles["result-impact-grid"]].join(" ")} aria-label="Impact summary">
        {screen.impactCards.map((card) => (
          <SummaryCard key={card.key} className={styles["result-impact-card"]} eyebrow={card.label} title={card.value} />
        ))}
      </section>

      <section className={["feature-card", sharedStyles["workspace-card"], styles["result-detail-card"]].join(" ")}>
        <div className="section-heading">
          <div>
            <p className="eyebrow">Recommendation</p>
            <h2 className="section-title">Pick the next game</h2>
          </div>
        </div>
        <div className={styles["result-detail-copy"]}>
          {screen.recommendationSummaryLines.map((line) => (
            <p className="compact-copy" key={line}>{line}</p>
          ))}
        </div>
        {screen.recommendationCards.length > 0 ? (
          <div className={styles["result-recommendation-grid"]}>
            {screen.recommendationCards.map((game) => (
              <GamePreviewCard
                actionLabel={`Play ${game.name}`}
                className={styles["result-recommendation-card"]}
                description={game.shortDescription}
                gameKey={game.key}
                key={game.key}
                kicker="Next game"
                name={game.name}
                previewAlt={game.previewAlt}
                previewObjectPosition={game.previewObjectPosition}
                previewSrc={game.previewSrc}
                secondaryText={game.recommendationText}
              />
            ))}
          </div>
        ) : null}
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

      {isShareOpen ? (
        <section className="help-overlay" aria-label="Share game dialog">
          <div aria-modal="true" className={["help-dialog", "feature-card", styles["result-share-dialog"]].join(" ")} role="dialog">
            <div className="section-heading">
              <div>
                <p className="eyebrow">Share</p>
                <h2 className="section-title">Share {result.gameName}</h2>
              </div>
              <button className="action-link action-link-secondary" onClick={() => setIsShareOpen(false)} type="button">
                Close
              </button>
            </div>
            <div className={styles["result-share-preview"]}>
              {screen.sharePreviewLines.map((line) => (
                <p className="compact-copy" key={line}>{line}</p>
              ))}
            </div>
            <div className="hero-actions compact-action-strip">
              <button className="action-link action-link-primary" onClick={handleCopyShareText} type="button">
                Copy to clipboard
              </button>
            </div>
            {copyStatus === "copied" ? <p className="compact-copy">Share text copied.</p> : null}
            {copyStatus === "failed" ? <p className="compact-copy">Clipboard copy failed. Try again.</p> : null}
          </div>
        </section>
      ) : null}
    </div>
  );
}
