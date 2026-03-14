import { useEffect, useMemo, useState } from "react";

import { clearBrowserInterval, startBrowserInterval } from "../../infrastructure/browser/timers";
import { pickDistinctIndices, randomInt } from "./game-utils";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";

type HiddenFindCell = {
  id: string;
  isTarget: boolean;
  rotation: number;
  scale: number;
  symbol: string;
};

type HiddenFindScene = {
  board: HiddenFindCell[][];
  targetSymbol: string;
};

type DifficultyConfig = {
  columnCount: number;
  rowCount: number;
  sceneCount: number;
  timeLimitSeconds: number;
};

const motifFamilies = [
  { distractors: ["◇", "◈", "⬦", "⋄"], target: "◆" },
  { distractors: ["○", "◔", "◌", "◎"], target: "●" },
  { distractors: ["△", "▵", "◬", "⟁"], target: "▲" },
  { distractors: ["□", "▢", "▣", "⬚"], target: "■" },
  { distractors: ["✧", "✩", "✶", "✹"], target: "★" },
  { distractors: ["⬡", "⬢", "⬣", "⬟"], target: "✿" },
] as const;

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: { columnCount: 5, rowCount: 4, sceneCount: 4, timeLimitSeconds: 28 },
  NORMAL: { columnCount: 6, rowCount: 4, sceneCount: 5, timeLimitSeconds: 38 },
  HARD: { columnCount: 6, rowCount: 5, sceneCount: 6, timeLimitSeconds: 52 },
  EXPERT: { columnCount: 7, rowCount: 5, sceneCount: 7, timeLimitSeconds: 64 },
};

function createPreviewScene(config: DifficultyConfig): HiddenFindScene {
  const family = motifFamilies[0];
  const targetIndex = 6;
  const board = Array.from({ length: config.rowCount }, (_, rowIndex) =>
    Array.from({ length: config.columnCount }, (_, columnIndex) => {
      const flatIndex = rowIndex * config.columnCount + columnIndex;
      const isTarget = flatIndex === targetIndex;

      return {
        id: `hidden-preview-${rowIndex}-${columnIndex}`,
        isTarget,
        rotation: (flatIndex % 4) * 8 - 12,
        scale: isTarget ? 1.08 : 0.94 + (flatIndex % 3) * 0.04,
        symbol: isTarget ? family.target : family.distractors[flatIndex % family.distractors.length],
      };
    }),
  );

  return { board, targetSymbol: family.target };
}

function buildLiveScene(config: DifficultyConfig, sceneIndex: number): HiddenFindScene {
  const totalCellCount = config.rowCount * config.columnCount;
  const family = motifFamilies[(sceneIndex + randomInt(motifFamilies.length)) % motifFamilies.length];
  const [targetIndex] = pickDistinctIndices(totalCellCount, 1);
  const board = Array.from({ length: config.rowCount }, (_, rowIndex) =>
    Array.from({ length: config.columnCount }, (_, columnIndex) => {
      const flatIndex = rowIndex * config.columnCount + columnIndex;
      const isTarget = flatIndex === targetIndex;

      return {
        id: `hidden-live-${sceneIndex}-${rowIndex}-${columnIndex}`,
        isTarget,
        rotation: randomInt(7) * 10 - 30,
        scale: isTarget ? 1 + randomInt(2) * 0.04 : 0.88 + randomInt(4) * 0.05,
        symbol: isTarget ? family.target : family.distractors[randomInt(family.distractors.length)],
      };
    }),
  );

  return { board, targetSymbol: family.target };
}

export function useHiddenFindSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const preview = useMemo(() => createPreviewScene(config), [config]);
  const [currentScene, setCurrentScene] = useState<HiddenFindScene>(preview);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [falseTapCount, setFalseTapCount] = useState(0);
  const [sceneIndex, setSceneIndex] = useState(0);
  const [state, setState] = useState<SessionState>("idle");

  useEffect(() => {
    setCurrentScene(preview);
    setElapsedSeconds(0);
    setFalseTapCount(0);
    setSceneIndex(0);
    setState("idle");
  }, [config, preview]);

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
    setCurrentScene(buildLiveScene(config, 0));
    setElapsedSeconds(0);
    setFalseTapCount(0);
    setSceneIndex(0);
    setState("playing");
  }

  function pressCell(rowIndex: number, columnIndex: number) {
    if (state !== "playing") {
      return "ignored" as const;
    }

    const cell = currentScene.board[rowIndex]?.[columnIndex];

    if (!cell) {
      return "ignored" as const;
    }

    if (!cell.isTarget) {
      setFalseTapCount((current) => current + 1);
      setElapsedSeconds((current) => Math.min(config.timeLimitSeconds, current + 2));
      return "wrong" as const;
    }

    const nextSceneIndex = sceneIndex + 1;

    if (nextSceneIndex >= config.sceneCount) {
      setSceneIndex(nextSceneIndex);
      setState("cleared");
      return "correct" as const;
    }

    setCurrentScene(buildLiveScene(config, nextSceneIndex));
    setSceneIndex(nextSceneIndex);
    return "correct" as const;
  }

  return {
    beginRun,
    columnCount: config.columnCount,
    currentScene,
    elapsedSeconds,
    falseTapCount,
    rowCount: config.rowCount,
    sceneCount: config.sceneCount,
    sceneIndex,
    state,
    timeLimitSeconds: config.timeLimitSeconds,
    pressCell,
  };
}
