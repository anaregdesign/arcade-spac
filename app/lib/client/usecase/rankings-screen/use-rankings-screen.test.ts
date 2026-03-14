import { describe, expect, it } from "vitest";

import { useRankingsScreen } from "./use-rankings-screen";

describe("useRankingsScreen", () => {
  it("builds scope and period navigation hrefs", () => {
    expect(
      useRankingsScreen({
        filter: {
          period: "SEASON",
          scope: "color-sweep",
        },
        games: [
          { key: "color-sweep", name: "Color Sweep" },
          { key: "sudoku", name: "Sudoku" },
        ],
      }),
    ).toEqual({
      periods: [
        {
          href: "/rankings?period=season&scope=color-sweep",
          key: "SEASON",
          label: "Season",
        },
        {
          href: "/rankings?period=lifetime&scope=color-sweep",
          key: "LIFETIME",
          label: "Lifetime",
        },
      ],
      scopes: [
        {
          href: "/rankings?period=season&scope=overall",
          key: "overall",
          label: "Overall",
        },
        {
          href: "/rankings?period=season&scope=color-sweep",
          key: "color-sweep",
          label: "Color Sweep",
        },
        {
          href: "/rankings?period=season&scope=sudoku",
          key: "sudoku",
          label: "Sudoku",
        },
      ],
    });
  });
});
