export const supportedGames = [
  { key: "minesweeper", name: "Minesweeper", storedKey: "MINESWEEPER" },
  { key: "sudoku", name: "Sudoku", storedKey: "SUDOKU" },
  { key: "drop-line", name: "Drop Line", storedKey: "DROP_LINE" },
] as const;

export type GameKey = (typeof supportedGames)[number]["key"];
export type StoredGameKey = (typeof supportedGames)[number]["storedKey"];

export type GameLink = {
  href: string;
  key: GameKey;
  label: string;
};

export function isGameKey(value: string): value is GameKey {
  return supportedGames.some((game) => game.key === value);
}

export function toStoredGameKey(gameKey: GameKey): StoredGameKey;
export function toStoredGameKey(gameKey: string): string;
export function toStoredGameKey(gameKey: string) {
  return gameKey.toUpperCase().replace(/-/g, "_");
}

export function toRouteGameKey(gameKey: StoredGameKey): GameKey;
export function toRouteGameKey(gameKey: string): string;
export function toRouteGameKey(gameKey: string) {
  return gameKey.toLowerCase().replace(/_/g, "-");
}

export function getGameName(gameKey: string) {
  return supportedGames.find((game) => game.key === gameKey)?.name ?? gameKey;
}

export function buildAlternateGameLinks(currentGameKey: string): GameLink[] {
  return supportedGames
    .filter((game) => game.key !== currentGameKey)
    .map((game) => ({
      href: `/games/${game.key}`,
      key: game.key,
      label: `Play ${game.name}`,
    }));
}
