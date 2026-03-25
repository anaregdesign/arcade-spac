import { describe, expect, it } from "vitest";

import { resolveSudokuFlickDigit } from "./sudoku-flick";

describe("resolveSudokuFlickDigit", () => {
  it("treats a tap-sized movement as selection only", () => {
    expect(resolveSudokuFlickDigit(0, 0)).toBeNull();
    expect(resolveSudokuFlickDigit(6, 6)).toBeNull();
  });

  it("maps the outer lanes to the surrounding digits", () => {
    expect(resolveSudokuFlickDigit(-40, -40)).toBe(1);
    expect(resolveSudokuFlickDigit(0, -40)).toBe(2);
    expect(resolveSudokuFlickDigit(40, -40)).toBe(3);
    expect(resolveSudokuFlickDigit(-40, 0)).toBe(4);
    expect(resolveSudokuFlickDigit(40, 0)).toBe(6);
    expect(resolveSudokuFlickDigit(-40, 40)).toBe(7);
    expect(resolveSudokuFlickDigit(0, 40)).toBe(8);
    expect(resolveSudokuFlickDigit(40, 40)).toBe(9);
  });

  it("keeps the center lane available for digit five after the gesture starts moving", () => {
    expect(resolveSudokuFlickDigit(12, 0)).toBe(5);
    expect(resolveSudokuFlickDigit(-18, 8)).toBe(5);
  });
});
