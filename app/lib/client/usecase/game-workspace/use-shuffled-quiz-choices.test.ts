import { describe, expect, it } from "vitest";

import { applyChoiceOrder, createShuffledChoiceOrder } from "./use-shuffled-quiz-choices";

describe("use-shuffled-quiz-choices helpers", () => {
  it("creates a shuffled key order without losing choices", () => {
    const originalRandom = Math.random;

    Math.random = () => 0;

    try {
      expect(createShuffledChoiceOrder([
        { key: "a" },
        { key: "b" },
        { key: "c" },
        { key: "d" },
      ])).toEqual(["b", "c", "d", "a"]);
    } finally {
      Math.random = originalRandom;
    }
  });

  it("applies a stored key order to the latest choice objects", () => {
    const ordered = applyChoiceOrder(
      [
        { key: "a", selected: false },
        { key: "b", selected: true },
        { key: "c", selected: false },
      ],
      ["c", "a", "b"],
    );

    expect(ordered.map((choice) => choice.key)).toEqual(["c", "a", "b"]);
    expect(ordered[2]?.selected).toBe(true);
  });

  it("falls back to source order when the stored key order is incomplete", () => {
    const ordered = applyChoiceOrder(
      [
        { key: "a" },
        { key: "b" },
        { key: "c" },
      ],
      ["b", "a"],
    );

    expect(ordered.map((choice) => choice.key)).toEqual(["a", "b", "c"]);
  });
});