import { describe, expect, it } from "vitest";

import { toGameplayResultFormEntries } from "./form-data";

describe("toGameplayResultFormEntries", () => {
  it("serializes required fields and optional counters", () => {
    const entries = toGameplayResultFormEntries({
      difficulty: "HARD",
      hintCount: 1,
      intent: "completeSteady",
      mistakeCount: 2,
      primaryMetric: 87,
    });

    expect(entries).toEqual([
      ["intent", "completeSteady"],
      ["difficulty", "HARD"],
      ["primaryMetric", "87"],
      ["mistakeCount", "2"],
      ["hintCount", "1"],
    ]);
  });

  it("omits optional counters when they are undefined", () => {
    const entries = toGameplayResultFormEntries({
      difficulty: "NORMAL",
      intent: "fail",
      primaryMetric: 120,
    });

    expect(entries).toEqual([
      ["intent", "fail"],
      ["difficulty", "NORMAL"],
      ["primaryMetric", "120"],
    ]);
  });
});
