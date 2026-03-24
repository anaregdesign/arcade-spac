import { useState } from "react";
import { useFetcher, useLocation } from "react-router";

import { buildGameplayShareText } from "../../../lib/client/usecase/gameplay-share/build-gameplay-share-text";
import { useAppLocale } from "../../../lib/client/usecase/locale/use-app-locale";

type GameplayShareActionProps = {
  gameDescription: string;
  gameName: string;
};

export function GameplayShareAction({
  gameDescription,
  gameName,
}: GameplayShareActionProps) {
  const { copy } = useAppLocale();
  const fetcher = useFetcher();
  const location = useLocation();
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const isPending = fetcher.state !== "idle";

  async function handleShare() {
    try {
      const shareUrl = `${window.location.origin}${location.pathname}`;
      const shareText = buildGameplayShareText({
        gameDescription,
        gameName,
        shareUrl,
      });

      await navigator.clipboard.writeText(shareText);
      setCopyStatus("copied");
      fetcher.submit(
        { intent: "shareGameLink" },
        { method: "post" },
      );
    } catch {
      setCopyStatus("failed");
    }
  }

  return (
    <>
      <button
        className="action-link action-link-secondary"
        disabled={isPending}
        onClick={handleShare}
        type="button"
      >
        {copy.shareLabel}
      </button>
      {copyStatus === "copied" ? <span className="compact-copy" role="status">{copy.shareCopiedLabel}</span> : null}
      {copyStatus === "failed" ? <span className="compact-copy" role="status">{copy.shareCopyFailedLabel}</span> : null}
    </>
  );
}