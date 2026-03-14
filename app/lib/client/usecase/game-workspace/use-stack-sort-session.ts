import { useEffect, useMemo, useState } from "react";

import { clearBrowserInterval, startBrowserInterval } from "../../infrastructure/browser/timers";
import { randomInt } from "./game-utils";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";
type StackColor = "amber" | "mint" | "plum" | "rose" | "sky";

type PuzzleConfig = {
  capacity: number;
  stacks: StackColor[][];
};

type DifficultyConfig = {
  capacity: number;
  puzzles: PuzzleConfig[];
  timeLimitSeconds: number;
};

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: {
    capacity: 3,
    puzzles: [
      {
        capacity: 3,
        stacks: [
          ["amber", "sky", "mint"],
          ["mint", "amber", "sky"],
          ["sky", "mint", "amber"],
          [],
        ],
      },
    ],
    timeLimitSeconds: 54,
  },
  NORMAL: {
    capacity: 4,
    puzzles: [
      {
        capacity: 4,
        stacks: [
          ["amber", "sky", "mint", "rose"],
          ["rose", "amber", "sky", "mint"],
          ["mint", "rose", "amber", "sky"],
          ["sky", "mint", "rose", "amber"],
          [],
        ],
      },
    ],
    timeLimitSeconds: 72,
  },
  HARD: {
    capacity: 4,
    puzzles: [
      {
        capacity: 4,
        stacks: [
          ["amber", "sky", "mint", "rose"],
          ["plum", "amber", "sky", "mint"],
          ["rose", "plum", "amber", "sky"],
          ["mint", "rose", "plum", "amber"],
          ["sky", "mint", "rose", "plum"],
          [],
        ],
      },
    ],
    timeLimitSeconds: 94,
  },
  EXPERT: {
    capacity: 4,
    puzzles: [
      {
        capacity: 4,
        stacks: [
          ["amber", "sky", "mint", "rose"],
          ["plum", "amber", "sky", "mint"],
          ["rose", "plum", "amber", "sky"],
          ["mint", "rose", "plum", "amber"],
          ["sky", "mint", "rose", "plum"],
          ["amber", "plum", "mint", "sky"],
          [],
        ],
      },
    ],
    timeLimitSeconds: 116,
  },
};

function cloneStacks(stacks: StackColor[][]) {
  return stacks.map((stack) => [...stack]);
}

function isSolved(stacks: StackColor[][]) {
  return stacks.every((stack) => stack.length === 0 || stack.every((token) => token === stack[0]));
}

function canMove(source: StackColor[], destination: StackColor[], capacity: number) {
  if (source.length === 0 || destination.length >= capacity) {
    return false;
  }

  if (destination.length === 0) {
    return true;
  }

  return destination[destination.length - 1] === source[source.length - 1];
}

function pickPuzzle(config: DifficultyConfig) {
  return config.puzzles[randomInt(config.puzzles.length)];
}

export function useStackSortSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const previewPuzzle = useMemo(() => pickPuzzle(config), [config]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [moveCount, setMoveCount] = useState(0);
  const [selectedStackIndex, setSelectedStackIndex] = useState<number | null>(null);
  const [stacks, setStacks] = useState<StackColor[][]>(() => cloneStacks(previewPuzzle.stacks));
  const [state, setState] = useState<SessionState>("idle");

  useEffect(() => {
    const nextPreview = pickPuzzle(config);

    setElapsedSeconds(0);
    setMoveCount(0);
    setSelectedStackIndex(null);
    setStacks(cloneStacks(nextPreview.stacks));
    setState("idle");
  }, [config]);

  useEffect(() => {
    if (state !== "playing") {
      return undefined;
    }

    const interval = startBrowserInterval(() => {
      setElapsedSeconds((current) => {
        const next = Math.min(config.timeLimitSeconds, current + 1);

        if (next >= config.timeLimitSeconds) {
          setState((currentState) => (currentState === "playing" ? "failed" : currentState));
        }

        return next;
      });
    }, 1000);

    return () => clearBrowserInterval(interval);
  }, [config.timeLimitSeconds, state]);

  function beginRun() {
    const nextPuzzle = pickPuzzle(config);

    setElapsedSeconds(0);
    setMoveCount(0);
    setSelectedStackIndex(null);
    setStacks(cloneStacks(nextPuzzle.stacks));
    setState("playing");
  }

  function selectStack(stackIndex: number) {
    if (state !== "playing") {
      return "ignored";
    }

    const sourceStack = stacks[stackIndex];

    if (selectedStackIndex === null) {
      if (!sourceStack || sourceStack.length === 0) {
        return "ignored";
      }

      setSelectedStackIndex(stackIndex);
      return "selected";
    }

    if (selectedStackIndex === stackIndex) {
      setSelectedStackIndex(null);
      return "deselected";
    }

    const nextStacks = cloneStacks(stacks);
    const selectedSource = nextStacks[selectedStackIndex];
    const selectedDestination = nextStacks[stackIndex];

    if (!selectedSource || !selectedDestination || !canMove(selectedSource, selectedDestination, config.capacity)) {
      return "invalid";
    }

    const token = selectedSource.pop();

    if (!token) {
      return "invalid";
    }

    selectedDestination.push(token);
    const nextMoveCount = moveCount + 1;

    setMoveCount(nextMoveCount);
    setSelectedStackIndex(null);
    setStacks(nextStacks);

    if (isSolved(nextStacks)) {
      setState("cleared");
    }

    return "moved";
  }

  return {
    beginRun,
    capacity: config.capacity,
    elapsedSeconds,
    moveCount,
    selectedStackIndex,
    selectStack,
    stacks,
    state,
    timeLimitSeconds: config.timeLimitSeconds,
  };
}
