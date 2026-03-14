import { beforeEach, describe, expect, it, vi } from "vitest";

import * as gameCatalog from "../entities/game-catalog";
import {
  buildPrimaryMetricShareLine,
  comparePrimaryMetrics,
  formatOptionalPrimaryMetric,
  formatPrimaryMetric,
  getBestMetricLabel,
  getPrecisionDropHitRating,
  getResultPrimaryMetricLabel,
} from "./game-metrics";

describe("game-metrics", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("formats duration and offset metrics", () => {
    expect(formatPrimaryMetric("color-sweep", 125)).toBe("2:05");
    expect(formatPrimaryMetric("DROP_LINE", 7)).toBe("7 px");
    expect(formatPrimaryMetric("custom-mode", 65)).toBe("1:05");

    expect(formatOptionalPrimaryMetric("sudoku", null)).toBe("No record yet");
    expect(formatOptionalPrimaryMetric("sudoku", 61)).toBe("1:01");
  });

  it("returns metric labels for known and unknown games", () => {
    expect(getBestMetricLabel("precision-drop")).toBe("Best hit offset");
    expect(getBestMetricLabel("custom-mode")).toBe("Best record");

    expect(getResultPrimaryMetricLabel("precision-drop", "FAILED")).toBe("Miss offset");
    expect(getResultPrimaryMetricLabel("precision-drop", "COMPLETED")).toBe("Hit offset");
    expect(getResultPrimaryMetricLabel("custom-mode", "ABANDONED")).toBe("Run time");
    expect(getResultPrimaryMetricLabel("custom-mode", "COMPLETED")).toBe("Clear time");
  });

  it("compares lower-better metrics and unknown games", () => {
    expect(comparePrimaryMetrics("color-sweep", 12, 20)).toBe(-8);
    expect(comparePrimaryMetrics("custom-mode", 12, 20)).toBe(-8);
  });

  it("supports a higher-better metric definition when configured", () => {
    const precisionDropDefinition = gameCatalog.getGameDefinition("precision-drop");

    vi.spyOn(gameCatalog, "toRouteGameKey").mockReturnValue("arcade-max");
    vi.spyOn(gameCatalog, "getGameDefinition").mockReturnValue({
      ...precisionDropDefinition!,
      primaryMetric: {
        ...precisionDropDefinition!.primaryMetric,
        direction: "higher-better",
      },
    } as unknown as NonNullable<ReturnType<typeof gameCatalog.getGameDefinition>>);

    expect(comparePrimaryMetrics("arcade-max", 12, 20)).toBe(8);
  });

  it("builds share lines for duration and offset based games", () => {
    expect(
      buildPrimaryMetricShareLine("precision-drop", {
        difficulty: "HARD",
        gameName: "Precision Drop",
        primaryMetricText: "7 px",
      }),
    ).toBe("Arcade: Precision Drop hard at 7 px offset.");

    expect(
      buildPrimaryMetricShareLine("sudoku", {
        difficulty: "NORMAL",
        gameName: "Sudoku",
        primaryMetricText: "1:03",
      }),
    ).toBe("Arcade: Sudoku normal in 1:03.");
  });

  it("categorizes precision drop hit ratings across all thresholds", () => {
    expect(getPrecisionDropHitRating(99, "FAILED")).toEqual({
      note: "The ball passed the line before the hit registered.",
      value: "Miss",
    });
    expect(getPrecisionDropHitRating(99, "ABANDONED")).toEqual({
      note: "The ball passed the line before the hit registered.",
      value: "Miss",
    });
    expect(getPrecisionDropHitRating(4, "COMPLETED")).toEqual({
      note: "Within 4 px of the line center.",
      value: "Perfect",
    });
    expect(getPrecisionDropHitRating(10, "COMPLETED")).toEqual({
      note: "A tight hit with a small visible offset.",
      value: "Precise",
    });
    expect(getPrecisionDropHitRating(22, "COMPLETED")).toEqual({
      note: "Close enough to score well, with room to tighten the timing.",
      value: "Close",
    });
    expect(getPrecisionDropHitRating(23, "COMPLETED")).toEqual({
      note: "The hit landed, but the timing window was visibly off the line center.",
      value: "Wide",
    });
  });
});
