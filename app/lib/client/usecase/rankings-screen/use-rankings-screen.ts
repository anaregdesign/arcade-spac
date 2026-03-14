import type { GameKey } from "../../../domain/entities/game-catalog";

type RankingsScreenInput = {
  filter: {
    period: "SEASON" | "LIFETIME";
    scope: "overall" | GameKey;
  };
  games: Array<{
    key: string;
    name: string;
  }>;
};

function buildRankingsHref(period: "SEASON" | "LIFETIME", scope: "overall" | GameKey) {
  return `/rankings?period=${period.toLowerCase()}&scope=${scope}`;
}

export function useRankingsScreen(input: RankingsScreenInput) {
  const scopes = [
    { href: buildRankingsHref(input.filter.period, "overall"), key: "overall" as const, label: "Overall" },
    ...input.games.map((game) => ({
      href: buildRankingsHref(input.filter.period, game.key as GameKey),
      key: game.key as GameKey,
      label: game.name,
    })),
  ];
  const periods = [
    {
      href: buildRankingsHref("SEASON", input.filter.scope),
      key: "SEASON" as const,
      label: "Season",
    },
    {
      href: buildRankingsHref("LIFETIME", input.filter.scope),
      key: "LIFETIME" as const,
      label: "Lifetime",
    },
  ];

  return { periods, scopes };
}
