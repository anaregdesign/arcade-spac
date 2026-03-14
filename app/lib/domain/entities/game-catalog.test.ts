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

    expect(resolveGameKey("BEAT_MATCH")).toBe("beat-match");
    expect(resolveGameKey("BLOCK_TESSELLATE")).toBe("block-tessellate");
    expect(resolveGameKey("BOUNCE_ANGLE")).toBe("bounce-angle");
    expect(resolveGameKey("BOX_FILL")).toBe("box-fill");
    expect(resolveGameKey("BUBBLE_SPAWN")).toBe("bubble-spawn");
    expect(resolveGameKey("CASCADE_CLEAR")).toBe("cascade-clear");
    expect(resolveGameKey("CHAIN_TRIGGER")).toBe("chain-trigger");
    expect(resolveGameKey("COLOR_SWEEP")).toBe("color-sweep");
    expect(resolveGameKey("ICON_CHAIN")).toBe("icon-chain");
    expect(resolveGameKey("LINE_CONNECT")).toBe("line-connect");
    expect(resolveGameKey("MERGE_CLIMB")).toBe("merge-climb");
    expect(resolveGameKey("RELATIVE_PITCH")).toBe("relative-pitch");
    expect(resolveGameKey("drop-ball")).toBe("precision-drop");
    expect(resolveGameKey("drop_line")).toBe("precision-drop");
    expect(resolveGameKey("ORBIT_TAP")).toBe("orbit-tap");
    expect(resolveGameKey("SPOT_CHANGE")).toBe("spot-change");
    expect(resolveGameKey("SEQUENCE_POINT")).toBe("sequence-point");
    expect(resolveGameKey("HUE_DRIFT")).toBe("hue-drift");
    expect(resolveGameKey("COLOR_CENSUS")).toBe("color-census");
    expect(resolveGameKey("FLIP_MATCH")).toBe("flip-match");
    expect(resolveGameKey("PHASE_LOCK")).toBe("phase-lock");
    expect(resolveGameKey("POSITION_LOCK")).toBe("position-lock");
    expect(resolveGameKey("ROTATE_ALIGN")).toBe("rotate-align");
    expect(resolveGameKey("SPINNER_AIM")).toBe("spinner-aim");
    expect(resolveGameKey("SYNC_PULSE")).toBe("sync-pulse");
    expect(resolveGameKey("GLOW_CYCLE")).toBe("glow-cycle");
    expect(resolveGameKey("TAP_SAFE")).toBe("tap-safe");
    expect(resolveGameKey("TEMPO_HOLD")).toBe("tempo-hold");
    expect(resolveGameKey("TEMPO_WEAVE")).toBe("tempo-weave");
    expect(resolveGameKey("TILE_INSTANT")).toBe("tile-instant");
    expect(resolveGameKey("ZONE_LOCK")).toBe("zone-lock");
    expect(resolveGameKey("unknown-mode")).toBeNull();

    expect(toStoredGameKey("beat-match")).toBe("BEAT_MATCH");
    expect(toStoredGameKey("block-tessellate")).toBe("BLOCK_TESSELLATE");
    expect(toStoredGameKey("bounce-angle")).toBe("BOUNCE_ANGLE");
    expect(toStoredGameKey("box-fill")).toBe("BOX_FILL");
    expect(toStoredGameKey("bubble-spawn")).toBe("BUBBLE_SPAWN");
    expect(toStoredGameKey("cascade-clear")).toBe("CASCADE_CLEAR");
    expect(toStoredGameKey("chain-trigger")).toBe("CHAIN_TRIGGER");
    expect(toStoredGameKey("color-sweep")).toBe("COLOR_SWEEP");
    expect(toStoredGameKey("icon-chain")).toBe("ICON_CHAIN");
    expect(toStoredGameKey("line-connect")).toBe("LINE_CONNECT");
    expect(toStoredGameKey("merge-climb")).toBe("MERGE_CLIMB");
    expect(toStoredGameKey("relative-pitch")).toBe("RELATIVE_PITCH");
    expect(toStoredGameKey("color-census")).toBe("COLOR_CENSUS");
    expect(toStoredGameKey("flip-match")).toBe("FLIP_MATCH");
    expect(toStoredGameKey("phase-lock")).toBe("PHASE_LOCK");
    expect(toStoredGameKey("position-lock")).toBe("POSITION_LOCK");
    expect(toStoredGameKey("rotate-align")).toBe("ROTATE_ALIGN");
    expect(toStoredGameKey("spinner-aim")).toBe("SPINNER_AIM");
    expect(toStoredGameKey("sync-pulse")).toBe("SYNC_PULSE");
    expect(toStoredGameKey("glow-cycle")).toBe("GLOW_CYCLE");
    expect(toStoredGameKey("tap-safe")).toBe("TAP_SAFE");
    expect(toStoredGameKey("tempo-hold")).toBe("TEMPO_HOLD");
    expect(toStoredGameKey("tempo-weave")).toBe("TEMPO_WEAVE");
    expect(toStoredGameKey("tile-instant")).toBe("TILE_INSTANT");
    expect(toStoredGameKey("zone-lock")).toBe("ZONE_LOCK");
    expect(toStoredGameKey("drop-ball")).toBe("DROP_LINE");
    expect(toStoredGameKey("orbit-tap")).toBe("ORBIT_TAP");
    expect(toStoredGameKey("spot-change")).toBe("SPOT_CHANGE");
    expect(toStoredGameKey("sequence-point")).toBe("SEQUENCE_POINT");
    expect(toStoredGameKey("hue-drift")).toBe("HUE_DRIFT");
    expect(toStoredGameKey("custom-mode")).toBe("CUSTOM_MODE");

    expect(toRouteGameKey("BEAT_MATCH")).toBe("beat-match");
    expect(toRouteGameKey("BLOCK_TESSELLATE")).toBe("block-tessellate");
    expect(toRouteGameKey("BOUNCE_ANGLE")).toBe("bounce-angle");
    expect(toRouteGameKey("BOX_FILL")).toBe("box-fill");
    expect(toRouteGameKey("BUBBLE_SPAWN")).toBe("bubble-spawn");
    expect(toRouteGameKey("CASCADE_CLEAR")).toBe("cascade-clear");
    expect(toRouteGameKey("CHAIN_TRIGGER")).toBe("chain-trigger");
    expect(toRouteGameKey("COLOR_SWEEP")).toBe("color-sweep");
    expect(toRouteGameKey("ICON_CHAIN")).toBe("icon-chain");
    expect(toRouteGameKey("LINE_CONNECT")).toBe("line-connect");
    expect(toRouteGameKey("MERGE_CLIMB")).toBe("merge-climb");
    expect(toRouteGameKey("RELATIVE_PITCH")).toBe("relative-pitch");
    expect(toRouteGameKey("drop_ball")).toBe("precision-drop");
    expect(toRouteGameKey("TARGET_TRAIL")).toBe("target-trail");
    expect(toRouteGameKey("SPOT_CHANGE")).toBe("spot-change");
    expect(toRouteGameKey("SEQUENCE_POINT")).toBe("sequence-point");
    expect(toRouteGameKey("HUE_DRIFT")).toBe("hue-drift");
    expect(toRouteGameKey("COLOR_CENSUS")).toBe("color-census");
    expect(toRouteGameKey("FLIP_MATCH")).toBe("flip-match");
    expect(toRouteGameKey("PHASE_LOCK")).toBe("phase-lock");
    expect(toRouteGameKey("POSITION_LOCK")).toBe("position-lock");
    expect(toRouteGameKey("ROTATE_ALIGN")).toBe("rotate-align");
    expect(toRouteGameKey("SPINNER_AIM")).toBe("spinner-aim");
    expect(toRouteGameKey("SYNC_PULSE")).toBe("sync-pulse");
    expect(toRouteGameKey("GLOW_CYCLE")).toBe("glow-cycle");
    expect(toRouteGameKey("TAP_SAFE")).toBe("tap-safe");
    expect(toRouteGameKey("TEMPO_HOLD")).toBe("tempo-hold");
    expect(toRouteGameKey("TEMPO_WEAVE")).toBe("tempo-weave");
    expect(toRouteGameKey("TILE_INSTANT")).toBe("tile-instant");
    expect(toRouteGameKey("ZONE_LOCK")).toBe("zone-lock");
    expect(toRouteGameKey("CUSTOM_MODE")).toBe("custom-mode");
  });

  it("returns definitions and fallback metadata", () => {
    expect(getGameDefinition("BEAT_MATCH")?.name).toBe("Beat Match");
    expect(getGameDefinition("BLOCK_TESSELLATE")?.name).toBe("Block Tessellate");
    expect(getGameDefinition("BOUNCE_ANGLE")?.name).toBe("Bounce Angle");
    expect(getGameDefinition("BOX_FILL")?.name).toBe("Box Fill");
    expect(getGameDefinition("BUBBLE_SPAWN")?.name).toBe("Bubble Spawn");
    expect(getGameDefinition("CASCADE_CLEAR")?.name).toBe("Cascade Clear");
    expect(getGameDefinition("CHAIN_TRIGGER")?.name).toBe("Chain Trigger");
    expect(getGameDefinition("DROP_LINE")?.name).toBe("Precision Drop");
    expect(getGameDefinition("ICON_CHAIN")?.name).toBe("Icon Chain");
    expect(getGameDefinition("LINE_CONNECT")?.name).toBe("Line Connect");
    expect(getGameDefinition("MERGE_CLIMB")?.name).toBe("Merge Climb");
    expect(getGameDefinition("RELATIVE_PITCH")?.name).toBe("Relative Pitch");
    expect(getGameDefinition("ORBIT_TAP")?.name).toBe("Orbit Tap");
    expect(getGameDefinition("COLOR_CENSUS")?.name).toBe("Color Census");
    expect(getGameDefinition("FLIP_MATCH")?.name).toBe("Flip Match");
    expect(getGameDefinition("PHASE_LOCK")?.name).toBe("Phase Lock");
    expect(getGameDefinition("POSITION_LOCK")?.name).toBe("Position Lock");
    expect(getGameDefinition("ROTATE_ALIGN")?.name).toBe("Rotate Align");
    expect(getGameDefinition("SPINNER_AIM")?.name).toBe("Spinner Aim");
    expect(getGameDefinition("SYNC_PULSE")?.name).toBe("Sync Pulse");
    expect(getGameDefinition("GLOW_CYCLE")?.name).toBe("Glow Cycle");
    expect(getGameDefinition("TAP_SAFE")?.name).toBe("Tap Safe");
    expect(getGameDefinition("TEMPO_HOLD")?.name).toBe("Tempo Hold");
    expect(getGameDefinition("TEMPO_WEAVE")?.name).toBe("Tempo Weave");
    expect(getGameDefinition("TILE_INSTANT")?.name).toBe("Tile Instant");
    expect(getGameDefinition("ZONE_LOCK")?.name).toBe("Zone Lock");
    expect(getGameDefinition("SPOT_CHANGE")?.name).toBe("Spot Change");
    expect(getGameDefinition("SEQUENCE_POINT")?.name).toBe("Sequence Point");
    expect(getGameDefinition("HUE_DRIFT")?.name).toBe("Hue Drift");
    expect(getGameDefinition("custom-mode")).toBeNull();

    expect(getGameName("DROP_LINE")).toBe("Precision Drop");
    expect(getGameName("custom-mode")).toBe("custom-mode");

    expect(getGameHomeTags("BEAT_MATCH")).toEqual(["timing", "rhythm"]);
    expect(getGameHomeTags("BLOCK_TESSELLATE")).toEqual(["logic", "spatial"]);
    expect(getGameHomeTags("BOUNCE_ANGLE")).toEqual(["logic", "spatial"]);
    expect(getGameHomeTags("BOX_FILL")).toEqual(["logic", "spatial"]);
    expect(getGameHomeTags("BUBBLE_SPAWN")).toEqual(["reflex", "logic"]);
    expect(getGameHomeTags("CASCADE_CLEAR")).toEqual(["logic", "perception"]);
    expect(getGameHomeTags("CHAIN_TRIGGER")).toEqual(["logic", "spatial"]);
    expect(getGameHomeTags("DROP_LINE")).toEqual(["timing", "fast-start"]);
    expect(getGameHomeTags("ICON_CHAIN")).toEqual(["logic", "memory"]);
    expect(getGameHomeTags("LINE_CONNECT")).toEqual(["logic", "spatial"]);
    expect(getGameHomeTags("MERGE_CLIMB")).toEqual(["logic", "spatial"]);
    expect(getGameHomeTags("RELATIVE_PITCH")).toEqual(["audio", "memory"]);
    expect(getGameHomeTags("ORBIT_TAP")).toEqual(["timing", "fast-start"]);
    expect(getGameHomeTags("COLOR_CENSUS")).toEqual(["memory", "perception"]);
    expect(getGameHomeTags("FLIP_MATCH")).toEqual(["logic", "spatial"]);
    expect(getGameHomeTags("PHASE_LOCK")).toEqual(["timing", "spatial"]);
    expect(getGameHomeTags("POSITION_LOCK")).toEqual(["memory", "spatial"]);
    expect(getGameHomeTags("ROTATE_ALIGN")).toEqual(["logic", "spatial"]);
    expect(getGameHomeTags("SPINNER_AIM")).toEqual(["timing", "reflex"]);
    expect(getGameHomeTags("SYNC_PULSE")).toEqual(["timing", "rhythm"]);
    expect(getGameHomeTags("GLOW_CYCLE")).toEqual(["timing", "perception"]);
    expect(getGameHomeTags("TAP_SAFE")).toEqual(["reflex", "perception"]);
    expect(getGameHomeTags("TEMPO_HOLD")).toEqual(["timing", "rhythm"]);
    expect(getGameHomeTags("TEMPO_WEAVE")).toEqual(["timing", "rhythm"]);
    expect(getGameHomeTags("TILE_INSTANT")).toEqual(["memory", "spatial"]);
    expect(getGameHomeTags("ZONE_LOCK")).toEqual(["logic", "spatial"]);
    expect(getGameHomeTags("SPOT_CHANGE")).toEqual(["perception", "logic"]);
    expect(getGameHomeTags("SEQUENCE_POINT")).toEqual(["memory", "fast-start"]);
    expect(getGameHomeTags("HUE_DRIFT")).toEqual(["perception", "logic"]);
    expect(getGameHomeTags("custom-mode")).toEqual([]);

    expect(getGameSuccessfulResultLabel("BEAT_MATCH")).toBe("clear");
    expect(getGameSuccessfulResultLabel("BLOCK_TESSELLATE")).toBe("clear");
    expect(getGameSuccessfulResultLabel("BOUNCE_ANGLE")).toBe("clear");
    expect(getGameSuccessfulResultLabel("BOX_FILL")).toBe("clear");
    expect(getGameSuccessfulResultLabel("BUBBLE_SPAWN")).toBe("clear");
    expect(getGameSuccessfulResultLabel("CASCADE_CLEAR")).toBe("clear");
    expect(getGameSuccessfulResultLabel("CHAIN_TRIGGER")).toBe("clear");
    expect(getGameSuccessfulResultLabel("DROP_LINE")).toBe("hit");
    expect(getGameSuccessfulResultLabel("ICON_CHAIN")).toBe("clear");
    expect(getGameSuccessfulResultLabel("LINE_CONNECT")).toBe("clear");
    expect(getGameSuccessfulResultLabel("MERGE_CLIMB")).toBe("clear");
    expect(getGameSuccessfulResultLabel("RELATIVE_PITCH")).toBe("clear");
    expect(getGameSuccessfulResultLabel("COLOR_CENSUS")).toBe("clear");
    expect(getGameSuccessfulResultLabel("FLIP_MATCH")).toBe("clear");
    expect(getGameSuccessfulResultLabel("PHASE_LOCK")).toBe("clear");
    expect(getGameSuccessfulResultLabel("POSITION_LOCK")).toBe("clear");
    expect(getGameSuccessfulResultLabel("ROTATE_ALIGN")).toBe("clear");
    expect(getGameSuccessfulResultLabel("SPINNER_AIM")).toBe("clear");
    expect(getGameSuccessfulResultLabel("SYNC_PULSE")).toBe("clear");
    expect(getGameSuccessfulResultLabel("GLOW_CYCLE")).toBe("clear");
    expect(getGameSuccessfulResultLabel("TAP_SAFE")).toBe("clear");
    expect(getGameSuccessfulResultLabel("TEMPO_HOLD")).toBe("clear");
    expect(getGameSuccessfulResultLabel("TEMPO_WEAVE")).toBe("clear");
    expect(getGameSuccessfulResultLabel("TILE_INSTANT")).toBe("clear");
    expect(getGameSuccessfulResultLabel("ZONE_LOCK")).toBe("clear");
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
