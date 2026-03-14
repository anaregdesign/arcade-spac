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
      key: "color-census",
      metricValue: "0:58",
      name: "Color Census",
      playCount: 2,
      recommendationText: "Rapid mosaic memory",
      shortDescription: "Read the full color spread",
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
    {
      currentRank: null,
      key: "spot-change",
      metricValue: "1:05",
      name: "Spot Change",
      playCount: 2,
      recommendationText: "Fresh comparison board",
      shortDescription: "Find every difference",
    },
    {
      currentRank: null,
      key: "sequence-point",
      metricValue: "0:54",
      name: "Sequence Point",
      playCount: 4,
      recommendationText: "Working memory sprint",
      shortDescription: "Replay the point sequence",
    },
    {
      currentRank: null,
      key: "hue-drift",
      metricValue: "0:47",
      name: "Hue Drift",
      playCount: 3,
      recommendationText: "Color inference sprint",
      shortDescription: "Fill the missing gradient step",
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
        previewAlt: "Color Census mosaic with a hidden query asking which color appeared most",
        previewObjectPosition: undefined,
        previewSrc: "/images/games/color-census-preview.svg",
        recordLabel: "Best 0:58",
        runLabel: "2 runs",
        statusLabel: "Played",
      },
      {
        ...games[2],
        previewAlt: "Sudoku puzzle board with preset digits and empty cells",
        previewObjectPosition: "top center",
        previewSrc: "/images/games/sudoku-preview.png",
        recordLabel: "No record",
        runLabel: "1 runs",
        statusLabel: "Played",
      },
      {
        ...games[3],
        previewAlt: null,
        previewObjectPosition: undefined,
        previewSrc: null,
        recordLabel: "No record",
        runLabel: "First run",
        statusLabel: "New",
      },
      {
        ...games[4],
        previewAlt: "Spot Change original and changed scene boards with one highlighted difference",
        previewObjectPosition: undefined,
        previewSrc: "/images/games/spot-change-preview.svg",
        recordLabel: "Best 1:05",
        runLabel: "2 runs",
        statusLabel: "Played",
      },
      {
        ...games[5],
        previewAlt: "Sequence Point grid showing a fast memory sequence across lit points",
        previewObjectPosition: undefined,
        previewSrc: "/images/games/sequence-point-preview.svg",
        recordLabel: "Best 0:54",
        runLabel: "4 runs",
        statusLabel: "Played",
      },
      {
        ...games[6],
        previewAlt: "Hue Drift gradient row with a missing color step and answer swatches",
        previewObjectPosition: undefined,
        previewSrc: "/images/games/hue-drift-preview.svg",
        recordLabel: "Best 0:47",
        runLabel: "3 runs",
        statusLabel: "Played",
      },
    ]);
  });
});
