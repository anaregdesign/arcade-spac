import type { ComponentType } from "react";

import { DropLineGameWorkspace } from "./drop-line/drop-line-game-workspace";
import { MinesweeperGameWorkspace } from "./minesweeper/minesweeper-game-workspace";
import type { GameInstructions } from "./shared/game-instructions-dialog";
import { SudokuGameWorkspace } from "./sudoku/sudoku-game-workspace";
import type { GameWorkspaceComponentProps } from "./shared/game-workspace-types";

type GamePresentation = {
  previewAlt: string;
  previewObjectPosition?: string;
  previewSrc: string;
};

type GameDefinition = {
  instructions: GameInstructions;
  presentation: GamePresentation;
  workspace: ComponentType<GameWorkspaceComponentProps>;
};

const gameDefinitionByKey: Record<string, GameDefinition> = {
  "drop-line": {
    instructions: {
      summary: "Start a drop, watch the ball fall, and tap once when it overlaps the line to keep the hit offset as small as possible.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to drop a new ball from a random height." },
            { label: "Hit", detail: "Tap anywhere in the lane when the ball overlaps the line. The Result screen opens automatically after the hit." },
            { label: "Miss", detail: "If the ball falls past the lane before the hit lands, the run is recorded as missed and excluded from rankings." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Tap to score", detail: "The lane accepts one click or tap during a live run." },
            { label: "Read the score", detail: "The smaller the hit offset in px, the better the result." },
            { label: "Leave", detail: "Go home or switch games during a live drop to record the run as abandoned." },
          ],
        },
      ],
      title: "Drop Line controls",
    },
    presentation: {
      previewAlt: "Falling ball above a target line in a vertical lane",
      previewSrc: "/images/games/drop-line-preview.svg",
    },
    workspace: DropLineGameWorkspace,
  },
  minesweeper: {
    instructions: {
      summary: "Use a single tap to open cells and open the guide any time you need the core board controls again.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run, or just open the first cell to begin on the board." },
            { label: "Clear", detail: "Reveal every safe cell. When the board ends, the Result screen opens automatically." },
            { label: "Leave", detail: "Go home or switch games during a live board to record the attempt as abandoned." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Open cell", detail: "Primary click or tap a closed cell to reveal it." },
            { label: "Flag cell", detail: "Secondary click a closed cell on desktop, or switch on Flag mode to mark mines on touch devices." },
            { label: "Read clues", detail: "A revealed number shows how many mines touch that cell." },
          ],
        },
      ],
      title: "Minesweeper controls",
    },
    presentation: {
      previewAlt: "Minesweeper board with opened cells and numbered hints",
      previewSrc: "/images/games/minesweeper-preview.png",
    },
    workspace: MinesweeperGameWorkspace,
  },
  sudoku: {
    instructions: {
      summary: "Start a puzzle, select a cell, and use the keypad or keyboard shortcuts to fill the board without cluttering the screen.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to begin a new puzzle." },
            { label: "Clear", detail: "Fill every editable cell with the correct digit to finish the puzzle and open the Result screen automatically." },
            { label: "Finish run", detail: "Use Finish run during a live puzzle when you want to store a not-cleared Result and move on." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Select cell", detail: "Tap any editable square to focus it." },
            { label: "Enter digit", detail: "Use the keypad or press 1-9 on the keyboard." },
            { label: "Clear or hint", detail: "Press Clear cell, Delete, or Backspace to empty the selected square. Press H or Use hint for the next correct digit." },
          ],
        },
      ],
      title: "Sudoku controls",
    },
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

export function getGameInstructions(gameKey: string) {
  return gameDefinitionByKey[gameKey]?.instructions ?? null;
}
