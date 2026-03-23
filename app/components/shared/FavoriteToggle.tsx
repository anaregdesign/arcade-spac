import { useFetcher } from "react-router";

import { useAppLocale } from "../../lib/client/usecase/locale/use-app-locale";
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
  const { locale } = useAppLocale();
  const fetcher = useFetcher();
  const isPendingForCurrentGame = fetcher.state !== "idle" && fetcher.formData?.get("gameKey") === gameKey;
  const nextFavoriteState = isPendingForCurrentGame ? !isFavorite : isFavorite;
  const copy = locale === "ja"
    ? {
        addAria: `「${gameName}」をお気に入りに追加`,
        buttonDefault: "お気に入り",
        buttonSaved: compact ? "保存済み" : "登録済み",
        removeAria: `「${gameName}」をお気に入りから外す`,
      }
    : locale === "zh"
      ? {
          addAria: `将 ${gameName} 加入收藏`,
          buttonDefault: "收藏",
          buttonSaved: compact ? "已收藏" : "收藏中",
          removeAria: `将 ${gameName} 移出收藏`,
        }
      : locale === "fr"
        ? {
            addAria: `Ajouter ${gameName} aux favoris`,
            buttonDefault: "Favori",
            buttonSaved: compact ? "En favori" : "Favorisé",
            removeAria: `Retirer ${gameName} des favoris`,
          }
        : {
            addAria: `Add ${gameName} to favorites`,
            buttonDefault: "Favorite",
            buttonSaved: compact ? "Saved" : "Favorited",
            removeAria: `Remove ${gameName} from favorites`,
          };

  return (
    <fetcher.Form action={action} className={styles["favorite-toggle-form"]} method="post">
      <input type="hidden" name="intent" value="toggleFavorite" />
      <input type="hidden" name="gameKey" value={gameKey} />
      <button
        aria-label={nextFavoriteState ? copy.removeAria : copy.addAria}
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
        {nextFavoriteState ? copy.buttonSaved : copy.buttonDefault}
      </button>
    </fetcher.Form>
  );
}