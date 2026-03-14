type HomeGame = {
  currentRank: number | null;
  key: string;
  metricValue: string;
  name: string;
  playCount: number;
  recommendationText: string | null;
  shortDescription: string;
};

export type HomeGameCard = HomeGame & {
  previewAlt: string | null;
  previewObjectPosition?: string;
  previewSrc: string | null;
  recordLabel: string;
  runLabel: string;
  statusLabel: string;
};

const previewByGameKey: Record<string, Pick<HomeGameCard, "previewAlt" | "previewObjectPosition" | "previewSrc">> = {
  "color-sweep": {
    previewAlt: "Color Sweep board showing a target swatch and a grid of colored tiles",
    previewSrc: "/images/games/color-sweep-preview.svg",
  },
  minesweeper: {
    previewAlt: "Minesweeper board with opened cells and numbered hints",
    previewSrc: "/images/games/minesweeper-preview.png",
  },
  "number-chain": {
    previewAlt: "Number Chain board with numbered tiles that must be tapped in order",
    previewSrc: "/images/games/number-chain-preview.svg",
  },
  "pair-flip": {
    previewAlt: "Pair Flip board with memory cards being turned over to reveal matching symbols",
    previewSrc: "/images/games/pair-flip-preview.svg",
  },
  "pattern-echo": {
    previewAlt: "Pattern Echo board with a 3x3 grid of coloured pads",
    previewSrc: "/images/games/pattern-echo-preview.svg",
  },
  "precision-drop": {
    previewAlt: "Falling ball above a target line in a vertical lane",
    previewSrc: "/images/games/precision-drop-preview.svg",
  },
  sudoku: {
    previewAlt: "Sudoku puzzle board with preset digits and empty cells",
    previewObjectPosition: "top center",
    previewSrc: "/images/games/sudoku-preview.png",
  },
};

function getGameStatusLabel(game: Pick<HomeGame, "currentRank" | "playCount">) {
  if (game.currentRank) {
    return `Rank #${game.currentRank}`;
  }

  return game.playCount > 0 ? "Played" : "New";
}

function getGameRecordLabel(game: Pick<HomeGame, "metricValue">) {
  return game.metricValue === "No record yet" ? "No record" : `Best ${game.metricValue}`;
}

export function countVisibleRankedGames(games: HomeGame[]) {
  return games.filter((game) => game.currentRank !== null).length;
}

export function countVisibleUnplayedGames(games: HomeGame[]) {
  return games.filter((game) => game.playCount === 0).length;
}

export function toHomeGameCards(games: HomeGame[]): HomeGameCard[] {
  return games.map((game) => {
    const preview = previewByGameKey[game.key];

    return {
      ...game,
      previewAlt: preview?.previewAlt ?? null,
      previewObjectPosition: preview?.previewObjectPosition,
      previewSrc: preview?.previewSrc ?? null,
      recordLabel: getGameRecordLabel(game),
      runLabel: game.playCount > 0 ? `${game.playCount} runs` : "First run",
      statusLabel: getGameStatusLabel(game),
    };
  });
}
