import type { ComponentType } from "react";

import { ColorSweepGameWorkspace } from "./color-sweep/ColorSweepGameWorkspace";
import { HiddenFindGameWorkspace } from "./hidden-find/HiddenFindGameWorkspace";
import { MinesweeperGameWorkspace } from "./minesweeper/MinesweeperGameWorkspace";
import { NumberChainGameWorkspace } from "./number-chain/NumberChainGameWorkspace";
import { OrbitTapGameWorkspace } from "./orbit-tap/OrbitTapGameWorkspace";
import { PathRecallGameWorkspace } from "./path-recall/PathRecallGameWorkspace";
import { PairFlipGameWorkspace } from "./pair-flip/PairFlipGameWorkspace";
import { PatternEchoGameWorkspace } from "./pattern-echo/PatternEchoGameWorkspace";
import { PrecisionDropGameWorkspace } from "./precision-drop/PrecisionDropGameWorkspace";
import { PulseCountGameWorkspace } from "./pulse-count/PulseCountGameWorkspace";
import { QuickSumGameWorkspace } from "./quick-sum/QuickSumGameWorkspace";
import type { GameInstructions } from "./shared/GameInstructionsDialog";
import { SwapSolveGameWorkspace } from "./swap-solve/SwapSolveGameWorkspace";
import { SudokuGameWorkspace } from "./sudoku/SudokuGameWorkspace";
import { SymbolHuntGameWorkspace } from "./symbol-hunt/SymbolHuntGameWorkspace";
import { LightGridGameWorkspace } from "./light-grid/LightGridGameWorkspace";
import { StackSortGameWorkspace } from "./stack-sort/StackSortGameWorkspace";
import { TargetTrailGameWorkspace } from "./target-trail/TargetTrailGameWorkspace";
import { TileShiftGameWorkspace } from "./tile-shift/TileShiftGameWorkspace";
import { MirrorMatchGameWorkspace } from "./mirror-match/MirrorMatchGameWorkspace";
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
  "orbit-tap": {
    instructions: {
      summary: "Watch the marker circle the ring, tap while it passes through the highlighted gate, and chain enough hits to finish the run.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to start the orbit." },
            { label: "Hit chain", detail: "Every tap that lands inside the gate records one clean hit and moves the gate to a new angle." },
            { label: "Timeout", detail: "If the hit goal is not met before the timer expires, the run is saved as not cleared and opens the Result screen automatically." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Tap on the gate", detail: "Tap when the moving marker overlaps the yellow gate on the orbit ring." },
            { label: "Miss handling", detail: "Taps outside the gate raise the miss count but the run keeps going." },
            { label: "Stay touch-safe", detail: "The full orbit pad is tappable on desktop and touch devices." },
          ],
        },
      ],
      title: "Orbit Tap controls",
    },
    presentation: {
      previewAlt: "Orbit Tap ring with a moving marker and a highlighted gate",
      previewSrc: "/images/games/orbit-tap-preview.svg",
    },
    workspace: OrbitTapGameWorkspace,
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
  "hidden-find": {
    instructions: {
      summary: "Study the target motif, scan the crowded scene, and tap the one exact match before time runs out.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to load the first crowded scene." },
            { label: "Clear scenes", detail: "Each correct tap advances immediately to the next scene until the full set is complete." },
            { label: "Timeout", detail: "If the timer ends before every scene target is found, the run is saved as not cleared and opens the Result screen automatically." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Read the target", detail: "The exact motif to find stays visible above the board." },
            { label: "Tap once", detail: "Only one tile in the scene is the true match. Correct taps advance the run immediately." },
            { label: "Miss pressure", detail: "Wrong taps add to the support metric and cost time, but the scene stays active." },
          ],
        },
      ],
      title: "Hidden Find controls",
    },
    presentation: {
      previewAlt: "Hidden Find scene filled with lookalike symbols and one highlighted target motif",
      previewSrc: "/images/games/hidden-find-preview.svg",
    },
    workspace: HiddenFindGameWorkspace,
  },
  "target-trail": {
    instructions: {
      summary: "Follow the active target as it jumps to a new cell each time, keep misses low, and finish the trail before the timer expires.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to spawn the first live target." },
            { label: "Follow the trail", detail: "Each correct tap moves the live target to a new tile." },
            { label: "Timeout", detail: "If the full trail is not finished before the timer expires, the run is saved as not cleared and opens the Result screen automatically." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Tap the live tile", detail: "Only the bright tile advances the trail." },
            { label: "Read misses", detail: "Wrong taps increase the miss count but do not stop the run." },
            { label: "Keep moving", detail: "Visited tiles stay dim so you can read how far the trail has progressed." },
          ],
        },
      ],
      title: "Target Trail controls",
    },
    presentation: {
      previewAlt: "Target Trail grid with one highlighted tile and visited cells behind it",
      previewSrc: "/images/games/target-trail-preview.svg",
    },
    workspace: TargetTrailGameWorkspace,
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
  "path-recall": {
    instructions: {
      summary: "Watch the path light up cell by cell, then replay the same cells in the same order before the timer expires.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to begin the watch phase." },
            { label: "Watch phase", detail: "The path highlights one step at a time and the board stays read-only." },
            { label: "Input phase", detail: "After the last flash, tap the same cells in the same order to finish the run." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Memorize the path", detail: "Use the highlighted cells to remember the full route before input begins." },
            { label: "Replay in order", detail: "Only the next correct cell advances the path." },
            { label: "Wrong cells", detail: "Mistakes increase the wrong cell count but the run keeps going until clear or timeout." },
          ],
        },
      ],
      title: "Path Recall controls",
    },
    presentation: {
      previewAlt: "Path Recall board showing a remembered route across a grid",
      previewSrc: "/images/games/path-recall-preview.svg",
    },
    workspace: PathRecallGameWorkspace,
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
  "pulse-count": {
    instructions: {
      summary: "Count the flashes in each round, then choose the number you saw before the next watch phase begins.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to begin the first pulse round." },
            { label: "Watch", detail: "The centre signal flashes a fixed number of times while the answer buttons stay disabled." },
            { label: "Answer", detail: "Pick the count you saw and move straight into the next round until the full sprint is done." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Count first", detail: "Only the watch phase shows the pulse signal." },
            { label: "Pick one answer", detail: "Use the number buttons to answer after the watch phase ends." },
            { label: "Wrong answers", detail: "Incorrect counts increase the wrong answer total but the run keeps going." },
          ],
        },
      ],
      title: "Pulse Count controls",
    },
    presentation: {
      previewAlt: "Pulse Count signal orb with answer buttons beneath it",
      previewSrc: "/images/games/pulse-count-preview.svg",
    },
    workspace: PulseCountGameWorkspace,
  },
  "quick-sum": {
    instructions: {
      summary: "Solve each arithmetic prompt from the answer grid, keep wrong answers low, and clear the sprint before the timer expires.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to load the first prompt." },
            { label: "Solve each prompt", detail: "Every answer moves directly to the next prompt until the sprint is complete." },
            { label: "Timeout", detail: "If the timer ends before every prompt is solved, the run is saved as not cleared and opens the Result screen automatically." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Read the prompt", detail: "The current arithmetic prompt is shown in the centre of the board." },
            { label: "Tap the answer", detail: "Choose one of the four answer buttons for each prompt." },
            { label: "Wrong answers", detail: "Incorrect picks increase the wrong answer count but the sprint keeps moving." },
          ],
        },
      ],
      title: "Quick Sum controls",
    },
    presentation: {
      previewAlt: "Quick Sum prompt card with arithmetic and multiple answer choices",
      previewSrc: "/images/games/quick-sum-preview.svg",
    },
    workspace: QuickSumGameWorkspace,
  },
  "swap-solve": {
    instructions: {
      summary: "Compare the live board with the target board, select two cells to swap them, and restore the full arrangement before time or swaps run out.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to generate a scrambled board with a fixed swap budget." },
            { label: "Clear", detail: "Match the target board exactly before the timer or swap budget expires. The Result screen opens automatically on clear." },
            { label: "Fail", detail: "If the swap budget is exhausted or the timer ends before the board is restored, the run is saved as failed and opens the Result screen automatically." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Select first tile", detail: "Tap any live tile to arm it for swapping." },
            { label: "Complete the swap", detail: "Tap a second tile to exchange the two positions instantly." },
            { label: "Track pressure", detail: "Watch mismatch count, swap budget, and time left while you work back toward the target." },
          ],
        },
      ],
      title: "Swap Solve controls",
    },
    presentation: {
      previewAlt: "Swap Solve board showing target and live grids connected by a swap arrow",
      previewSrc: "/images/games/swap-solve-preview.svg",
    },
    workspace: SwapSolveGameWorkspace,
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
  "symbol-hunt": {
    instructions: {
      summary: "Find every copy of the target symbol, ignore the decoys, and clear the full board before the timer expires.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to randomize a new symbol board." },
            { label: "Hunt the target", detail: "Tap every tile that matches the target symbol." },
            { label: "Timeout", detail: "If any target symbol remains when the timer expires, the run is saved as not cleared and opens the Result screen automatically." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Read the target", detail: "The target symbol stays visible above the board throughout the run." },
            { label: "Tap carefully", detail: "Correct symbols disappear. Wrong taps increase the support metric." },
            { label: "Stay touch-safe", detail: "Every symbol tile is a first-class tap target on desktop and touch devices." },
          ],
        },
      ],
      title: "Symbol Hunt controls",
    },
    presentation: {
      previewAlt: "Symbol Hunt board with a target symbol and a noisy symbol grid",
      previewSrc: "/images/games/symbol-hunt-preview.svg",
    },
    workspace: SymbolHuntGameWorkspace,
  },
  "light-grid": {
    instructions: {
      summary: "Match the live grid to the target by flipping one cell and its orthogonal neighbours with each move.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to generate a new target pattern." },
            { label: "Match the target", detail: "The run clears as soon as the live grid matches the target grid." },
            { label: "Timeout", detail: "If the timer expires before both grids match, the run is saved as not cleared and opens the Result screen automatically." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Tap the live grid", detail: "Each tap flips the selected cell and its orthogonal neighbours." },
            { label: "Read the target", detail: "The target grid stays visible next to the live grid for the full run." },
            { label: "Moves", detail: "Every legal tap increases the move count shown in the status chips and result." },
          ],
        },
      ],
      title: "Light Grid controls",
    },
    presentation: {
      previewAlt: "Light Grid target and live boards shown side by side",
      previewSrc: "/images/games/light-grid-preview.svg",
    },
    workspace: LightGridGameWorkspace,
  },
  "tile-shift": {
    instructions: {
      summary: "Shift rows to the right and columns downward until the live board matches the target pattern.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to scramble the live board." },
            { label: "Align the board", detail: "Use the row and column controls until the live board matches the target." },
            { label: "Timeout", detail: "If the timer expires before the boards match, the run is saved as not cleared and opens the Result screen automatically." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Shift a row", detail: "Use the row control to rotate that line one step to the right." },
            { label: "Shift a column", detail: "Use the column control to rotate that line one step downward." },
            { label: "Moves", detail: "Every shift counts as one move in the result summary." },
          ],
        },
      ],
      title: "Tile Shift controls",
    },
    presentation: {
      previewAlt: "Tile Shift target board and live board with row and column controls",
      previewSrc: "/images/games/tile-shift-preview.svg",
    },
    workspace: TileShiftGameWorkspace,
  },
  "stack-sort": {
    instructions: {
      summary: "Select a source stack, then a destination stack, and group every colour into its own stack before time runs out.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to load a new stack puzzle." },
            { label: "Sort by colour", detail: "Move top tokens until every non-empty stack contains only one colour." },
            { label: "Timeout", detail: "If the timer expires before the puzzle is sorted, the run is saved as not cleared and opens the Result screen automatically." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Select source", detail: "Tap a stack with at least one token to select its top token." },
            { label: "Select destination", detail: "Tap another stack to move the top token when the move is legal." },
            { label: "Invalid moves", detail: "Illegal destinations do not move the token, and the run keeps going." },
          ],
        },
      ],
      title: "Stack Sort controls",
    },
    presentation: {
      previewAlt: "Stack Sort puzzle with colored token columns",
      previewSrc: "/images/games/stack-sort-preview.svg",
    },
    workspace: StackSortGameWorkspace,
  },
  "mirror-match": {
    instructions: {
      summary: "Use the target board as a reference and rebuild its mirrored pattern on the editable board before the timer expires.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to generate a new target and mirror board." },
            { label: "Mirror the target", detail: "Toggle cells on the editable board until it matches the mirrored target pattern." },
            { label: "Timeout", detail: "If the timer expires before the mirrored pattern is complete, the run is saved as not cleared and opens the Result screen automatically." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Read the target", detail: "The target board stays visible on the left for the full run." },
            { label: "Toggle the mirror", detail: "Tap a cell on the editable board to switch it on or off." },
            { label: "Moves", detail: "Every toggle counts as one move in the result summary." },
          ],
        },
      ],
      title: "Mirror Match controls",
    },
    presentation: {
      previewAlt: "Mirror Match target pattern next to an editable mirror board",
      previewSrc: "/images/games/mirror-match-preview.svg",
    },
    workspace: MirrorMatchGameWorkspace,
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
