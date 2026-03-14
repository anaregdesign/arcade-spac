import { useEffect, useMemo, useRef, useState } from "react";

import { clearBrowserInterval, clearBrowserTimeout, startBrowserInterval, startBrowserTimeout } from "../../infrastructure/browser/timers";
import { randomInt, shuffleValues } from "./game-utils";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "watching" | "answering" | "cleared" | "failed";
type QueryKind = "majority" | "count";

export type CensusColorKey = "amber" | "coral" | "mint" | "rose" | "sky" | "violet";

export type CensusColor = {
  fill: string;
  key: CensusColorKey;
  label: string;
};

export type ColorCensusQuery =
  | {
      answerColor: CensusColor;
      choices: CensusColor[];
      kind: "majority";
      prompt: string;
      queryLabel: "Majority";
    }
  | {
      answerCount: number;
      choices: number[];
      kind: "count";
      prompt: string;
      queryLabel: "Exact count";
      targetColor: CensusColor;
    };

export type ColorCensusRound = {
  board: CensusColor[][];
  query: ColorCensusQuery;
};

type DifficultyConfig = {
  columnCount: number;
  minimumCountPerColor: number;
  paletteSize: number;
  roundCount: number;
  rowCount: number;
  timeLimitSeconds: number;
  watchDurationMs: number;
};

const colorPalette = [
  { fill: "linear-gradient(180deg, #fb7185, #f43f5e)", key: "rose", label: "Rose" },
  { fill: "linear-gradient(180deg, #fb923c, #f97316)", key: "coral", label: "Coral" },
  { fill: "linear-gradient(180deg, #facc15, #f59e0b)", key: "amber", label: "Amber" },
  { fill: "linear-gradient(180deg, #4ade80, #22c55e)", key: "mint", label: "Mint" },
  { fill: "linear-gradient(180deg, #38bdf8, #2563eb)", key: "sky", label: "Sky" },
  { fill: "linear-gradient(180deg, #c084fc, #8b5cf6)", key: "violet", label: "Violet" },
] as const satisfies readonly CensusColor[];

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: { columnCount: 4, minimumCountPerColor: 2, paletteSize: 4, roundCount: 3, rowCount: 4, timeLimitSeconds: 34, watchDurationMs: 1800 },
  NORMAL: { columnCount: 5, minimumCountPerColor: 2, paletteSize: 4, roundCount: 4, rowCount: 4, timeLimitSeconds: 44, watchDurationMs: 1650 },
  HARD: { columnCount: 5, minimumCountPerColor: 2, paletteSize: 5, roundCount: 5, rowCount: 5, timeLimitSeconds: 56, watchDurationMs: 1450 },
  EXPERT: { columnCount: 6, minimumCountPerColor: 2, paletteSize: 5, roundCount: 6, rowCount: 5, timeLimitSeconds: 68, watchDurationMs: 1300 },
};

function buildCounts(totalCellCount: number, paletteSize: number, minimumCount: number) {
  const counts = Array.from({ length: paletteSize }, () => minimumCount);
  let remaining = totalCellCount - paletteSize * minimumCount;

  while (remaining > 0) {
    counts[randomInt(paletteSize)] += 1;
    remaining -= 1;
  }

  return counts;
}

function buildPreviewCounts(totalCellCount: number, paletteSize: number, minimumCount: number) {
  const counts = Array.from(
    { length: paletteSize },
    (_, index) => minimumCount + Math.max(0, paletteSize - index - 1),
  );
  let remaining = totalCellCount - counts.reduce((sum, count) => sum + count, 0);
  let index = 0;

  while (remaining > 0) {
    counts[index % paletteSize] += 1;
    remaining -= 1;
    index += 1;
  }

  return counts;
}

function ensureUniqueMajority(counts: number[], minimumCount: number) {
  const nextCounts = [...counts];
  const highestCount = Math.max(...nextCounts);
  const tiedIndices = nextCounts
    .map((count, index) => (count === highestCount ? index : -1))
    .filter((index) => index !== -1);

  if (tiedIndices.length <= 1) {
    return nextCounts;
  }

  const winnerIndex = tiedIndices[0];
  const donorIndex = nextCounts.findIndex((count, index) => index !== winnerIndex && count > minimumCount);

  if (donorIndex !== -1) {
    nextCounts[winnerIndex] += 1;
    nextCounts[donorIndex] -= 1;
  }

  return nextCounts;
}

function buildCountChoices(answerCount: number, totalCellCount: number) {
  const choices = new Set<number>([answerCount]);

  while (choices.size < 4) {
    const offset = Math.max(1, randomInt(4));
    const candidate = Math.max(
      1,
      Math.min(totalCellCount, answerCount + (randomInt(2) === 0 ? -offset : offset)),
    );

    choices.add(candidate);
  }

  return shuffleValues([...choices]);
}

function fillBoard(colors: readonly CensusColor[], counts: readonly number[], rowCount: number, columnCount: number, preview: boolean) {
  const flattenedCells = colors.flatMap((color, index) =>
    Array.from({ length: counts[index] ?? 0 }, () => color),
  );
  const arrangedCells = preview ? flattenedCells : shuffleValues(flattenedCells);

  return Array.from({ length: rowCount }, (_, rowIndex) =>
    Array.from({ length: columnCount }, (_, columnIndex) => arrangedCells[rowIndex * columnCount + columnIndex] ?? colors[0]),
  );
}

function getRoundQueryKind(roundIndex: number): QueryKind {
  return roundIndex % 2 === 0 ? "majority" : "count";
}

