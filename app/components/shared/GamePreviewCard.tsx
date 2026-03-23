import type { ReactNode } from "react";
import { Link } from "react-router";

import { useAppLocale } from "../../lib/client/usecase/locale/use-app-locale";
import styles from "./GamePreviewCard.module.css";

type GamePreviewCardProps = {
  actionLabel?: string;
  badges?: string[];
  className?: string;
  description: string;
  gameKey: string;
  headerAction?: ReactNode;
  kicker: string;
  name: string;
  previewAlt: string | null;
  previewObjectPosition?: string;
  previewSrc: string | null;
  secondaryText?: string;
};

export function GamePreviewCard({
  actionLabel,
  badges = [],
  className,
  description,
  gameKey,
  headerAction,
  kicker,
  name,
  previewAlt,
  previewObjectPosition,
  previewSrc,
  secondaryText,
}: GamePreviewCardProps) {
  const { locale } = useAppLocale();
  const href = `/games/${gameKey}`;
  const showSecondaryText = secondaryText && secondaryText !== description;
  const openLabel = locale === "ja"
    ? `${name} を開く`
    : locale === "zh"
      ? `打开 ${name}`
      : locale === "fr"
        ? `Ouvrir ${name}`
        : `Open ${name}`;

  return (
    <article className={["game-card", styles["game-preview-card"], className].filter(Boolean).join(" ")}>
      <div className={styles["game-card-header"]}>
        <div className={styles["game-card-heading"]}>
          <h3 className="card-title">{name}</h3>
          <span className={styles["game-card-kicker"]}>{kicker}</span>
        </div>
        {headerAction}
      </div>
      <Link aria-label={openLabel} className={styles["game-preview-link"]} to={href}>
        <div className={styles["game-preview-frame"]}>
          {previewSrc && previewAlt ? (
            <img
              alt={previewAlt}
              className={styles["game-preview-image"]}
              loading="lazy"
              src={previewSrc}
              style={{ objectPosition: previewObjectPosition ?? "center center" }}
            />
          ) : (
            <div className={styles["game-preview-fallback"]} aria-hidden="true">
              <span>{name.slice(0, 2).toUpperCase()}</span>
            </div>
          )}
        </div>
        <div className={styles["game-card-body"]}>
          {showSecondaryText ? <p className="compact-copy">{secondaryText}</p> : null}
          <p className="compact-copy">{description}</p>
          {badges.length > 0 ? (
            <div className={styles["game-card-meta"]}>
              {badges.map((badge) => (
                <span key={badge} className="status-badge status-badge-neutral">
                  {badge}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </Link>
      {actionLabel ? (
        <Link className="action-link action-link-secondary" to={href}>
          {actionLabel}
        </Link>
      ) : null}
    </article>
  );
}
