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
  "color-census": {
    previewAlt: "Color Census mosaic with a hidden query asking which color appeared most",
    previewSrc: "/images/games/color-census-preview.svg",
  },
  "flip-match": {
    previewAlt: "Flip Match target and live card boards linked by a horizontal flip rule",
    previewSrc: "/images/games/flip-match-preview.svg",
  },
  minesweeper: {
    previewAlt: "Minesweeper board with opened cells and numbered hints",
    previewSrc: "/images/games/minesweeper-preview.png",
  },
  "number-chain": {
    previewAlt: "Number Chain board with numbered tiles that must be tapped in order",
    previewSrc: "/images/games/number-chain-preview.svg",
  },
  "orbit-tap": {
    previewAlt: "Orbit Tap ring with a moving marker and a highlighted gate",
    previewSrc: "/images/games/orbit-tap-preview.svg",
  },
  "path-recall": {
    previewAlt: "Path Recall board showing a remembered route across a grid",
    previewSrc: "/images/games/path-recall-preview.svg",
  },
  "pair-flip": {
    previewAlt: "Pair Flip board with memory cards being turned over to reveal matching symbols",
    previewSrc: "/images/games/pair-flip-preview.svg",
  },
  "pattern-echo": {
    previewAlt: "Pattern Echo board with a 3x3 grid of coloured pads",
    previewSrc: "/images/games/pattern-echo-preview.svg",
  },
  "sequence-point": {
    previewAlt: "Sequence Point grid showing a fast memory sequence across lit points",
    previewSrc: "/images/games/sequence-point-preview.svg",
  },
  "hue-drift": {
    previewAlt: "Hue Drift gradient row with a missing color step and answer swatches",
    previewSrc: "/images/games/hue-drift-preview.svg",
  },
  "precision-drop": {
    previewAlt: "Falling ball above a target line in a vertical lane",
    previewSrc: "/images/games/precision-drop-preview.svg",
  },
  "pulse-count": {
    previewAlt: "Pulse Count signal orb with answer buttons beneath it",
    previewSrc: "/images/games/pulse-count-preview.svg",
  },
  "quick-sum": {
    previewAlt: "Quick Sum prompt card with arithmetic and multiple answer choices",
    previewSrc: "/images/games/quick-sum-preview.svg",
  },
  "symbol-hunt": {
    previewAlt: "Symbol Hunt board with a target symbol and a noisy symbol grid",
    previewSrc: "/images/games/symbol-hunt-preview.svg",
  },
  "spot-change": {
    previewAlt: "Spot Change original and changed scene boards with one highlighted difference",
    previewSrc: "/images/games/spot-change-preview.svg",
  },
  sudoku: {
    previewAlt: "Sudoku puzzle board with preset digits and empty cells",
    previewObjectPosition: "top center",
    previewSrc: "/images/games/sudoku-preview.png",
  },
  "target-trail": {
    previewAlt: "Target Trail grid with one highlighted tile and visited cells behind it",
    previewSrc: "/images/games/target-trail-preview.svg",
  },
  "light-grid": {
    previewAlt: "Light Grid target and live boards shown side by side",
    previewSrc: "/images/games/light-grid-preview.svg",
  },
  "tile-shift": {
    previewAlt: "Tile Shift target board and live board with row and column controls",
    previewSrc: "/images/games/tile-shift-preview.svg",
  },
  "stack-sort": {
    previewAlt: "Stack Sort puzzle with colored token columns",
    previewSrc: "/images/games/stack-sort-preview.svg",
  },
  "mirror-match": {
    previewAlt: "Mirror Match target pattern next to an editable mirror board",
    previewSrc: "/images/games/mirror-match-preview.svg",
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
