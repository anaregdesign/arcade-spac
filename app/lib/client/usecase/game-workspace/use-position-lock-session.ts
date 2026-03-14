import { useEffect, useMemo, useRef, useState } from "react";

import { clearBrowserInterval, clearBrowserTimeout, startBrowserInterval, startBrowserTimeout } from "../../infrastructure/browser/timers";
import type { GridPoint } from "./game-utils";
import { randomInt, shuffleValues } from "./game-utils";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "watching" | "inputting" | "reviewing" | "cleared" | "failed";
type PlacementStatus = "exact" | "miss" | "near";

type DifficultyConfig = {
  columnCount: number;
  frameDurationMs: number;
  initialTokenCount: number;
  maxTokenCount: number;
  reviewDurationMs: number;
  roundCount: number;
  rowCount: number;
  timeLimitSeconds: number;
};

type TokenTheme = {
  color: string;
  id: string;
  label: string;
};

type PositionLockRoundToken = TokenTheme & {
  path: GridPoint[];
  targetPosition: GridPoint;
};

type WatchFrame = {
  activeTokenId: string;
  positions: Record<string, GridPoint>;
};

type PositionLockRound = {
  tokens: PositionLockRoundToken[];
  watchFrames: WatchFrame[];
};

export type PositionLockToken = TokenTheme & {
  targetPosition: GridPoint;
};

export type PositionLockRoundReview = {
  exactCount: number;
  missCount: number;
  nearCount: number;
  statuses: Record<string, PlacementStatus>;
};

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: { columnCount: 4, frameDurationMs: 260, initialTokenCount: 2, maxTokenCount: 3, reviewDurationMs: 760, roundCount: 3, rowCount: 3, timeLimitSeconds: 40 },
  NORMAL: { columnCount: 4, frameDurationMs: 230, initialTokenCount: 2, maxTokenCount: 4, reviewDurationMs: 720, roundCount: 4, rowCount: 4, timeLimitSeconds: 52 },
  HARD: { columnCount: 5, frameDurationMs: 210, initialTokenCount: 3, maxTokenCount: 5, reviewDurationMs: 680, roundCount: 5, rowCount: 4, timeLimitSeconds: 66 },
  EXPERT: { columnCount: 5, frameDurationMs: 190, initialTokenCount: 3, maxTokenCount: 6, reviewDurationMs: 640, roundCount: 6, rowCount: 4, timeLimitSeconds: 80 },
};

const tokenThemes: TokenTheme[] = [
  { color: "#f59e0b", id: "amber", label: "A" },
  { color: "#38bdf8", id: "sky", label: "B" },
  { color: "#34d399", id: "mint", label: "C" },
  { color: "#fb7185", id: "rose", label: "D" },
  { color: "#a78bfa", id: "plum", label: "E" },
  { color: "#2dd4bf", id: "teal", label: "F" },
];

function pointKey(point: GridPoint) {
  return `${point.rowIndex}:${point.columnIndex}`;
}

function positionsEqual(left: GridPoint | null | undefined, right: GridPoint | null | undefined) {
  if (!left || !right) {
    return false;
  }

  return left.rowIndex === right.rowIndex && left.columnIndex === right.columnIndex;
}

function manhattanDistance(left: GridPoint, right: GridPoint) {
  return Math.abs(left.rowIndex - right.rowIndex) + Math.abs(left.columnIndex - right.columnIndex);
}

function tokenCountForRound(config: DifficultyConfig, roundIndex: number) {
  return Math.min(config.maxTokenCount, config.initialTokenCount + Math.floor((roundIndex + 1) / 2));
}

function getNeighbors(point: GridPoint, rowCount: number, columnCount: number) {
  return [
    { rowIndex: point.rowIndex - 1, columnIndex: point.columnIndex },
    { rowIndex: point.rowIndex + 1, columnIndex: point.columnIndex },
    { rowIndex: point.rowIndex, columnIndex: point.columnIndex - 1 },
    { rowIndex: point.rowIndex, columnIndex: point.columnIndex + 1 },
  ].filter((candidate) =>
    candidate.rowIndex >= 0
    && candidate.rowIndex < rowCount
    && candidate.columnIndex >= 0
    && candidate.columnIndex < columnCount,
  );
}

