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
    expect(resolveGameKey("unknown-mode")).toBeNull();

    expect(toStoredGameKey("color-sweep")).toBe("COLOR_SWEEP");
    expect(toStoredGameKey("drop-ball")).toBe("DROP_LINE");
    expect(toStoredGameKey("custom-mode")).toBe("CUSTOM_MODE");

    expect(toRouteGameKey("COLOR_SWEEP")).toBe("color-sweep");
    expect(toRouteGameKey("drop_ball")).toBe("precision-drop");
    expect(toRouteGameKey("CUSTOM_MODE")).toBe("custom-mode");
  });

  it("returns definitions and fallback metadata", () => {
    expect(getGameDefinition("DROP_LINE")?.name).toBe("Precision Drop");
    expect(getGameDefinition("custom-mode")).toBeNull();

    expect(getGameName("DROP_LINE")).toBe("Precision Drop");
    expect(getGameName("custom-mode")).toBe("custom-mode");

    expect(getGameHomeTags("DROP_LINE")).toEqual(["timing", "fast-start"]);
    expect(getGameHomeTags("custom-mode")).toEqual([]);

    expect(getGameSuccessfulResultLabel("DROP_LINE")).toBe("hit");
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
