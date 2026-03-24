import { describe, expect, it } from "vitest";

import { buildGameplayShareText } from "./build-gameplay-share-text";

describe("buildGameplayShareText", () => {
  it("builds a compact gameplay share message with the route url", () => {
    expect(buildGameplayShareText({
      gameDescription: "Find the safe path before the timer runs out.",
      gameName: "Tap Safe",
      shareUrl: "https://arcade.example/games/tap-safe",
    })).toBe([
      "Tap Safe",
      "Find the safe path before the timer runs out.",
      "Play here: https://arcade.example/games/tap-safe",
    ].join("\n"));
  });
});