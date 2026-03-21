import { useFetcher } from "react-router";

import styles from "./FavoriteToggle.module.css";

type FavoriteToggleProps = {
  action?: string;
  compact?: boolean;
  gameKey: string;
  gameName: string;
  isFavorite: boolean;
};

export function FavoriteToggle({
  action,
  compact = false,
  gameKey,
  gameName,
  isFavorite,
}: FavoriteToggleProps) {
  const fetcher = useFetcher();
  const isPendingForCurrentGame = fetcher.state !== "idle" && fetcher.formData?.get("gameKey") === gameKey;
  const nextFavoriteState = isPendingForCurrentGame ? !isFavorite : isFavorite;

  return (
    <fetcher.Form action={action} className={styles["favorite-toggle-form"]} method="post">
      <input type="hidden" name="intent" value="toggleFavorite" />
      <input type="hidden" name="gameKey" value={gameKey} />
      <button
        aria-label={nextFavoriteState ? `Remove ${gameName} from favorites` : `Add ${gameName} to favorites`}
        aria-pressed={nextFavoriteState}
        className={[
          "action-link",
          "action-link-secondary",
          styles["favorite-toggle"],
        ].join(" ")}
        data-compact={compact ? "true" : "false"}
        data-favorite={nextFavoriteState ? "true" : "false"}
        disabled={isPendingForCurrentGame}
        type="submit"
      >
        {nextFavoriteState ? (compact ? "Saved" : "Favorited") : "Favorite"}
      </button>
    </fetcher.Form>
  );
}