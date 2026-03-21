import { describe, expect, it } from "vitest";

import {
  countVisibleRankedGames,
  countVisibleUnplayedGames,
  toHomeGameCards,
} from "./selectors";

const games = [
  {
    currentRank: null,
    isFavorite: false,
    key: "beat-match",
    metricLabel: "Best clear time",
    metricValue: "0:55",
    name: "Beat Match",
    playCount: 2,
    recommendationText: "Combo rhythm lane",
    shortDescription: "Tap the highlighted lane in rhythm to build combo and clear the hit goal",
  },
  {
    currentRank: 3,
    isFavorite: true,
    key: "color-sweep",
    metricLabel: "Best clear time",
    metricValue: "0:42",
    name: "Color Sweep",
    playCount: 5,
    recommendationText: "Fastest improving",
    shortDescription: "Clear tiles",
  },
  {
    currentRank: null,
    isFavorite: false,
    key: "custom-mode",
    metricLabel: "Best clear time",
    metricValue: "No record yet",
    name: "Custom Mode",
    playCount: 0,
    recommendationText: null,
    shortDescription: "Experimental",
  },
];

describe("home-hub selectors", () => {
  it("counts ranked and unplayed games from visible cards", () => {
    expect(countVisibleRankedGames(games)).toBe(1);
    expect(countVisibleUnplayedGames(games)).toBe(1);
  });

  it("builds home cards with preview and metric summary metadata", () => {
    expect(toHomeGameCards(games)).toEqual([
      {
        ...games[0],
        metricSummary: "Best clear time: 0:55",
        previewAlt: "Beat Match lane board with a center hit zone and three rhythm lanes",
        previewObjectPosition: undefined,
        previewSrc: "/images/games/beat-match-preview.svg",
        runLabel: "2 runs",
      },
      {
        ...games[1],
        metricSummary: "Best clear time: 0:42",
        previewAlt: "Color Sweep board showing a target swatch and a grid of colored tiles",
        previewObjectPosition: undefined,
        previewSrc: "/images/games/color-sweep-preview.svg",
        runLabel: "5 runs",
      },
      {
        ...games[2],
        metricSummary: "No record yet",
        previewAlt: null,
        previewObjectPosition: undefined,
        previewSrc: null,
        runLabel: "First run",
      },
    ]);
  });
});
