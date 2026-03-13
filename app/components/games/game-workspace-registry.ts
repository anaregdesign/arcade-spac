import type { ComponentType } from "react";

import { MinesweeperGameWorkspace } from "./minesweeper/minesweeper-game-workspace";
import { SudokuGameWorkspace } from "./sudoku/sudoku-game-workspace";
import type { GameWorkspaceComponentProps } from "./shared/game-workspace-types";

const gameWorkspaceByKey: Record<string, ComponentType<GameWorkspaceComponentProps>> = {
  minesweeper: MinesweeperGameWorkspace,
  sudoku: SudokuGameWorkspace,
};

export function getGameWorkspaceComponent(gameKey: string) {
  return gameWorkspaceByKey[gameKey] ?? null;
}
