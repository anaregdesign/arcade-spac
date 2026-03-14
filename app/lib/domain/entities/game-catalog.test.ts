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
    expect(resolveGameKey("COLOR_CENSUS")).toBe("color-census");
    expect(resolveGameKey("FLIP_MATCH")).toBe("flip-match");
    expect(resolveGameKey("POSITION_LOCK")).toBe("position-lock");
    expect(resolveGameKey("ROTATE_ALIGN")).toBe("rotate-align");
    expect(resolveGameKey("SPINNER_AIM")).toBe("spinner-aim");
    expect(resolveGameKey("TAP_SAFE")).toBe("tap-safe");
    expect(resolveGameKey("unknown-mode")).toBeNull();

    expect(toStoredGameKey("color-sweep")).toBe("COLOR_SWEEP");
    expect(toStoredGameKey("color-census")).toBe("COLOR_CENSUS");
    expect(toStoredGameKey("flip-match")).toBe("FLIP_MATCH");
    expect(toStoredGameKey("position-lock")).toBe("POSITION_LOCK");
    expect(toStoredGameKey("rotate-align")).toBe("ROTATE_ALIGN");
    expect(toStoredGameKey("spinner-aim")).toBe("SPINNER_AIM");
    expect(toStoredGameKey("tap-safe")).toBe("TAP_SAFE");
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
    expect(toRouteGameKey("COLOR_CENSUS")).toBe("color-census");
    expect(toRouteGameKey("FLIP_MATCH")).toBe("flip-match");
    expect(toRouteGameKey("POSITION_LOCK")).toBe("position-lock");
    expect(toRouteGameKey("ROTATE_ALIGN")).toBe("rotate-align");
    expect(toRouteGameKey("SPINNER_AIM")).toBe("spinner-aim");
    expect(toRouteGameKey("TAP_SAFE")).toBe("tap-safe");
    expect(toRouteGameKey("CUSTOM_MODE")).toBe("custom-mode");
  });

  it("returns definitions and fallback metadata", () => {
    expect(getGameDefinition("DROP_LINE")?.name).toBe("Precision Drop");
    expect(getGameDefinition("ORBIT_TAP")?.name).toBe("Orbit Tap");
    expect(getGameDefinition("COLOR_CENSUS")?.name).toBe("Color Census");
    expect(getGameDefinition("FLIP_MATCH")?.name).toBe("Flip Match");
    expect(getGameDefinition("POSITION_LOCK")?.name).toBe("Position Lock");
    expect(getGameDefinition("ROTATE_ALIGN")?.name).toBe("Rotate Align");
    expect(getGameDefinition("SPINNER_AIM")?.name).toBe("Spinner Aim");
    expect(getGameDefinition("TAP_SAFE")?.name).toBe("Tap Safe");
    expect(getGameDefinition("SPOT_CHANGE")?.name).toBe("Spot Change");
    expect(getGameDefinition("SEQUENCE_POINT")?.name).toBe("Sequence Point");
    expect(getGameDefinition("HUE_DRIFT")?.name).toBe("Hue Drift");
    expect(getGameDefinition("custom-mode")).toBeNull();

    expect(getGameName("DROP_LINE")).toBe("Precision Drop");
    expect(getGameName("custom-mode")).toBe("custom-mode");

    expect(getGameHomeTags("DROP_LINE")).toEqual(["timing", "fast-start"]);
    expect(getGameHomeTags("ORBIT_TAP")).toEqual(["timing", "fast-start"]);
    expect(getGameHomeTags("COLOR_CENSUS")).toEqual(["memory", "perception"]);
    expect(getGameHomeTags("FLIP_MATCH")).toEqual(["logic", "spatial"]);
    expect(getGameHomeTags("POSITION_LOCK")).toEqual(["memory", "spatial"]);
    expect(getGameHomeTags("ROTATE_ALIGN")).toEqual(["logic", "spatial"]);
    expect(getGameHomeTags("SPINNER_AIM")).toEqual(["timing", "reflex"]);
    expect(getGameHomeTags("TAP_SAFE")).toEqual(["reflex", "perception"]);
    expect(getGameHomeTags("SPOT_CHANGE")).toEqual(["perception", "logic"]);
    expect(getGameHomeTags("SEQUENCE_POINT")).toEqual(["memory", "fast-start"]);
    expect(getGameHomeTags("HUE_DRIFT")).toEqual(["perception", "logic"]);
    expect(getGameHomeTags("custom-mode")).toEqual([]);

    expect(getGameSuccessfulResultLabel("DROP_LINE")).toBe("hit");
    expect(getGameSuccessfulResultLabel("COLOR_CENSUS")).toBe("clear");
    expect(getGameSuccessfulResultLabel("FLIP_MATCH")).toBe("clear");
    expect(getGameSuccessfulResultLabel("POSITION_LOCK")).toBe("clear");
    expect(getGameSuccessfulResultLabel("ROTATE_ALIGN")).toBe("clear");
    expect(getGameSuccessfulResultLabel("SPINNER_AIM")).toBe("clear");
    expect(getGameSuccessfulResultLabel("TAP_SAFE")).toBe("clear");
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
