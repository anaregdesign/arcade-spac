import type { ComponentType } from "react";

import { BeatMatchGameWorkspace } from "./beat-match/BeatMatchGameWorkspace";
import { BlockTessellateGameWorkspace } from "./block-tessellate/BlockTessellateGameWorkspace";
import { BounceAngleGameWorkspace } from "./bounce-angle/BounceAngleGameWorkspace";
import { BoxFillGameWorkspace } from "./box-fill/BoxFillGameWorkspace";
import { BubbleSpawnGameWorkspace } from "./bubble-spawn/BubbleSpawnGameWorkspace";
import { CascadeFlipGameWorkspace } from "./cascade-flip/CascadeFlipGameWorkspace";
import { CascadeClearGameWorkspace } from "./cascade-clear/CascadeClearGameWorkspace";
import { ChainTriggerGameWorkspace } from "./chain-trigger/ChainTriggerGameWorkspace";
import { ColorCensusGameWorkspace } from "./color-census/ColorCensusGameWorkspace";
import { ColorSweepGameWorkspace } from "./color-sweep/ColorSweepGameWorkspace";
import { FlipMatchGameWorkspace } from "./flip-match/FlipMatchGameWorkspace";
import { GapRushGameWorkspace } from "./gap-rush/GapRushGameWorkspace";
import { GlowCycleGameWorkspace } from "./glow-cycle/GlowCycleGameWorkspace";
import { HiddenFindGameWorkspace } from "./hidden-find/HiddenFindGameWorkspace";
import { HueDriftGameWorkspace } from "./hue-drift/HueDriftGameWorkspace";
import { IconChainGameWorkspace } from "./icon-chain/IconChainGameWorkspace";
import { LineConnectGameWorkspace } from "./line-connect/LineConnectGameWorkspace";
import { MergeClimbGameWorkspace } from "./merge-climb/MergeClimbGameWorkspace";
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
import { RelativePitchGameWorkspace } from "./relative-pitch/RelativePitchGameWorkspace";
import { RotateAlignGameWorkspace } from "./rotate-align/RotateAlignGameWorkspace";
import { SequencePointGameWorkspace } from "./sequence-point/SequencePointGameWorkspace";
import { ShapeMorphGameWorkspace } from "./shape-morph/ShapeMorphGameWorkspace";
import { SpinnerAimGameWorkspace } from "./spinner-aim/SpinnerAimGameWorkspace";
import { SpotChangeGameWorkspace } from "./spot-change/SpotChangeGameWorkspace";
import { SyncPulseGameWorkspace } from "./sync-pulse/SyncPulseGameWorkspace";
import { TapSafeGameWorkspace } from "./tap-safe/TapSafeGameWorkspace";
import { TempoHoldGameWorkspace } from "./tempo-hold/TempoHoldGameWorkspace";
import { TempoWeaveGameWorkspace } from "./tempo-weave/TempoWeaveGameWorkspace";
import { TileInstantGameWorkspace } from "./tile-instant/TileInstantGameWorkspace";
import { ZoneLockGameWorkspace } from "./zone-lock/ZoneLockGameWorkspace";
import type { GameInstructions } from "../gameplay/workspace/GameInstructionsDialog";
import { SwapSolveGameWorkspace } from "./swap-solve/SwapSolveGameWorkspace";
import { SumGridGameWorkspace } from "./sum-grid/SumGridGameWorkspace";
import { SudokuGameWorkspace } from "./sudoku/SudokuGameWorkspace";
import { SymbolHuntGameWorkspace } from "./symbol-hunt/SymbolHuntGameWorkspace";
import { LightGridGameWorkspace } from "./light-grid/LightGridGameWorkspace";
import { StackSortGameWorkspace } from "./stack-sort/StackSortGameWorkspace";
import { TargetTrailGameWorkspace } from "./target-trail/TargetTrailGameWorkspace";
import { TileShiftGameWorkspace } from "./tile-shift/TileShiftGameWorkspace";
import { MirrorMatchGameWorkspace } from "./mirror-match/MirrorMatchGameWorkspace";
import type { SupportedArcadeLocale } from "../../lib/domain/entities/locale";
import { gameInstructionsTranslations } from "./game-workspace-registry.translations";
import type { GameWorkspaceComponentProps } from "../gameplay/workspace/game-workspace-types";

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
  "beat-match": {
    instructions: {
      summary: "Read the active lane, wait for the timing marker to cross the center zone, and tap the matching lane to keep the combo alive.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to arm the beat stream." },
            { label: "Build hits", detail: "Perfect and good taps both raise the hit goal. Misses break combo and move the stream onward." },
            { label: "Finish or fail", detail: "The run clears once the hit goal is reached. If the stream ends or the timer expires first, the run fails." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Read the active lane", detail: "Only one lane is active at a time, and the upcoming queue previews the next beats." },
            { label: "Watch the center zone", detail: "Tap while the timing marker crosses the center zone for a perfect or good hit." },
            { label: "Stay touch-safe", detail: "All three lane buttons stay large and evenly spaced on desktop and mobile." },
          ],
        },
      ],
      title: "Beat Match controls",
    },
    presentation: {
      previewAlt: "Beat Match lane board with a center hit zone and three rhythm lanes",
      previewSrc: "/images/games/beat-match-preview.svg",
    },
    workspace: BeatMatchGameWorkspace,
  },
  "block-tessellate": {
    instructions: {
      summary: "Guide each falling piece with Left, Rotate, Right, and Hard drop so the full queue seals the silhouette before the timer expires.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to load the first silhouette with a fixed falling queue." },
            { label: "Place under gravity", detail: "Every piece falls on its own timer, so lateral moves and rotations need to happen before the hard drop lock." },
            { label: "Clear or fail", detail: "Seal every silhouette in the set before the timer expires. A misdrop resets the current silhouette and increases the result metric." },
          ],
        },
        {
          title: "Placement controls",
          items: [
            { label: "Move left or right", detail: "Use the lane buttons to slide the active piece across the compact board without leaving the current silhouette." },
            { label: "Rotate before drop", detail: "Rotate changes the footprint and clamps it back inside the board when the edge would be crossed." },
            { label: "Read the ghost", detail: "Preview cells show where Hard drop will lock the current piece, so you can confirm the footprint before you commit." },
          ],
        },
      ],
      title: "Block Tessellate controls",
    },
    presentation: {
      previewAlt: "Block Tessellate silhouette board with a falling piece queue, ghost landing cells, and hard-drop controls",
      previewSrc: "/images/games/block-tessellate-preview.svg",
    },
    workspace: BlockTessellateGameWorkspace,
  },
  "bounce-angle": {
    instructions: {
      summary: "Choose one fixed angle pad, read how the side walls will redirect the shot, and launch only when the path should land in the green top pocket.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to load the first ricochet board with a visible target pocket and hazard pockets." },
            { label: "Select then launch", detail: "Only one angle is armed at a time. Launch resolves the full rebound instantly and leaves the trace on the board for the next read." },
            { label: "Clear or fail", detail: "Clear every board in the set before the timer expires. Every launch counts toward the result metric, even when it lands in a neutral pocket." },
          ],
        },
        {
          title: "Ricochet controls",
          items: [
            { label: "Read the top pockets", detail: "The green pocket is the goal, coral pockets are hazards, and the rest are neutral exits that still cost a shot." },
            { label: "Use fixed angle pads", detail: "Each pad fires the same deterministic path every time, so the puzzle is about reflection planning rather than drag aim." },
            { label: "Watch the trace", detail: "The last launch leaves a full rebound line and bounce markers behind so you can infer the next adjustment." },
          ],
        },
      ],
      title: "Bounce Angle controls",
    },
    presentation: {
      previewAlt: "Bounce Angle ricochet board with a traced bank shot, target pocket, and fixed angle chooser",
      previewSrc: "/images/games/bounce-angle-preview.svg",
    },
    workspace: BounceAngleGameWorkspace,
  },
  "cascade-flip": {
    instructions: {
      summary: "Memorize the revealed card order, then tap the same order out of the moving stream without letting misses pile up.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to open the first reveal phase." },
            { label: "Reveal then track", detail: "The target order shows first, then the live stream starts shifting row by row and input unlocks." },
            { label: "Clear or fail", detail: "Resolve every target card across the full stream set before the timer expires. Wrong cards add misses but the stream keeps moving." },
          ],
        },
        {
          title: "Stream controls",
          items: [
            { label: "Read the order strip", detail: "Resolved cards dim out, the current target stays highlighted, and upcoming cards remain visible for the rest of the round." },
            { label: "Tap only live cards", detail: "Only the live stream accepts input. Reveal phase taps do nothing, and resolved cards are locked until they slide away." },
            { label: "Use the last shift", detail: "The stream moves in fixed row steps, so you can time the next tap from the visible drift rather than chase free animation." },
          ],
        },
      ],
      title: "Cascade Flip controls",
    },
    presentation: {
      previewAlt: "Cascade Flip stream with a target order strip above a shifting memory board",
      previewSrc: "/images/games/cascade-flip-preview.svg",
    },
    workspace: CascadeFlipGameWorkspace,
  },
  "box-fill": {
    instructions: {
      summary: "Choose one tray piece at a time, rotate it into the right footprint, preview the anchor on the board, and place only when the fit is clean.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to load the first irregular box with a fixed tray of pieces." },
            { label: "Preview then place", detail: "Tap a tray piece, rotate it if needed, tap a board anchor to preview the fit, and use Place piece to commit it." },
            { label: "Clear or fail", detail: "Finish every board in the set before the timer expires. Invalid fits are blocked and add placement errors to the result." },
          ],
        },
        {
          title: "Packing controls",
          items: [
            { label: "Select from the tray", detail: "Only unplaced tray pieces stay active, and the selected piece is the one that will respond to rotate or place actions." },
            { label: "Use anchor previews", detail: "Tapping any board slot sets the preview anchor so you can read whether the rotated piece will fit before committing it." },
            { label: "Undo or reset", detail: "Undo piece removes the last committed placement, while Reset board clears the current box if the tray order traps the later pieces." },
          ],
        },
      ],
      title: "Box Fill controls",
    },
    presentation: {
      previewAlt: "Box Fill tray-and-board puzzle with selected polyomino pieces and a highlighted anchor preview",
      previewSrc: "/images/games/box-fill-preview.svg",
    },
    workspace: BoxFillGameWorkspace,
  },
  "gap-rush": {
    instructions: {
      summary: "Set the next lane early, let the runner glide across the corridor, and stay centered in each opening as the wall speed ramps upward.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to arm one fixed corridor sequence with a visible first opening." },
            { label: "Glide into each gap", detail: "Lane pads retarget the runner, but the runner drifts continuously instead of snapping instantly, so early reads matter." },
            { label: "Clear or crash", detail: "Survive the full wall set before the timer expires. Missing the opening crashes the run immediately." },
          ],
        },
        {
          title: "Corridor controls",
          items: [
            { label: "Use lane pads", detail: "Each large lane button retargets the glide path and stays touch-safe on narrow screens." },
            { label: "Read the previews", detail: "The live wall shows the current opening and the faded band previews the next one so you can plan ahead." },
            { label: "Chase perfect passes", detail: "Perfect credit only counts when the runner is near the center of the opening, not merely inside the safe zone." },
          ],
        },
      ],
      title: "Gap Rush controls",
    },
    presentation: {
      previewAlt: "Gap Rush corridor with a drifting runner, live wall opening, and lane target pads",
      previewSrc: "/images/games/gap-rush-preview.svg",
    },
    workspace: GapRushGameWorkspace,
  },
  "bubble-spawn": {
    instructions: {
      summary: "Read which bubbles are swelling fastest, burst the best target before the next pressure pulse, and keep both saturation and stability meters moving in the right direction.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to open one deterministic pressure field with a fixed spawn sequence." },
            { label: "Burst under pressure", detail: "Every pulse grows the field and spawns one more bubble. Connected or oversized bubbles burst wider chains and push stability further." },
            { label: "Clear or fail", detail: "The run clears once the stability meter fills. If saturation reaches the field limit or the timer expires first, the run fails." },
          ],
        },
        {
          title: "Field controls",
          items: [
            { label: "Tap live bubbles", detail: "Only live bubbles can be burst, and every slot stays large enough for touch on desktop and narrow mobile screens." },
            { label: "Watch the best target", detail: "The strongest current burst target is outlined so you can quickly read where the next chain value lives." },
            { label: "Read the summaries", detail: "Largest threat, next spawn, last chain, stability, and saturation stay visible so pressure stays legible even while the board updates." },
          ],
        },
      ],
      title: "Bubble Spawn controls",
    },
    presentation: {
      previewAlt: "Bubble Spawn field with growing colored bubbles, dual pressure meters, and a highlighted best burst target",
      previewSrc: "/images/games/bubble-spawn-preview.svg",
    },
    workspace: BubbleSpawnGameWorkspace,
  },
  "cascade-clear": {
    instructions: {
      summary: "Fire one row or column trigger, let the board collapse and refill, then read how many connected color groups explode out of that chain.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to load one curated combo board with a target score." },
            { label: "Fire a trigger", detail: "Each move clears one full row or one full column, then the resolver collapses the board and refills empty cells from a fixed sequence." },
            { label: "Clear or fail", detail: "Reach the target score before the trigger limit or timer runs out. The best cascade depth is saved in the result summary." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Use row rails", detail: "The left-side rail fires a whole row and is best when that clear will line up multiple color groups after the fall." },
            { label: "Use column rails", detail: "The top rail fires a whole column and can open a different chain path than any row trigger." },
            { label: "Read the summary", detail: "Current score, score gain, best cascade, and the last trigger stay visible so you can learn which chains actually paid off." },
          ],
        },
      ],
      title: "Cascade Clear controls",
    },
    presentation: {
      previewAlt: "Cascade Clear board with row and column trigger rails surrounding a color token grid",
      previewSrc: "/images/games/cascade-clear-preview.svg",
    },
    workspace: CascadeClearGameWorkspace,
  },
  "chain-trigger": {
    instructions: {
      summary: "Read the fixed source node, arm only the helper nodes you need, then fire the chain and watch the propagation wave by wave.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to open the first graph puzzle." },
            { label: "Arm the helpers", detail: "Each puzzle allows only a small number of extra triggers, so every armed node is a deliberate commitment." },
            { label: "Fire and adjust", detail: "If the chain stalls, dark nodes remain visible and you can re-arm the graph before firing again." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Read thresholds", detail: "Every non-source node shows how many incoming signals it needs before it can fire." },
            { label: "Tap to arm", detail: "Tap any non-source node to arm or disarm it for wave 1." },
            { label: "Fire chain", detail: "Press Fire chain to resolve the graph deterministically and stamp each lit node with its activation wave." },
          ],
        },
      ],
      title: "Chain Trigger controls",
    },
    presentation: {
      previewAlt: "Chain Trigger graph board with a source node, armed helper node, and propagation links",
      previewSrc: "/images/games/chain-trigger-preview.svg",
    },
    workspace: ChainTriggerGameWorkspace,
  },
  "icon-chain": {
    instructions: {
      summary: "Memorize the reveal order, keep the first icon anchored, then rebuild the hidden chain from the clue board without letting wrong picks reset your progress.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to open the first watch phase." },
            { label: "Watch then infer", detail: "Each round starts with a short full-order reveal, then unlocks the clue board and candidate tray." },
            { label: "Finish or fail", detail: "Clear every clue round before the timer expires. A timeout saves the run for history only." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Read the anchors", detail: "The first and last icons stay visible in the clue board, so the middle order is the real puzzle." },
            { label: "Use clue cards", detail: "Adjacent-pair, slot, family, and before-after clues stay visible while you rebuild the chain." },
            { label: "Tap the next icon", detail: "Only the next correct icon extends the chain. A wrong pick resets the current chain back to the anchored start." },
          ],
        },
      ],
      title: "Icon Chain controls",
    },
    presentation: {
      previewAlt: "Icon Chain clue board with a revealed icon strip and card-like order clues",
      previewSrc: "/images/games/icon-chain-preview.svg",
    },
    workspace: IconChainGameWorkspace,
  },
  "line-connect": {
    instructions: {
      summary: "Extend the active pair one segment at a time, keep every route off the locked lanes, and finish each compact board before the timer expires.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to open the first route board with the first pair already armed." },
            { label: "Build one pair at a time", detail: "Only the active pair can reach its own target. When that route locks, the next pair becomes active immediately." },
            { label: "Clear or fail", detail: "Finish every board in the set before the timer expires. Invalid taps, pair resets, and board resets all count as path corrections." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Tap adjacent cells", detail: "Every segment extends by tapping the next adjacent slot. Tapping the previous slot backs the path up by one step." },
            { label: "Use reset actions", detail: "Reset pair restarts only the active route, while Reset board clears the current puzzle if your locked paths trap the later pairs." },
            { label: "Read the next segment", detail: "The board shows the active pair, the last action, and a hidden verification step can expose the next route segment without changing the visible UI." },
          ],
        },
      ],
      title: "Line Connect controls",
    },
    presentation: {
      previewAlt: "Line Connect grid with labeled node pairs, an active route, and a step-by-step path build",
      previewSrc: "/images/games/line-connect-preview.svg",
    },
    workspace: LineConnectGameWorkspace,
  },
  "merge-climb": {
    instructions: {
      summary: "Slide the whole board in one direction, merge matching values once per move, and keep enough empty space alive to reach the goal tile.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to load the number board and fixed spawn queue." },
            { label: "Grow the board", detail: "Every legal move slides all tiles, combines one matching pair per line, and adds a new spawn afterward." },
            { label: "Clear or fail", detail: "Reach the goal tile before the timer expires or before the board locks into a state with no legal moves." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Use direction buttons", detail: "Press Up, Left, Down, or Right to slide every tile across the board in that direction." },
            { label: "Read the pressure", detail: "The summary panel keeps goal, max tile, next spawn, and empty-cell pressure visible the whole run." },
            { label: "Stay touch-safe", detail: "The direction pad and board summaries stay large and readable on desktop and narrow mobile screens." },
          ],
        },
      ],
      title: "Merge Climb controls",
    },
    presentation: {
      previewAlt: "Merge Climb number board with directional controls, a goal tile, and a next spawn panel",
      previewSrc: "/images/games/merge-climb-preview.svg",
    },
    workspace: MergeClimbGameWorkspace,
  },
  "relative-pitch": {
    instructions: {
      summary: "Listen to the reference interval, hear the new base note, then choose the candidate that recreates the same jump from that new base.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to unlock browser audio and play the first reference interval." },
            { label: "Listen then choose", detail: "Each round plays the reference jump, then the new base note, and only then unlocks the candidate pads." },
            { label: "Clear or fail", detail: "Finish every audio round before the timer expires. Extra replays stay visible in the result summary." },
          ],
        },
        {
          title: "Audio controls",
          items: [
            { label: "Replay reference", detail: "Use Replay reference to hear the original anchor-to-target jump again when you need another comparison." },
            { label: "Replay base", detail: "Use Replay base to hear only the new base note again before you commit a candidate." },
            { label: "Choose one pad", detail: "Each candidate pad plays the new base plus its answer note and immediately locks in that choice for the round." },
          ],
        },
      ],
      title: "Relative Pitch controls",
    },
    presentation: {
      previewAlt: "Relative Pitch panel with replay controls and four candidate pads around a current round prompt",
      previewSrc: "/images/games/relative-pitch-preview.svg",
    },
    workspace: RelativePitchGameWorkspace,
  },
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
  "glow-cycle": {
    instructions: {
      summary: "Watch the pulse nodes breathe together, then tap only the highlighted target node while the board enters the shared sync window.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to light the first target cycle." },
            { label: "Clear each cycle", detail: "A correct target tap advances the run immediately to the next target and pulse pattern." },
            { label: "Recover from mistimes", detail: "Wrong node taps and off-sync taps add to the mistimed count, but the run keeps going until the timer ends." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Read the target", detail: "Only one node is highlighted as the live target. The other nodes are decoys that still accept taps." },
            { label: "Watch the sync meter", detail: "Use the shared meter to judge when the full board is near the glow crest. Perfect is tighter than good." },
            { label: "Stay touch-safe", detail: "The node grid keeps large buttons and spacing so target selection stays reliable on desktop and mobile." },
          ],
        },
      ],
      title: "Glow Cycle controls",
    },
    presentation: {
      previewAlt: "Glow Cycle node grid with a highlighted target orb and a shared sync meter",
      previewSrc: "/images/games/glow-cycle-preview.svg",
    },
    workspace: GlowCycleGameWorkspace,
  },
  "tempo-hold": {
    instructions: {
      summary: "Read the target hold duration, press and hold the pad, then release inside the target zone before the meter runs past it.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to reveal the first target hold duration." },
            { label: "Release each round", detail: "Every release resolves the current round as perfect, good, or miss and immediately loads the next target." },
            { label: "Read misses", detail: "Misses still advance the round, so the run stays fast and the timer remains the real pressure." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Press and hold", detail: "Hold the central pad to grow the meter toward the target zone." },
            { label: "Release on tempo", detail: "Let go while the meter sits in the bright target zone to earn a perfect or good release." },
            { label: "Read the meter", detail: "The meter shows the full hold range, the wider target zone, and the tighter perfect zone at the same time." },
          ],
        },
      ],
      title: "Tempo Hold controls",
    },
    presentation: {
      previewAlt: "Tempo Hold meter board with a glowing target zone and a long hold bar",
      previewSrc: "/images/games/tempo-hold-preview.svg",
    },
    workspace: TempoHoldGameWorkspace,
  },
  "tempo-weave": {
    instructions: {
      summary: "Watch both lane markers at once and tap each lane only while its marker crosses the center target zone.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to arm both lanes at the same time." },
            { label: "Split attention", detail: "Each lane advances on its own tempo, so one success never pauses the other lane." },
            { label: "Raise density", detail: "Long streaks shorten the next cycle on both lanes and raise the pressure." },
          ],
        },
        {
          title: "Lane controls",
          items: [
            { label: "Read the target zone", detail: "Hit only while the marker overlaps the center band. Perfect is tighter than good." },
            { label: "Watch misses", detail: "Late taps and unpressed beats both count as misses and reset streak." },
            { label: "Clear both lanes", detail: "The run clears only after both lane hit goals are complete." },
          ],
        },
      ],
      title: "Tempo Weave controls",
    },
    presentation: {
      previewAlt: "Tempo Weave dual-lane rhythm board with independent lane markers and center hit zones",
      previewSrc: "/images/games/tempo-weave-preview.svg",
    },
    workspace: TempoWeaveGameWorkspace,
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
      previewSrc: "/images/games/minesweeper-preview.svg",
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
  "tile-instant": {
    instructions: {
      summary: "Memorize the target board during the watch phase, then rebuild the same arrangement by swapping two live tiles at a time.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to reveal the first target board briefly." },
            { label: "Watch then rebuild", detail: "The target board hides after the watch phase, and the scrambled live board unlocks for swapping." },
            { label: "Advance rounds", detail: "Each solved board starts the next watch phase automatically until the full sprint is complete." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Memorize first", detail: "Only the watch phase shows the full target arrangement. After that, the target panel hides its values." },
            { label: "Swap two tiles", detail: "Tap one live tile, then tap another live tile, to swap their positions." },
            { label: "Read moves", detail: "Every completed swap adds one move to the result summary." },
          ],
        },
      ],
      title: "Tile Instant controls",
    },
    presentation: {
      previewAlt: "Tile Instant target memory board next to a shuffled live reconstruction board",
      previewSrc: "/images/games/tile-instant-preview.svg",
    },
    workspace: TileInstantGameWorkspace,
  },
  "zone-lock": {
    instructions: {
      summary: "Toggle shared cells until every overlapping zone reaches its target lock count at the same time.",
      sections: [
        {
          title: "Run flow",
          items: [
            { label: "Start run", detail: "Choose a difficulty and press Start run to open the first empty zone board." },
            { label: "Read every zone", detail: "Each zone card shows its target lock count and current count, and one cell can affect multiple cards." },
            { label: "Advance rounds", detail: "When every zone card locks, the next puzzle loads automatically until the full set is cleared." },
          ],
        },
        {
          title: "Board controls",
          items: [
            { label: "Toggle cells", detail: "Tap any cell to switch it between open and locked." },
            { label: "Track overlap", detail: "Each cell shows the zone labels it belongs to, so you can see which rules a tap will affect." },
            { label: "Reset carefully", detail: "Reset board clears the current puzzle and adds one reset to the result summary." },
          ],
        },
      ],
      title: "Zone Lock controls",
    },
    presentation: {
      previewAlt: "Zone Lock puzzle board with overlapping zone cards and lock-count targets",
      previewSrc: "/images/games/zone-lock-preview.svg",
    },
    workspace: ZoneLockGameWorkspace,
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
      previewSrc: "/images/games/sudoku-preview.svg",
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

export function getGameInstructions(gameKey: string, locale: SupportedArcadeLocale = "en") {
  const definition = gameDefinitionByKey[gameKey];

  if (!definition) {
    return null;
  }

  const localizedInstructions = (gameInstructionsTranslations as Partial<Record<string, Partial<Record<SupportedArcadeLocale, GameInstructions>>>>)[gameKey]?.[locale];

  return localizedInstructions ?? definition.instructions;
}