function findPath(start: GridPoint, target: GridPoint, rowCount: number, columnCount: number, blockedKeys: Set<string>) {
  const queue: GridPoint[] = [start];
  const parentByKey = new Map<string, GridPoint | null>([[pointKey(start), null]]);

  while (queue.length > 0) {
    const current = queue.shift();

    if (!current) {
      break;
    }

    if (positionsEqual(current, target)) {
      const path: GridPoint[] = [];
      let cursor: GridPoint | null = current;

      while (cursor) {
        path.unshift(cursor);
        cursor = parentByKey.get(pointKey(cursor)) ?? null;
      }

      return path;
    }

    const currentKey = pointKey(current);

    for (const candidate of shuffleValues(getNeighbors(current, rowCount, columnCount))) {
      const candidateKey = pointKey(candidate);

      if (
        parentByKey.has(candidateKey)
        || (candidateKey !== pointKey(target) && blockedKeys.has(candidateKey))
      ) {
        continue;
      }

      parentByKey.set(candidateKey, current);
      queue.push(candidate);
    }
  }

  return null;
}

function createRound(config: DifficultyConfig, roundIndex: number): PositionLockRound {
  const tokenCount = tokenCountForRound(config, roundIndex);
  const tokens: PositionLockRoundToken[] = [];
  const blockedFinalKeys = new Set<string>();
  const usedStartKeys = new Set<string>();
  const cellPool = Array.from({ length: config.rowCount * config.columnCount }, (_, index) => ({
    rowIndex: Math.floor(index / config.columnCount),
    columnIndex: index % config.columnCount,
  }));

  for (const theme of tokenThemes.slice(0, tokenCount)) {
    let nextToken: PositionLockRoundToken | null = null;

    for (let attempt = 0; attempt < 40; attempt += 1) {
      const targetCandidates = shuffleValues(
        cellPool.filter((point) => !blockedFinalKeys.has(pointKey(point))),
      );

      if (targetCandidates.length === 0) {
        break;
      }

      const targetPosition = targetCandidates[0];
      const startCandidates = shuffleValues(
        cellPool.filter((point) => {
          const key = pointKey(point);

          return key !== pointKey(targetPosition)
            && !blockedFinalKeys.has(key)
            && !usedStartKeys.has(key);
        }),
      );

      if (startCandidates.length === 0) {
        continue;
      }

      const startPosition = startCandidates[0];
      const path = findPath(startPosition, targetPosition, config.rowCount, config.columnCount, blockedFinalKeys);

      if (!path || path.length < 2) {
        continue;
      }

      nextToken = {
        ...theme,
        path,
        targetPosition,
      };
      break;
    }

    if (!nextToken) {
      const fallbackCells = cellPool.filter((point) => !blockedFinalKeys.has(pointKey(point)));
      const targetPosition = fallbackCells[0] ?? { rowIndex: 0, columnIndex: 0 };
      const startPosition = fallbackCells[1] ?? { rowIndex: config.rowCount - 1, columnIndex: config.columnCount - 1 };

      nextToken = {
        ...theme,
        path: [startPosition, targetPosition],
        targetPosition,
      };
    }

    tokens.push(nextToken);
    blockedFinalKeys.add(pointKey(nextToken.targetPosition));
    usedStartKeys.add(pointKey(nextToken.path[0] ?? nextToken.targetPosition));
  }

  const watchFrames: WatchFrame[] = [];
  const settledPositions: Record<string, GridPoint> = {};

  for (const token of tokens) {
    for (const point of token.path) {
      watchFrames.push({
        activeTokenId: token.id,
        positions: {
          ...settledPositions,
          [token.id]: point,
        },
      });
    }

    settledPositions[token.id] = token.targetPosition;
  }

  return { tokens, watchFrames };
}

