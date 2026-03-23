import type { SupportedArcadeLocale } from "../../../domain/entities/locale";
import { previewByGameKey } from "../../../domain/entities/game-previews";
import { formatHomeRunLabel, getHomeHubCopy } from "./home-hub-copy";

type HomeGame = {
  currentRank: number | null;
  isFavorite: boolean;
  key: string;
  metricLabel: string;
  metricValue: string;
  name: string;
  playCount: number;
  recommendationText: string | null;
  shortDescription: string;
};

export type HomeGameCard = HomeGame & {
  metricSummary: string;
  previewAlt: string | null;
  previewObjectPosition?: string;
  previewSrc: string | null;
  runLabel: string;
};

export { previewByGameKey };

function getMetricSummary(game: Pick<HomeGame, "metricLabel" | "metricValue">, locale: SupportedArcadeLocale) {
  if (game.metricValue === "No record yet") {
    return getHomeHubCopy(locale).noRecordYetLabel;
  }

  return `${game.metricLabel}: ${game.metricValue}`;
}

export function countVisibleRankedGames(games: HomeGame[]) {
  return games.filter((game) => game.currentRank !== null).length;
}

export function countVisibleUnplayedGames(games: HomeGame[]) {
  return games.filter((game) => game.playCount === 0).length;
}

export function toHomeGameCards(games: HomeGame[], locale: SupportedArcadeLocale = "en"): HomeGameCard[] {
  return games.map((game) => {
    const preview = previewByGameKey[game.key];

    return {
      ...game,
      metricSummary: getMetricSummary(game, locale),
      previewAlt: preview?.previewAlt ?? null,
      previewObjectPosition: preview?.previewObjectPosition,
      previewSrc: preview?.previewSrc ?? null,
      runLabel: formatHomeRunLabel(locale, game.playCount),
    };
  });
}
