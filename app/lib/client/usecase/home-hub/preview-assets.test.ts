import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

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

describe("home preview assets", () => {
  it("keeps every preview asset square", () => {
    const previewAssets = readdirSync(previewAssetDirectory)
      .filter((fileName) => /preview\.(png|svg)$/.test(fileName))
      .sort();

    expect(previewAssets.length).toBeGreaterThan(0);

    for (const fileName of previewAssets) {
      const filePath = path.join(previewAssetDirectory, fileName);

      if (fileName.endsWith(".png")) {
        const dimensions = getPngDimensions(filePath);

        expect(dimensions.width, `${fileName} width`).toBe(dimensions.height);
        continue;
      }

      const dimensions = getSvgDimensions(filePath);

      if (dimensions.width !== null || dimensions.height !== null) {
        expect(dimensions.width, `${fileName} width attribute`).toBe(dimensions.height);
      }

      expect(dimensions.viewBoxWidth, `${fileName} viewBox width`).toBe(dimensions.viewBoxHeight);
    }
  });
});
