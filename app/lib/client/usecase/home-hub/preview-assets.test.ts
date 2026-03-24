import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { supportedGames } from "../../../domain/entities/game-catalog";
import { previewByGameKey } from "./selectors";

const previewAssetDirectory = path.resolve(process.cwd(), "public/images/games");

function getPngDimensions(filePath: string) {
  const buffer = readFileSync(filePath);

  return {
    height: buffer.readUInt32BE(20),
    width: buffer.readUInt32BE(16),
  };
}

function getSvgDimensions(filePath: string) {
  const source = readFileSync(filePath, "utf8");
  const svgTagMatch = source.match(/<svg\b[^>]*>/);
  const viewBoxMatch = source.match(/viewBox="([^"]+)"/);
  const widthMatch = svgTagMatch?.[0].match(/\bwidth="([^"]+)"/);
  const heightMatch = svgTagMatch?.[0].match(/\bheight="([^"]+)"/);

  if (!viewBoxMatch) {
    throw new Error(`Preview asset is missing a viewBox: ${filePath}`);
  }

  const [, , viewBoxWidth, viewBoxHeight] = viewBoxMatch[1].trim().split(/\s+/).map(Number);

  return {
    height: heightMatch ? Number(heightMatch[1]) : null,
    viewBoxHeight,
    viewBoxWidth,
    width: widthMatch ? Number(widthMatch[1]) : null,
  };
}

function getAspectRatio(width: number, height: number) {
  return Number((width / height).toFixed(4));
}

describe("home preview assets", () => {
  it("covers every supported game with a home preview mapping", () => {
    const supportedGameKeys = supportedGames.map((game) => game.key).sort();
    const previewGameKeys = Object.keys(previewByGameKey).sort();

    expect(previewGameKeys).toEqual(supportedGameKeys);
  });

  it("keeps the generated preview files in sync and structurally valid", () => {
    const referencedPreviewAssets = Object.entries(previewByGameKey)
      .map(([gameKey, preview]) => {
        expect(preview.previewAlt, `${gameKey} previewAlt`).toBeTruthy();
        expect(preview.previewSrc, `${gameKey} previewSrc`).toMatch(/^\/images\/games\/.+-preview\.svg$/);

        return path.basename(preview.previewSrc ?? "");
      })
      .sort();

    const previewAssets = readdirSync(previewAssetDirectory)
      .filter((fileName) => /preview\.(png|svg)$/.test(fileName))
      .sort();

    expect(previewAssets).toEqual(referencedPreviewAssets);
    expect(previewAssets.length).toBe(supportedGames.length);

    for (const fileName of previewAssets) {
      const filePath = path.join(previewAssetDirectory, fileName);

      expect(existsSync(filePath), `${fileName} exists`).toBe(true);

      if (fileName.endsWith(".png")) {
        const dimensions = getPngDimensions(filePath);

        expect(dimensions.width, `${fileName} width`).toBe(dimensions.height);
        continue;
      }

      const dimensions = getSvgDimensions(filePath);

      expect(dimensions.viewBoxWidth, `${fileName} viewBox width`).toBeGreaterThan(0);
      expect(dimensions.viewBoxHeight, `${fileName} viewBox height`).toBeGreaterThan(0);

      if (dimensions.width !== null || dimensions.height !== null) {
        expect(dimensions.width, `${fileName} width attribute`).not.toBeNull();
        expect(dimensions.height, `${fileName} height attribute`).not.toBeNull();

        expect(
          getAspectRatio(dimensions.width ?? 0, dimensions.height ?? 0),
          `${fileName} explicit aspect ratio`,
        ).toBe(getAspectRatio(dimensions.viewBoxWidth, dimensions.viewBoxHeight));
      }
    }
  });
});
