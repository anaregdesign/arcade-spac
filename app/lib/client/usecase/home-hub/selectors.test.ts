import { describe, expect, it } from "vitest";

import {
  countVisibleRankedGames,
  countVisibleUnplayedGames,
  toHomeGameCards,
} from "./selectors";

describe("home-hub selectors", () => {
  const games = [
    {
      currentRank: 3,
      key: "color-sweep",
      metricValue: "0:42",
      name: "Color Sweep",
      playCount: 5,
      recommendationText: "Fastest improving",
      shortDescription: "Clear tiles",
    },
    {
      currentRank: null,
      key: "sudoku",
      metricValue: "No record yet",
      name: "Sudoku",
      playCount: 1,
      recommendationText: null,
      shortDescription: "Solve the grid",
    },
    {
      currentRank: null,
      key: "custom-mode",
      metricValue: "No record yet",
      name: "Custom Mode",
      playCount: 0,
      recommendationText: null,
      shortDescription: "Experimental",
    },
  ];

  it("counts ranked and unplayed games from visible cards", () => {
    expect(countVisibleRankedGames(games)).toBe(1);
    expect(countVisibleUnplayedGames(games)).toBe(1);
  });

  it("builds home cards with preview and status metadata", () => {
    expect(toHomeGameCards(games)).toEqual([
      {
        ...games[0],
        previewAlt: "Color Sweep board showing a target swatch and a grid of colored tiles",
        previewObjectPosition: undefined,
        previewSrc: "/images/games/color-sweep-preview.svg",
        recordLabel: "Best 0:42",
        runLabel: "5 runs",
        statusLabel: "Rank #3",
      },
      {
        ...games[1],
        previewAlt: "Sudoku puzzle board with preset digits and empty cells",
        previewObjectPosition: "top center",
        previewSrc: "/images/games/sudoku-preview.png",
        recordLabel: "No record",
        runLabel: "1 runs",
        statusLabel: "Played",
      },
      {
        ...games[2],
        previewAlt: null,
        previewObjectPosition: undefined,
        previewSrc: null,
        recordLabel: "No record",
        runLabel: "First run",
        statusLabel: "New",
      },
    ]);
  });
});
