import { describe, expect, it } from "vitest";

import {
  areBooleanGridsEqual,
  createBooleanGrid,
  pickDistinctIndices,
  rotateValues,
  toggleCellWithOrthogonalNeighbors,
} from "./game-utils";

describe("game-workspace game-utils", () => {
  it("creates, toggles, and compares boolean grids", () => {
    const grid = createBooleanGrid(3, 3);

    toggleCellWithOrthogonalNeighbors(grid, 1, 1);

    expect(grid).toEqual([
      [false, true, false],
      [true, true, true],
      [false, true, false],
    ]);
    expect(areBooleanGridsEqual(grid, [
      [false, true, false],
      [true, true, true],
      [false, true, false],
    ])).toBe(true);
    expect(areBooleanGridsEqual(grid, createBooleanGrid(3, 3))).toBe(false);
  });

  it("rotates arrays and returns unique random indices", () => {
    expect(rotateValues(["a", "b", "c", "d"], 1)).toEqual(["d", "a", "b", "c"]);
    expect(rotateValues(["a", "b", "c", "d"], 5)).toEqual(["d", "a", "b", "c"]);

    const indices = pickDistinctIndices(8, 4);

    expect(indices).toHaveLength(4);
    expect(new Set(indices).size).toBe(4);
    expect(indices.every((index) => index >= 0 && index < 8)).toBe(true);
  });
});
