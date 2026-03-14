import type { ComponentType } from "react";

import { ColorCensusGameWorkspace } from "./color-census/ColorCensusGameWorkspace";
import { ColorSweepGameWorkspace } from "./color-sweep/ColorSweepGameWorkspace";
import { FlipMatchGameWorkspace } from "./flip-match/FlipMatchGameWorkspace";
import { HiddenFindGameWorkspace } from "./hidden-find/HiddenFindGameWorkspace";
import { HueDriftGameWorkspace } from "./hue-drift/HueDriftGameWorkspace";
import { MinesweeperGameWorkspace } from "./minesweeper/MinesweeperGameWorkspace";
import { NumberChainGameWorkspace } from "./number-chain/NumberChainGameWorkspace";
import { OrbitTapGameWorkspace } from "./orbit-tap/OrbitTapGameWorkspace";
import { PathRecallGameWorkspace } from "./path-recall/PathRecallGameWorkspace";
import { PairFlipGameWorkspace } from "./pair-flip/PairFlipGameWorkspace";
import { PatternEchoGameWorkspace } from "./pattern-echo/PatternEchoGameWorkspace";
import { PhaseLockGameWorkspace } from "./phase-lock/PhaseLockGameWorkspace";
import { PositionLockGameWorkspace } from "./position-lock/PositionLockGameWorkspace";
import { PrecisionDropGameWorkspace } from "./precision-drop/PrecisionDropGameWorkspace";
import { PulseCountGameWorkspace } from "./pulse-count/PulseCountGameWorkspace";
import { QuickSumGameWorkspace } from "./quick-sum/QuickSumGameWorkspace";
import { RotateAlignGameWorkspace } from "./rotate-align/RotateAlignGameWorkspace";
import { SequencePointGameWorkspace } from "./sequence-point/SequencePointGameWorkspace";
import { ShapeMorphGameWorkspace } from "./shape-morph/ShapeMorphGameWorkspace";
import { SpinnerAimGameWorkspace } from "./spinner-aim/SpinnerAimGameWorkspace";
import { SpotChangeGameWorkspace } from "./spot-change/SpotChangeGameWorkspace";
import { SyncPulseGameWorkspace } from "./sync-pulse/SyncPulseGameWorkspace";
import { TapSafeGameWorkspace } from "./tap-safe/TapSafeGameWorkspace";
import type { GameInstructions } from "./shared/GameInstructionsDialog";
import { SwapSolveGameWorkspace } from "./swap-solve/SwapSolveGameWorkspace";
import { SumGridGameWorkspace } from "./sum-grid/SumGridGameWorkspace";
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
  "color-census": {
    instructions: {
      summary: "Memorize the mosaic while it is visible, then answer the color-distribution query from memory before the timer expires.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to open the first watch phase." },
            { label: "Watch then answer", detail: "Each round starts with a short mosaic reveal and then unlocks a majority or exact-count question." },
            { label: "Timeout", detail: "If the timer expires before the full sprint is answered, the run is saved as not cleared and opens the Result screen automatically." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Memorize the spread", detail: "The live mosaic is visible only during the watch phase. Once it fades, answer from memory." },
            { label: "Read the query", detail: "Some rounds ask which color appeared most. Others ask how many tiles used one color." },
            { label: "Read mistakes", detail: "Wrong answers increase the mistake count but the round stays active until the correct answer is chosen." },
          ],
        },
      ],
      title: "Color Census controls",
    },
    presentation: {
      previewAlt: "Color Census mosaic with a hidden query asking which color appeared most",
      previewSrc: "/images/games/color-census-preview.svg",
    },
    workspace: ColorCensusGameWorkspace,
  },
  "flip-match": {
    instructions: {
      summary: "Read the target silhouette, flip the live cards, and use the horizontal strip rule to match every board in the sprint.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to load the first target and live board pair." },
            { label: "Clear rounds", detail: "Each solved board opens the next round automatically until the full sprint is complete." },
            { label: "Timeout", detail: "If the timer expires before every round is solved, the run is saved as not cleared and opens the Result screen automatically." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Read the rule", detail: "Each tap flips the selected tile and its immediate left and right neighbors." },
            { label: "Match the target", detail: "Only the live board is interactive. The round clears as soon as its front/back pattern matches the target silhouette." },
            { label: "Read flips", detail: "Every tap counts toward the flips metric, so faster solutions are not enough by themselves." },
          ],
        },
      ],
      title: "Flip Match controls",
    },
    presentation: {
      previewAlt: "Flip Match target and live card boards linked by a horizontal flip rule",
      previewSrc: "/images/games/flip-match-preview.svg",
    },
    workspace: FlipMatchGameWorkspace,
  },
  "rotate-align": {
    instructions: {
      summary: "Rotate the route tiles, reconnect the path from start to end, and clear every board in the sprint before the timer expires.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to load the first route board." },
            { label: "Clear rounds", detail: "Each solved route advances directly to the next round until the full sprint is complete." },
            { label: "Timeout", detail: "If the timer expires before every route is solved, the run is saved as not cleared and opens the Result screen automatically." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Rotate one tile", detail: "Tap any route tile to rotate it 90 degrees clockwise." },
            { label: "Read the path", detail: "The route clears only when the line runs cleanly from the start marker to the end marker." },
            { label: "Read rotations", detail: "Every tile turn increases the rotations metric, so efficient path reading matters." },
          ],
        },
      ],
      title: "Rotate Align controls",
    },
    presentation: {
      previewAlt: "Rotate Align path board with rotatable route tiles between start and end",
      previewSrc: "/images/games/rotate-align-preview.svg",
    },
    workspace: RotateAlignGameWorkspace,
  },
  "position-lock": {
    instructions: {
      summary: "Watch the tokens settle onto the board, then place each label back onto its remembered final cell before the timer expires.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to open the first watch phase." },
            { label: "Watch then place", detail: "Each round shows the moving tokens briefly, then blanks the board and unlocks the token tray for placement." },
            { label: "Round review", detail: "After every token is placed, the board highlights exact, near, and missed placements before the next round begins." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Select one token", detail: "Tap a token in the tray to arm it for placement." },
            { label: "Place carefully", detail: "Tap the remembered board cell for that token. Occupied cells do not accept another token." },
            { label: "Read the review", detail: "Exact placements glow green, near placements glow amber, and every non-exact placement increases the support metric." },
          ],
        },
      ],
      title: "Position Lock controls",
    },
    presentation: {
      previewAlt: "Position Lock board with labeled tokens returning to remembered final cells",
      previewSrc: "/images/games/position-lock-preview.svg",
    },
    workspace: PositionLockGameWorkspace,
  },
  "tap-safe": {
    instructions: {
      summary: "Filter each short wave, tap only the safe targets, and avoid the hazard objects while you race toward the hit goal.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to spawn the first wave." },
            { label: "Clear the goal", detail: "Each safe target tap increases the goal progress. When the goal is reached, the Result screen opens automatically." },
            { label: "Wave pressure", detail: "Hazard taps add a large penalty, while safe targets left behind when the wave refreshes add a small penalty." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Read SAFE badges", detail: "Safe targets always show clear SAFE, OK, or GO badges in addition to their colour." },
            { label: "Ignore hazards", detail: "Hazard objects use NO, HAZ, or RISK badges and should never be tapped." },
            { label: "Stay mobile-safe", detail: "Every wave cell is a first-class tap target on desktop and touch devices." },
          ],
        },
      ],
      title: "Tap Safe controls",
    },
    presentation: {
      previewAlt: "Tap Safe wave board mixing safe targets and hazard objects with short-lived badges",
      previewSrc: "/images/games/tap-safe-preview.svg",
    },
    workspace: TapSafeGameWorkspace,
  },
  "spinner-aim": {
    instructions: {
      summary: "Watch the launcher rotate, fire only through the target arc, and avoid the hazard arc while you chase the hit goal.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to arm the launcher and first target arc." },
            { label: "Fire shots", detail: "Each target hit advances the goal and opens the next target and hazard arrangement." },
            { label: "Read penalties", detail: "Hazard hits and off-target shots both count as bad shots while the timer keeps running." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Read the arcs", detail: "The green arc is the only safe window. The coral arc is a hazard and should never be hit." },
            { label: "Fire once", detail: "Tap the board once to commit the current launcher angle as a shot." },
            { label: "Stay mobile-safe", detail: "The full launcher board is a single touch target on desktop and mobile." },
          ],
        },
      ],
      title: "Spinner Aim controls",
    },
    presentation: {
      previewAlt: "Spinner Aim ring with a rotating launcher, target arc, and hazard arc",
      previewSrc: "/images/games/spinner-aim-preview.svg",
    },
    workspace: SpinnerAimGameWorkspace,
  },
  "phase-lock": {
    instructions: {
      summary: "Watch the rotating wheel stack, lock the highlighted wheel only inside its target band, and finish the full sequence before the timer expires.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to arm the full wheel stack." },
            { label: "Lock in order", detail: "Only the highlighted wheel is active. A clean lock advances to the next wheel immediately." },
            { label: "Read misses", detail: "Mistimed locks add timing errors but do not stop the run, so you can keep trying until the timer expires." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Read the target band", detail: "Each wheel shows a green target band near the rim. The active wheel must be locked while its marker crosses that band." },
            { label: "Use one trigger", detail: "Press Lock current wheel once to freeze the highlighted wheel at its current phase." },
            { label: "Stay mobile-safe", detail: "The trigger button stays large and clear on desktop and touch devices." },
          ],
        },
      ],
      title: "Phase Lock controls",
    },
    presentation: {
      previewAlt: "Phase Lock wheel stack with rotating markers and glowing target bands",
      previewSrc: "/images/games/phase-lock-preview.svg",
    },
    workspace: PhaseLockGameWorkspace,
  },
  "sync-pulse": {
    instructions: {
      summary: "Read the dual pulse rhythm, tap while both rings overlap tightly, and chain every wave before the timer expires.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to arm the first pulse wave." },
            { label: "Advance waves", detail: "Perfect and good sync taps both clear the current wave and move directly into the next one." },
            { label: "Read misses", detail: "Misses do not stop the run, but the same wave stays active until you sync it or the timer expires." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Watch both rings", detail: "Pulse A and Pulse B expand and contract at different rates, so the overlap window keeps drifting." },
            { label: "Tap one sync pad", detail: "Use the large central pad to judge the current pulse overlap and commit the sync." },
            { label: "Read the judgment", detail: "The board reports perfect, good, or miss immediately after every tap." },
          ],
        },
      ],
      title: "Sync Pulse controls",
    },
    presentation: {
      previewAlt: "Sync Pulse dual ring board with two pulse circles collapsing into a shared sync pad",
      previewSrc: "/images/games/sync-pulse-preview.svg",
    },
    workspace: SyncPulseGameWorkspace,
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
  "hue-drift": {
    instructions: {
      summary: "Read the color drift across the row, infer the missing step, and choose the correct swatch before the timer expires.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to load the first drift prompt." },
            { label: "Solve the sprint", detail: "Each correct answer advances directly to the next prompt until the full sprint is complete." },
            { label: "Timeout", detail: "If the timer expires before every prompt is solved, the run is saved as not cleared and opens the Result screen automatically." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Read the drift", detail: "One step in the color row is missing. Compare the visible swatches to infer the pattern." },
            { label: "Tap one answer", detail: "Choose one of the four candidate swatches to fill the missing step." },
            { label: "Read mistakes", detail: "Wrong answers increase the mistake count but the sprint keeps going." },
          ],
        },
      ],
      title: "Hue Drift controls",
    },
    presentation: {
      previewAlt: "Hue Drift gradient row with a missing color step and answer swatches",
      previewSrc: "/images/games/hue-drift-preview.svg",
    },
    workspace: HueDriftGameWorkspace,
  },
  "spot-change": {
    instructions: {
      summary: "Compare the original and changed scenes, tap every real difference on the changed board, and finish the full set before the timer expires.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to load the first comparison scene." },
            { label: "Find every difference", detail: "Tap each changed tile on the changed board. The next round loads as soon as the full difference set is found." },
            { label: "Timeout", detail: "If the timer expires before every round is cleared, the run is saved as not cleared and opens the Result screen automatically." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Compare both boards", detail: "The original scene is read-only. Only the changed scene accepts taps." },
            { label: "Tap changed tiles", detail: "Correct taps mark the found difference and move the round toward clear." },
            { label: "Read misses", detail: "Wrong taps increase the miss count but the run keeps going." },
          ],
        },
      ],
      title: "Spot Change controls",
    },
    presentation: {
      previewAlt: "Spot Change original and changed scene boards with one highlighted difference",
      previewSrc: "/images/games/spot-change-preview.svg",
    },
    workspace: SpotChangeGameWorkspace,
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
  "shape-morph": {
    instructions: {
      summary: "Read how the glyph changes from step to step, choose the next transformed shape, and finish the sprint before the timer expires.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to load the first morph prompt." },
            { label: "Read the rule", detail: "Each prompt shows three steps of the same glyph changing through a single visual rule." },
            { label: "Keep moving", detail: "Every answer advances to the next prompt until the sprint is complete or the timer expires." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Compare each step", detail: "Track rotation, scale, or cuts across the sequence before looking at the answer choices." },
            { label: "Tap one choice", detail: "Choose the glyph that should appear next in the sequence." },
            { label: "Wrong answers", detail: "Incorrect choices increase the support metric but the sprint keeps going." },
          ],
        },
      ],
      title: "Shape Morph controls",
    },
    presentation: {
      previewAlt: "Shape Morph prompt showing a sequence of evolving glyphs and four answer choices",
      previewSrc: "/images/games/shape-morph-preview.svg",
    },
    workspace: ShapeMorphGameWorkspace,
  },
  "sum-grid": {
    instructions: {
      summary: "Select a candidate number, place it into the grid, and make every row and column sum match its target before the timer expires.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to load the first target grid." },
            { label: "Clear grids", detail: "Solve each grid in sequence by placing all candidate numbers correctly. The Result screen opens automatically after the last grid." },
            { label: "Timeout", detail: "If the timer ends before the full set is solved, the run is saved as not cleared and opens the Result screen automatically." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Pick a number", detail: "Tap a candidate number in the bank to arm it." },
            { label: "Place or remove", detail: "Tap an empty grid cell to place the selected number, or tap a filled cell to return that number to the bank." },
            { label: "Read the targets", detail: "Each row and column shows its target sum beside the grid so you can validate the layout while you build." },
          ],
        },
      ],
      title: "Sum Grid controls",
    },
    presentation: {
      previewAlt: "Sum Grid board showing row and column targets around a number grid",
      previewSrc: "/images/games/sum-grid-preview.svg",
    },
    workspace: SumGridGameWorkspace,
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
  "sequence-point": {
    instructions: {
      summary: "Watch the point sequence flash across the grid, then tap the same points in the same order through a growing memory sprint.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to begin the first watch phase." },
            { label: "Grow the sequence", detail: "Each cleared round adds one more point to the next sequence." },
            { label: "Timeout", detail: "If the timer expires before the final round is cleared, the run is saved as not cleared and opens the Result screen automatically." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Watch first", detail: "The grid points flash in order during the watch phase. Input is ignored until the flash sequence ends." },
            { label: "Replay in order", detail: "Tap the same points in the same order during the input phase." },
            { label: "Read mistakes", detail: "Wrong taps increase the mistake count but the sprint keeps going." },
          ],
        },
      ],
      title: "Sequence Point controls",
    },
    presentation: {
      previewAlt: "Sequence Point grid showing a fast memory sequence across lit points",
      previewSrc: "/images/games/sequence-point-preview.svg",
    },
    workspace: SequencePointGameWorkspace,
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
