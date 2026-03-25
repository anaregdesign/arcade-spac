export type SudokuFlickDigitSlot = {
  columnIndex: number;
  digit: number;
  rowIndex: number;
};

export const SUDOKU_FLICK_DIGIT_SLOTS: SudokuFlickDigitSlot[] = Array.from({ length: 9 }, (_, index) => ({
  columnIndex: index % 3,
  digit: index + 1,
  rowIndex: Math.floor(index / 3),
}));

export const SUDOKU_FLICK_TAP_SLOP_PX = 10;
export const SUDOKU_FLICK_LANE_PX = 28;

export function resolveSudokuFlickDigit(deltaX: number, deltaY: number) {
  if (Math.hypot(deltaX, deltaY) < SUDOKU_FLICK_TAP_SLOP_PX) {
    return null;
  }

  const columnIndex = deltaX < -SUDOKU_FLICK_LANE_PX ? 0 : deltaX > SUDOKU_FLICK_LANE_PX ? 2 : 1;
  const rowIndex = deltaY < -SUDOKU_FLICK_LANE_PX ? 0 : deltaY > SUDOKU_FLICK_LANE_PX ? 2 : 1;

  return rowIndex * 3 + columnIndex + 1;
}
