import { describe, expect, it } from "vitest";

import { formatDuration, formatElapsedMs } from "./display";

describe("game-workspace display", () => {
  it("formats durations and elapsed milliseconds", () => {
    expect(formatDuration(125)).toBe("2:05");
    expect(formatElapsedMs(1234)).toBe("1.23s");
  });
});
