import { describe, expect, it } from "vitest";

import { createGameplayResultFormData } from "./form-data";

describe("createGameplayResultFormData", () => {
  it("serializes required fields and optional counters", () => {
    const formData = createGameplayResultFormData({
      difficulty: "HARD",
      hintCount: 1,
      intent: "completeSteady",
      mistakeCount: 2,
      primaryMetric: 87,
    });

    expect(Object.fromEntries(formData.entries())).toEqual({
      difficulty: "HARD",
      hintCount: "1",
      intent: "completeSteady",
      mistakeCount: "2",
      primaryMetric: "87",
    });
  });

  it("omits optional counters when they are undefined", () => {
    const formData = createGameplayResultFormData({
      difficulty: "NORMAL",
      intent: "fail",
      primaryMetric: 120,
    });

    expect(Object.fromEntries(formData.entries())).toEqual({
      difficulty: "NORMAL",
      intent: "fail",
      primaryMetric: "120",
    });
  });
});
