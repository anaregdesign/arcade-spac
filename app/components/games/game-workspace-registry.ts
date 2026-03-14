import type { ComponentType } from "react";

import { ColorSweepGameWorkspace } from "./color-sweep/ColorSweepGameWorkspace";
import { MinesweeperGameWorkspace } from "./minesweeper/MinesweeperGameWorkspace";
import { NumberChainGameWorkspace } from "./number-chain/NumberChainGameWorkspace";
import { PairFlipGameWorkspace } from "./pair-flip/PairFlipGameWorkspace";
import { PatternEchoGameWorkspace } from "./pattern-echo/PatternEchoGameWorkspace";
import { PrecisionDropGameWorkspace } from "./precision-drop/PrecisionDropGameWorkspace";
import type { GameInstructions } from "./shared/GameInstructionsDialog";
import { SudokuGameWorkspace } from "./sudoku/SudokuGameWorkspace";
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
  "color-sweep": {
    instructions: {
      summary: "Find the target color, tap only those tiles, and clear the whole set before the timer expires.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to randomize the board and arm the timer." },
            { label: "Clear", detail: "Tap every tile that matches the target color before the time limit expires. The Result screen opens automatically on clear." },
            { label: "Timeout", detail: "If any target tile remains when the timer ends, the run is saved as not cleared and opens the Result screen automatically." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Read the target", detail: "The target color is shown above the board and in the status chips." },
            { label: "Tap carefully", detail: "Correct target tiles disappear. Wrong taps increase the support metric but do not stop the run." },
            { label: "Stay mobile-safe", detail: "Every tile is a first-class tap target on desktop and touch devices." },
          ],
        },
      ],
      title: "Color Sweep controls",
    },
    presentation: {
      previewAlt: "Color Sweep board showing a target swatch and a grid of colored tiles",
      previewSrc: "/images/games/color-sweep-preview.svg",
    },
    workspace: ColorSweepGameWorkspace,
  },
  "precision-drop": {
    instructions: {
      summary: "Start a drop, watch the ball accelerate as it falls, and tap once when it overlaps the line to keep the hit offset as small as possible.",
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
            { label: "Read the score", detail: "The smaller the hit offset in px, the better the result, even as the ball speeds up while falling." },
            { label: "Miss handling", detail: "If the ball drops past the line before you tap, the run is saved as a miss and excluded from rankings." },
          ],
        },
      ],
      title: "Precision Drop controls",
    },
    presentation: {
      previewAlt: "Falling ball above a target line in a vertical lane",
      previewSrc: "/images/games/precision-drop-preview.svg",
    },
    workspace: PrecisionDropGameWorkspace,
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
            { label: "Mistakes", detail: "A mine ends the board immediately and opens the Result screen with a failed run." },
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
  "number-chain": {
    instructions: {
      summary: "Tap the numbered tiles in ascending order, keep mistakes low, and finish the whole chain before the timer expires.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to shuffle the numbered board and arm the timer." },
            { label: "Clear", detail: "Tap every number in ascending order. The Result screen opens automatically after the last number." },
            { label: "Timeout", detail: "If the timer ends before the chain is complete, the run is saved as not cleared and opens the Result screen automatically." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Follow the chain", detail: "The current next number stays visible above the board and in the status row." },
            { label: "Tap carefully", detail: "Only the correct next number advances the chain. Wrong taps raise the support metric but do not stop the board." },
            { label: "Replay quickly", detail: "The board resets with a fresh shuffle every time a new run starts." },
          ],
        },
      ],
      title: "Number Chain controls",
    },
    presentation: {
      previewAlt: "Number Chain board with numbered tiles that must be tapped in order",
      previewSrc: "/images/games/number-chain-preview.svg",
    },
    workspace: NumberChainGameWorkspace,
  },
  "pair-flip": {
    instructions: {
      summary: "Flip two cards at a time, remember their positions, and match every pair before the timer expires.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to shuffle a new memory board and arm the timer." },
            { label: "Clear", detail: "Match every pair on the board. The Result screen opens automatically after the last pair." },
            { label: "Timeout", detail: "If any pair remains when the timer ends, the run is saved as not cleared and opens the Result screen automatically." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Flip two cards", detail: "Open one card, then another. Matching symbols stay visible." },
            { label: "Read mismatches", detail: "If the symbols differ, both cards flip back after a short reveal and the mismatch count increases." },
            { label: "Stay focused", detail: "Matched cards remain out of play so you can narrow the board down pair by pair." },
          ],
        },
      ],
      title: "Pair Flip controls",
    },
    presentation: {
      previewAlt: "Pair Flip board with memory cards being turned over to reveal matching symbols",
      previewSrc: "/images/games/pair-flip-preview.svg",
    },
    workspace: PairFlipGameWorkspace,
  },
  "pattern-echo": {
    instructions: {
      summary: "Watch the coloured pads flash in sequence, then reproduce the exact same order before the timer expires.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to begin a new sequence and arm the timer." },
            { label: "Watch phase", detail: "Each pad lights up once in order. You cannot tap during this phase — just memorise the sequence." },
            { label: "Input phase", detail: "Once the last pad fades, tap each pad in the exact order you saw. The Result screen opens automatically on clear." },
            { label: "Timeout", detail: "If the timer ends before the sequence is completed, the run is saved as not cleared and opens the Result screen automatically." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Watch carefully", detail: "The status row shows Watching while the sequence plays. Each pad flashes once." },
            { label: "Tap in order", detail: "After the watch phase the status switches to Live. Tap the pads in the same order." },
            { label: "Wrong taps", detail: "Incorrect taps increase the wrong input count but do not stop the run. Keep going until the sequence is complete or time runs out." },
          ],
        },
      ],
      title: "Pattern Echo controls",
    },
    presentation: {
      previewAlt: "Pattern Echo board with a 3×3 grid of coloured pads",
      previewSrc: "/images/games/pattern-echo-preview.svg",
    },
    workspace: PatternEchoGameWorkspace,
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
