import { describe, expect, it, vi } from "vitest";

import {
  buildAlternateGameLinks,
  getGameDefinition,
  getGameHomeTags,
  getGameName,
  getGameSuccessfulResultLabel,
  isGameKey,
  listPersistedGames,
  resolveGameKey,
  supportedGames,
  toRouteGameKey,
  toStoredGameKey,
} from "./game-catalog";

describe("game-catalog", () => {
  it("lists persisted metadata for every supported game", () => {
    expect(listPersistedGames()).toEqual(
      supportedGames.map((game) => ({
        accentColor: game.accentColor,
        id: game.id,
        key: game.storedKey,
        name: game.name,
        rulesSummary: game.rulesSummary,
        shortDescription: game.shortDescription,
      })),
    );
  });

  it("resolves route and stored keys, including legacy aliases", () => {
    expect(isGameKey("color-sweep")).toBe(true);
    expect(isGameKey("COLOR_SWEEP")).toBe(false);

    expect(resolveGameKey("COLOR_SWEEP")).toBe("color-sweep");
    expect(resolveGameKey("drop-ball")).toBe("precision-drop");
    expect(resolveGameKey("drop_line")).toBe("precision-drop");
    expect(resolveGameKey("ORBIT_TAP")).toBe("orbit-tap");
    expect(resolveGameKey("SPOT_CHANGE")).toBe("spot-change");
    expect(resolveGameKey("SEQUENCE_POINT")).toBe("sequence-point");
    expect(resolveGameKey("HUE_DRIFT")).toBe("hue-drift");
    expect(resolveGameKey("unknown-mode")).toBeNull();

    expect(toStoredGameKey("color-sweep")).toBe("COLOR_SWEEP");
    expect(toStoredGameKey("drop-ball")).toBe("DROP_LINE");
    expect(toStoredGameKey("orbit-tap")).toBe("ORBIT_TAP");
    expect(toStoredGameKey("spot-change")).toBe("SPOT_CHANGE");
    expect(toStoredGameKey("sequence-point")).toBe("SEQUENCE_POINT");
    expect(toStoredGameKey("hue-drift")).toBe("HUE_DRIFT");
    expect(toStoredGameKey("custom-mode")).toBe("CUSTOM_MODE");

    expect(toRouteGameKey("COLOR_SWEEP")).toBe("color-sweep");
    expect(toRouteGameKey("drop_ball")).toBe("precision-drop");
    expect(toRouteGameKey("TARGET_TRAIL")).toBe("target-trail");
    expect(toRouteGameKey("SPOT_CHANGE")).toBe("spot-change");
    expect(toRouteGameKey("SEQUENCE_POINT")).toBe("sequence-point");
    expect(toRouteGameKey("HUE_DRIFT")).toBe("hue-drift");
    expect(toRouteGameKey("CUSTOM_MODE")).toBe("custom-mode");
  });

  it("returns definitions and fallback metadata", () => {
    expect(getGameDefinition("DROP_LINE")?.name).toBe("Precision Drop");
    expect(getGameDefinition("ORBIT_TAP")?.name).toBe("Orbit Tap");
    expect(getGameDefinition("SPOT_CHANGE")?.name).toBe("Spot Change");
    expect(getGameDefinition("SEQUENCE_POINT")?.name).toBe("Sequence Point");
    expect(getGameDefinition("HUE_DRIFT")?.name).toBe("Hue Drift");
    expect(getGameDefinition("custom-mode")).toBeNull();

    expect(getGameName("DROP_LINE")).toBe("Precision Drop");
    expect(getGameName("custom-mode")).toBe("custom-mode");

    expect(getGameHomeTags("DROP_LINE")).toEqual(["timing", "fast-start"]);
    expect(getGameHomeTags("ORBIT_TAP")).toEqual(["timing", "fast-start"]);
    expect(getGameHomeTags("SPOT_CHANGE")).toEqual(["perception", "logic"]);
    expect(getGameHomeTags("SEQUENCE_POINT")).toEqual(["memory", "fast-start"]);
    expect(getGameHomeTags("HUE_DRIFT")).toEqual(["perception", "logic"]);
    expect(getGameHomeTags("custom-mode")).toEqual([]);

    expect(getGameSuccessfulResultLabel("DROP_LINE")).toBe("hit");
    expect(getGameSuccessfulResultLabel("SPOT_CHANGE")).toBe("clear");
    expect(getGameSuccessfulResultLabel("SEQUENCE_POINT")).toBe("clear");
    expect(getGameSuccessfulResultLabel("HUE_DRIFT")).toBe("clear");
    expect(getGameSuccessfulResultLabel("custom-mode")).toBe("clear");
  });

  it("returns null when a normalized key no longer has a catalog entry", () => {
    const originalGet = Map.prototype.get;

    vi.spyOn(Map.prototype, "get").mockImplementation(function mockGet(this: Map<unknown, unknown>, key: unknown) {
      if (this.size === supportedGames.length && key === "precision-drop") {
        return undefined;
      }

      return originalGet.call(this, key);
    });

    expect(getGameDefinition("precision-drop")).toBeNull();
  });

  it("builds alternate links from the normalized current game key", () => {
    expect(buildAlternateGameLinks("DROP_LINE")).toEqual(
      supportedGames
        .filter((game) => game.key !== "precision-drop")
        .map((game) => ({
          href: `/games/${game.key}`,
          key: game.key,
          label: `Play ${game.name}`,
        })),
    );
  });
});