function createEmptyPlacements(tokens: PositionLockRoundToken[]) {
  return Object.fromEntries(tokens.map((token) => [token.id, null])) as Record<string, GridPoint | null>;
}

function findNextUnplacedTokenId(tokens: PositionLockRoundToken[], placements: Record<string, GridPoint | null>) {
  return tokens.find((token) => !placements[token.id])?.id ?? null;
}

function evaluatePlacements(tokens: PositionLockRoundToken[], placements: Record<string, GridPoint | null>): PositionLockRoundReview {
  const statuses: Record<string, PlacementStatus> = {};
  let exactCount = 0;
  let nearCount = 0;
  let missCount = 0;

  for (const token of tokens) {
    const placedPosition = placements[token.id];

    if (!placedPosition) {
      statuses[token.id] = "miss";
      missCount += 1;
      continue;
    }

    if (positionsEqual(placedPosition, token.targetPosition)) {
      statuses[token.id] = "exact";
      exactCount += 1;
      continue;
    }

    if (manhattanDistance(placedPosition, token.targetPosition) === 1) {
      statuses[token.id] = "near";
      nearCount += 1;
      continue;
    }

    statuses[token.id] = "miss";
    missCount += 1;
  }

  return { exactCount, missCount, nearCount, statuses };
}

export function usePositionLockSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const [currentRound, setCurrentRound] = useState<PositionLockRound | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [exactCount, setExactCount] = useState(0);
  const [nearCount, setNearCount] = useState(0);
  const [placementErrorCount, setPlacementErrorCount] = useState(0);
  const [placements, setPlacements] = useState<Record<string, GridPoint | null>>({});
  const [review, setReview] = useState<PositionLockRoundReview | null>(null);
  const [roundIndex, setRoundIndex] = useState(0);
  const [selectedTokenId, setSelectedTokenId] = useState<string | null>(null);
  const [state, setState] = useState<SessionState>("idle");
  const [watchFrameIndex, setWatchFrameIndex] = useState(0);

  const phaseTimeoutHandlesRef = useRef<number[]>([]);
  const timerIntervalRef = useRef<number | null>(null);

  function clearPhaseHandles() {
    for (const handle of phaseTimeoutHandlesRef.current) {
      clearBrowserTimeout(handle);
    }

    phaseTimeoutHandlesRef.current = [];
  }

  function resetSession() {
    clearPhaseHandles();

    if (timerIntervalRef.current !== null) {
      clearBrowserInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    setCurrentRound(null);
    setElapsedSeconds(0);
    setExactCount(0);
    setNearCount(0);
    setPlacementErrorCount(0);
    setPlacements({});
    setReview(null);
    setRoundIndex(0);
    setSelectedTokenId(null);
    setState("idle");
    setWatchFrameIndex(0);
  }

  useEffect(() => {
    return () => {
      clearPhaseHandles();

      if (timerIntervalRef.current !== null) {
        clearBrowserInterval(timerIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    resetSession();
  }, [config]);

  useEffect(() => {
    if (state !== "watching" && state !== "inputting" && state !== "reviewing") {
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
          clearPhaseHandles();
          setSelectedTokenId(null);
          setState((currentState) =>
            currentState === "watching" || currentState === "inputting" || currentState === "reviewing" ? "failed" : currentState,
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

  function playWatchPhase(round: PositionLockRound) {
    clearPhaseHandles();
    setReview(null);
    setPlacements(createEmptyPlacements(round.tokens));
    setSelectedTokenId(null);
    setWatchFrameIndex(0);
    setState("watching");

    round.watchFrames.forEach((frame, index) => {
      const handle = startBrowserTimeout(() => {
        setWatchFrameIndex(index);
      }, index * config.frameDurationMs);

      if (handle !== null) {
        phaseTimeoutHandlesRef.current.push(handle);
      }
    });

    const finishHandle = startBrowserTimeout(() => {
      setState((currentState) => (currentState === "watching" ? "inputting" : currentState));
      setSelectedTokenId(round.tokens[0]?.id ?? null);
      setWatchFrameIndex(Math.max(0, round.watchFrames.length - 1));
    }, round.watchFrames.length * config.frameDurationMs);

    if (finishHandle !== null) {
      phaseTimeoutHandlesRef.current.push(finishHandle);
    }
  }

  function openRound(nextRoundIndex: number) {
    const round = createRound(config, nextRoundIndex);

    setCurrentRound(round);
    setRoundIndex(nextRoundIndex);
    playWatchPhase(round);
  }

  function beginRun() {
    setElapsedSeconds(0);
    setExactCount(0);
    setNearCount(0);
    setPlacementErrorCount(0);
    openRound(0);
  }

  function selectToken(tokenId: string) {
    if (state !== "inputting") {
      return "ignored" as const;
    }

    if (!currentRound?.tokens.some((token) => token.id === tokenId)) {
      return "ignored" as const;
    }

    setSelectedTokenId(tokenId);
    return "selected" as const;
  }

  function placeToken(rowIndex: number, columnIndex: number) {
    if (state !== "inputting" || !currentRound || !selectedTokenId) {
      return "ignored" as const;
    }

    const targetPoint = { rowIndex, columnIndex };
    const occupiedBy = currentRound.tokens.find((token) =>
      token.id !== selectedTokenId && positionsEqual(placements[token.id], targetPoint));

    if (occupiedBy) {
      return "blocked" as const;
    }

    const nextPlacements = {
      ...placements,
      [selectedTokenId]: targetPoint,
    };

    setPlacements(nextPlacements);

    const nextSelectedTokenId = findNextUnplacedTokenId(currentRound.tokens, nextPlacements);

    if (nextSelectedTokenId) {
      setSelectedTokenId(nextSelectedTokenId);
      return "placed" as const;
    }

    const nextReview = evaluatePlacements(currentRound.tokens, nextPlacements);
    const nextRoundIndex = roundIndex + 1;

    setReview(nextReview);
    setExactCount((current) => current + nextReview.exactCount);
    setNearCount((current) => current + nextReview.nearCount);
    setPlacementErrorCount((current) => current + nextReview.nearCount + nextReview.missCount);
    setSelectedTokenId(null);
    setState("reviewing");
    clearPhaseHandles();

    const finishHandle = startBrowserTimeout(() => {
      if (nextRoundIndex >= config.roundCount) {
        setState("cleared");
        return;
      }

      openRound(nextRoundIndex);
    }, config.reviewDurationMs);

    if (finishHandle !== null) {
      phaseTimeoutHandlesRef.current.push(finishHandle);
    }

    return "review" as const;
  }

  const visiblePositions = (() => {
    if (state === "watching") {
      return currentRound?.watchFrames[watchFrameIndex]?.positions ?? {};
    }

    if (state === "inputting" || state === "reviewing" || state === "failed") {
      return Object.fromEntries(
        Object.entries(placements).filter((entry): entry is [string, GridPoint] => entry[1] !== null),
      );
    }

    return {};
  })();

  return {
    activeWatchTokenId: currentRound?.watchFrames[watchFrameIndex]?.activeTokenId ?? null,
    beginRun,
    columnCount: config.columnCount,
    elapsedSeconds,
    exactCount,
    nearCount,
    placementErrorCount,
    placeToken,
    placedTokenCount: Object.values(placements).filter(Boolean).length,
    placements,
    review,
    roundCount: config.roundCount,
    roundIndex,
    rowCount: config.rowCount,
    selectToken,
    selectedTokenId,
    state,
    timeLimitSeconds: config.timeLimitSeconds,
    tokens: currentRound?.tokens.map((token) => ({
      color: token.color,
      id: token.id,
      label: token.label,
      targetPosition: token.targetPosition,
    })) ?? [],
    tokenCount: currentRound?.tokens.length ?? tokenCountForRound(config, 0),
    visiblePositions,
    watchFrameIndex,
  };
}
