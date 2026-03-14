export type GridPoint = {
  columnIndex: number;
  rowIndex: number;
};

export function randomInt(maxExclusive: number) {
  return Math.floor(Math.random() * maxExclusive);
}

export function randomIntInRange(minInclusive: number, maxInclusive: number) {
  return minInclusive + randomInt(maxInclusive - minInclusive + 1);
}

export function shuffleValues<T>(values: readonly T[]) {
  const next = [...values];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = randomInt(index + 1);
    const current = next[index];
    next[index] = next[swapIndex];
    next[swapIndex] = current;
  }

  return next;
}

export function pickDistinctIndices(total: number, count: number) {
  const next = new Set<number>();

  while (next.size < count) {
    next.add(randomInt(total));
  }

  return [...next];
}

export function createBooleanGrid(rowCount: number, columnCount: number, fill = false) {
  return Array.from({ length: rowCount }, () => Array.from({ length: columnCount }, () => fill));
}

export function cloneBooleanGrid(grid: boolean[][]) {
  return grid.map((row) => [...row]);
}

export function areBooleanGridsEqual(left: boolean[][], right: boolean[][]) {
  if (left.length !== right.length) {
    return false;
  }

  for (let rowIndex = 0; rowIndex < left.length; rowIndex += 1) {
    if (left[rowIndex].length !== right[rowIndex]?.length) {
      return false;
    }

    for (let columnIndex = 0; columnIndex < left[rowIndex].length; columnIndex += 1) {
      if (left[rowIndex][columnIndex] !== right[rowIndex][columnIndex]) {
        return false;
      }
    }
  }

  return true;
}

export function toggleBooleanCell(grid: boolean[][], rowIndex: number, columnIndex: number) {
  if (grid[rowIndex]?.[columnIndex] === undefined) {
    return;
  }

  grid[rowIndex][columnIndex] = !grid[rowIndex][columnIndex];
}

export function toggleCellWithOrthogonalNeighbors(grid: boolean[][], rowIndex: number, columnIndex: number) {
  const offsets = [
    [0, 0],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ] as const;

  for (const [rowOffset, columnOffset] of offsets) {
    toggleBooleanCell(grid, rowIndex + rowOffset, columnIndex + columnOffset);
  }
}

export function rotateValues<T>(values: readonly T[], step: number) {
  if (values.length === 0) {
    return [];
  }

  const normalizedStep = ((step % values.length) + values.length) % values.length;

  if (normalizedStep === 0) {
    return [...values];
  }

  return [
    ...values.slice(-normalizedStep),
    ...values.slice(0, values.length - normalizedStep),
  ];
}