function buildRound(config: DifficultyConfig, roundIndex: number, preview = false): ColorCensusRound {
  const activeColors = preview
    ? colorPalette.slice(0, Math.min(config.paletteSize, 4))
    : shuffleValues(colorPalette).slice(0, config.paletteSize);
  const totalCellCount = config.rowCount * config.columnCount;
  const baseCounts = preview
    ? buildPreviewCounts(totalCellCount, activeColors.length, config.minimumCountPerColor)
    : buildCounts(totalCellCount, activeColors.length, config.minimumCountPerColor);
  const counts = ensureUniqueMajority(baseCounts, config.minimumCountPerColor);
  const board = fillBoard(activeColors, counts, config.rowCount, config.columnCount, preview);
  const majorityIndex = counts.indexOf(Math.max(...counts));
  const queryKind = preview ? "majority" : getRoundQueryKind(roundIndex);

  if (queryKind === "majority") {
    return {
      board,
      query: {
        answerColor: activeColors[majorityIndex] ?? activeColors[0],
        choices: preview ? [...activeColors] : shuffleValues(activeColors),
        kind: "majority",
        prompt: "Which color appeared most?",
        queryLabel: "Majority",
      },
    };
  }

  const eligibleIndices = counts
    .map((count, index) => (count >= config.minimumCountPerColor ? index : -1))
    .filter((index) => index !== -1);
  const targetIndex = eligibleIndices[randomInt(eligibleIndices.length)] ?? 0;
  const targetColor = activeColors[targetIndex] ?? activeColors[0];
  const answerCount = counts[targetIndex] ?? config.minimumCountPerColor;

  return {
    board,
    query: {
      answerCount,
      choices: buildCountChoices(answerCount, totalCellCount),
      kind: "count",
      prompt: `How many tiles were ${targetColor.label}?`,
      queryLabel: "Exact count",
      targetColor,
    },
  };
}

export function useColorCensusSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const previewRound = useMemo(() => buildRound(config, 0, true), [config]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [rounds, setRounds] = useState<ColorCensusRound[]>(() => [previewRound]);
  const [state, setState] = useState<SessionState>("idle");

  const timeoutHandlesRef = useRef<number[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      for (const handle of timeoutHandlesRef.current) {
        clearBrowserTimeout(handle);
      }

      if (timerIntervalRef.current !== null) {
        clearBrowserInterval(timerIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    for (const handle of timeoutHandlesRef.current) {
      clearBrowserTimeout(handle);
    }

    timeoutHandlesRef.current = [];

    if (timerIntervalRef.current !== null) {
      clearBrowserInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    setCurrentRoundIndex(0);
    setElapsedSeconds(0);
    setMistakeCount(0);
    setRounds([previewRound]);
    setState("idle");
  }, [config, previewRound]);

  useEffect(() => {
    if (state !== "watching" && state !== "answering") {
      if (timerIntervalRef.current !== null) {
        clearBrowserInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }

      return;
    }

    timerIntervalRef.current = startBrowserInterval(() => {
      setElapsedSeconds((current) => {
        const next = Math.min(config.timeLimitSeconds, current + 1);

        if (next >= config.timeLimitSeconds) {
          setState((currentState) =>
            currentState === "watching" || currentState === "answering" ? "failed" : currentState,
          );
        }

        return next;
      });
    }, 1000);

    return () => {
      if (timerIntervalRef.current !== null) {
        clearBrowserInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [config.timeLimitSeconds, state]);

  function clearQueuedWatchPhase() {
    for (const handle of timeoutHandlesRef.current) {
      clearBrowserTimeout(handle);
    }

    timeoutHandlesRef.current = [];
  }

  function queueWatchPhase(roundIndex: number, nextRounds: ColorCensusRound[]) {
    clearQueuedWatchPhase();
    setCurrentRoundIndex(roundIndex);
    setState("watching");

    const handle = startBrowserTimeout(() => {
      const nextRound = nextRounds[roundIndex];

      if (!nextRound) {
        return;
      }

      setState((current) => (current === "watching" ? "answering" : current));
    }, config.watchDurationMs);

    if (handle !== null) {
      timeoutHandlesRef.current.push(handle);
    }
  }

  function beginRun() {
    const nextRounds = Array.from({ length: config.roundCount }, (_, roundIndex) => buildRound(config, roundIndex));

    setElapsedSeconds(0);
    setMistakeCount(0);
    setRounds(nextRounds);
    queueWatchPhase(0, nextRounds);
  }

  function answerQuery(value: CensusColorKey | number) {
    if (state !== "answering") {
      return "ignored" as const;
    }

    const currentRound = rounds[currentRoundIndex];

    if (!currentRound) {
      return "ignored" as const;
    }

    const isCorrect = currentRound.query.kind === "majority"
      ? value === currentRound.query.answerColor.key
      : value === currentRound.query.answerCount;

    if (!isCorrect) {
      setMistakeCount((current) => current + 1);
      return "wrong" as const;
    }

    const nextRoundIndex = currentRoundIndex + 1;

    if (nextRoundIndex >= rounds.length) {
      setState("cleared");
      return "correct" as const;
    }

    queueWatchPhase(nextRoundIndex, rounds);
    return "correct" as const;
  }

  return {
    answerQuery,
    beginRun,
    currentRound: rounds[currentRoundIndex] ?? previewRound,
    currentRoundIndex,
    elapsedSeconds,
    mistakeCount,
    roundCount: config.roundCount,
    state,
    timeLimitSeconds: config.timeLimitSeconds,
    watchDurationMs: config.watchDurationMs,
  };
}
