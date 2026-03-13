import type { ComponentType } from "react";

import { MinesweeperGameWorkspace } from "./minesweeper/minesweeper-game-workspace";
import { SudokuGameWorkspace } from "./sudoku/sudoku-game-workspace";
import type { GameWorkspaceComponentProps } from "./shared/game-workspace-types";

type GamePresentation = {
  previewAlt: string;
  previewObjectPosition?: string;
  previewSrc: string;
};

type GameDefinition = {
  presentation: GamePresentation;
  workspace: ComponentType<GameWorkspaceComponentProps>;
};

const gameDefinitionByKey: Record<string, GameDefinition> = {
  minesweeper: {
    presentation: {
      previewAlt: "Minesweeper board with opened cells and numbered hints",
      previewSrc: "/images/games/minesweeper-preview.png",
    },
    workspace: MinesweeperGameWorkspace,
  },
  sudoku: {
    presentation: {
      previewAlt: "Sudoku puzzle board with preset digits and empty cells",
      previewObjectPosition: "top center",
      previewSrc: "/images/games/sudoku-preview.png",
    },
    workspace: SudokuGameWorkspace,
  },
};

export function getGameWorkspaceComponent(gameKey: string) {
  return gameDefinitionByKey[gameKey]?.workspace ?? null;
}

export function getGamePresentation(gameKey: string) {
  return gameDefinitionByKey[gameKey]?.presentation ?? null;
}
