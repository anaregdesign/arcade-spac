import { useEffect, useMemo, useRef, useState } from "react";

import { clearBrowserInterval, startBrowserInterval } from "../../infrastructure/browser/timers";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";
type ShotOutcome = "hazard" | "ignored" | "miss" | "target";

type TracePoint = {
  x: number;
  y: number;
};

type RawAngleOption = {
  id: string;
  label: string;
  velocityX: number;
};

type AngleOption = RawAngleOption & {
  bounceCount: number;
  landingPocketId: string;
  landingPocketLabel: string;
  landingX: number;
  tracePoints: TracePoint[];
};

type Pocket = {
  id: string;
  label: string;
  x: number;
};

type RawPuzzleDefinition = {
  hazardAngleIds: readonly string[];
  id: string;
  name: string;
  solutionAngleId: string;
};

type PuzzleDefinition = RawPuzzleDefinition & {
  hazardPocketIds: string[];
  requiredBounces: number;
  targetPocketId: string;
  targetPocketLabel: string;
};

type DifficultyConfig = {
  puzzles: PuzzleDefinition[];
  timeLimitSeconds: number;
};

type EventType = "left-wall" | "right-wall" | "top-pocket";

const BOARD_WIDTH = 240;
const BOARD_HEIGHT = 180;
const LEFT_WALL = 12;
const RIGHT_WALL = BOARD_WIDTH - 12;
const TOP_WALL = 12;
const LAUNCH_X = BOARD_WIDTH / 2;
const LAUNCH_Y = BOARD_HEIGHT - 8;
const VELOCITY_Y = -2.6;
const DEFAULT_ANGLE_ID = "soft-left";

const rawAngleOptions: RawAngleOption[] = [
  { id: "wide-left", label: "Wide left", velocityX: -5.6 },
  { id: "bank-left", label: "Bank left", velocityX: -2.4 },
  { id: "soft-left", label: "Soft left", velocityX: -0.8 },
  { id: "soft-right", label: "Soft right", velocityX: 0.8 },
  { id: "bank-right", label: "Bank right", velocityX: 2.4 },
  { id: "wide-right", label: "Wide right", velocityX: 5.6 },
];

const rawPuzzles = [
  {
    hazardAngleIds: ["soft-left", "soft-right"],
    id: "north-pocket",
    name: "North Pocket",
    solutionAngleId: "bank-left",
  },
  {
    hazardAngleIds: ["soft-right", "wide-left"],
    id: "mirror-pocket",
    name: "Mirror Pocket",
    solutionAngleId: "bank-right",
  },
  {
    hazardAngleIds: ["soft-left", "bank-left"],
    id: "double-cross",
    name: "Double Cross",
    solutionAngleId: "wide-right",
  },
  {
    hazardAngleIds: ["soft-right", "bank-right"],
    id: "return-bank",
    name: "Return Bank",
    solutionAngleId: "wide-left",
  },
] as const;

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function simulateTrace(velocityX: number) {
  let currentX = LAUNCH_X;
  let currentY = LAUNCH_Y;
  let currentVelocityX = velocityX;
  let bounceCount = 0;
  const tracePoints: TracePoint[] = [{ x: round(currentX), y: round(currentY) }];

  for (let step = 0; step < 12; step += 1) {
    const candidateEvents = [
      currentVelocityX < 0
        ? { kind: "left-wall" as const, time: (LEFT_WALL - currentX) / currentVelocityX }
        : null,
      currentVelocityX > 0
        ? { kind: "right-wall" as const, time: (RIGHT_WALL - currentX) / currentVelocityX }
        : null,
      { kind: "top-pocket" as const, time: (TOP_WALL - currentY) / VELOCITY_Y },
    ].filter((event): event is { kind: EventType; time: number } => event !== null && event.time > 0);
    const nextEvent = candidateEvents.sort((left, right) => left.time - right.time)[0];

    if (!nextEvent) {
      break;
    }

    currentX = round(currentX + currentVelocityX * nextEvent.time);
    currentY = round(currentY + VELOCITY_Y * nextEvent.time);
    tracePoints.push({ x: currentX, y: currentY });

    if (nextEvent.kind === "top-pocket") {
      return {
        bounceCount,
        landingX: currentX,
        tracePoints,
      };
    }

    bounceCount += 1;
    currentVelocityX = nextEvent.kind === "left-wall" ? Math.abs(currentVelocityX) : -Math.abs(currentVelocityX);
  }

  return {
    bounceCount,
    landingX: currentX,
    tracePoints,
  };
}

const simulatedAngles = rawAngleOptions.map((angle) => ({
  ...angle,
  ...simulateTrace(angle.velocityX),
}));

const pockets = simulatedAngles
  .slice()
  .sort((left, right) => left.landingX - right.landingX)
  .map((angle, index): Pocket & { angleId: string } => ({
    angleId: angle.id,
    id: `pocket-${index + 1}`,
    label: String.fromCharCode(65 + index),
    x: angle.landingX,
  }));

const pocketByAngleId = new Map(pockets.map((pocket) => [pocket.angleId, pocket] as const));

const angleOptions: AngleOption[] = simulatedAngles.map((angle) => {
  const pocket = pocketByAngleId.get(angle.id);

  if (!pocket) {
    throw new Error(`Missing pocket for angle ${angle.id}`);
  }

  return {
    ...angle,
    landingPocketId: pocket.id,
    landingPocketLabel: pocket.label,
  };
});

const angleById = new Map(angleOptions.map((angle) => [angle.id, angle] as const));

function hydratePuzzle(rawPuzzle: (typeof rawPuzzles)[number]): PuzzleDefinition {
  const solutionAngle = angleById.get(rawPuzzle.solutionAngleId);

  if (!solutionAngle) {
    throw new Error(`Unknown solution angle ${rawPuzzle.solutionAngleId}`);
  }

  return {
    ...rawPuzzle,
    hazardPocketIds: rawPuzzle.hazardAngleIds.map((angleId) => {
      const hazardAngle = angleById.get(angleId);

      if (!hazardAngle) {
        throw new Error(`Unknown hazard angle ${angleId}`);
      }

      return hazardAngle.landingPocketId;
    }),
    requiredBounces: solutionAngle.bounceCount,
    targetPocketId: solutionAngle.landingPocketId,
    targetPocketLabel: solutionAngle.landingPocketLabel,
  };
}

const difficultyConfig: Record<Difficulty, DifficultyConfig> = {
  EASY: {
    puzzles: [hydratePuzzle(rawPuzzles[0]), hydratePuzzle(rawPuzzles[1])],
    timeLimitSeconds: 48,
  },
  NORMAL: {
    puzzles: [hydratePuzzle(rawPuzzles[0]), hydratePuzzle(rawPuzzles[1]), hydratePuzzle(rawPuzzles[2])],
    timeLimitSeconds: 64,
  },
  HARD: {
    puzzles: [hydratePuzzle(rawPuzzles[0]), hydratePuzzle(rawPuzzles[1]), hydratePuzzle(rawPuzzles[2]), hydratePuzzle(rawPuzzles[3])],
    timeLimitSeconds: 82,
  },
  EXPERT: {
    puzzles: [
      hydratePuzzle(rawPuzzles[0]),
      hydratePuzzle(rawPuzzles[2]),
      hydratePuzzle(rawPuzzles[1]),
      hydratePuzzle(rawPuzzles[3]),
      hydratePuzzle(rawPuzzles[2]),
    ],
    timeLimitSeconds: 98,
  },
};

export function useBounceAngleSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [lastActionLabel, setLastActionLabel] = useState("Start the launcher to open the first ricochet board.");
  const [lastBounceCount, setLastBounceCount] = useState(0);
  const [lastLandingPocketId, setLastLandingPocketId] = useState<string | null>(null);
  const [lastOutcome, setLastOutcome] = useState<ShotOutcome | null>(null);
  const [selectedAngleId, setSelectedAngleId] = useState(DEFAULT_ANGLE_ID);
  const [shotsUsed, setShotsUsed] = useState(0);
  const [state, setState] = useState<SessionState>("idle");
  const [tracePoints, setTracePoints] = useState<TracePoint[]>([]);

  const currentPuzzleIndexRef = useRef(0);
  const selectedAngleIdRef = useRef(DEFAULT_ANGLE_ID);
  const shotsUsedRef = useRef(0);
  const stateRef = useRef<SessionState>("idle");
  const timerIntervalRef = useRef<number | null>(null);

  const puzzle = config.puzzles[currentPuzzleIndex] ?? config.puzzles[0];
  const selectedAngle = angleById.get(selectedAngleId) ?? angleOptions[0];

  function clearTimer() {
    if (timerIntervalRef.current !== null) {
      clearBrowserInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  }

  function syncSession(nextPuzzleIndex: number, nextShotsUsed: number, nextState: SessionState) {
    currentPuzzleIndexRef.current = nextPuzzleIndex;
    selectedAngleIdRef.current = DEFAULT_ANGLE_ID;
    shotsUsedRef.current = nextShotsUsed;
    stateRef.current = nextState;

    setCurrentPuzzleIndex(nextPuzzleIndex);
    setSelectedAngleId(DEFAULT_ANGLE_ID);
    setShotsUsed(nextShotsUsed);
    setState(nextState);
  }

  function resetSession() {
    clearTimer();
    syncSession(0, 0, "idle");
    setElapsedSeconds(0);
    setLastActionLabel("Start the launcher to open the first ricochet board.");
    setLastBounceCount(0);
    setLastLandingPocketId(null);
    setLastOutcome(null);
    setTracePoints([]);
  }

  function beginRun() {
    clearTimer();
    syncSession(0, 0, "playing");
    setElapsedSeconds(0);
    setLastActionLabel(`${config.puzzles[0]?.name ?? "Ricochet board"} ready`);
    setLastBounceCount(0);
    setLastLandingPocketId(null);
    setLastOutcome(null);
    setTracePoints([]);
  }

  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  useEffect(() => {
    resetSession();
  }, [config]);

  useEffect(() => {
    if (state !== "playing") {
      clearTimer();
      return;
    }

    timerIntervalRef.current = startBrowserInterval(() => {
      setElapsedSeconds((current) => {
        const next = Math.min(config.timeLimitSeconds, current + 1);

        if (next >= config.timeLimitSeconds) {
          clearTimer();
          stateRef.current = "failed";
          setState("failed");
          setLastActionLabel("Time expired");
        }

        return next;
      });
    }, 1000);

    return () => {
      clearTimer();
    };
  }, [config.timeLimitSeconds, state]);

  function chooseAngle(angleId: string) {
    if (stateRef.current !== "playing") {
      return "ignored" as const;
    }

    if (!angleById.has(angleId)) {
      return "ignored" as const;
    }

    selectedAngleIdRef.current = angleId;
    setSelectedAngleId(angleId);
    setLastActionLabel(`${angleById.get(angleId)?.label ?? "Angle"} selected`);

    return "selected" as const;
  }

  function launch(): ShotOutcome {
    if (stateRef.current !== "playing") {
      return "ignored";
    }

    const currentPuzzle = config.puzzles[currentPuzzleIndexRef.current] ?? config.puzzles[0];
    const angle = angleById.get(selectedAngleIdRef.current) ?? angleOptions[0];
    const nextShotsUsed = shotsUsedRef.current + 1;

    shotsUsedRef.current = nextShotsUsed;
    setShotsUsed(nextShotsUsed);
    setTracePoints(angle.tracePoints);
    setLastBounceCount(angle.bounceCount);
    setLastLandingPocketId(angle.landingPocketId);

    if (angle.id === currentPuzzle.solutionAngleId) {
      setLastOutcome("target");

      if (currentPuzzleIndexRef.current < config.puzzles.length - 1) {
        const nextPuzzleIndex = currentPuzzleIndexRef.current + 1;
        const nextPuzzle = config.puzzles[nextPuzzleIndex] ?? currentPuzzle;

        currentPuzzleIndexRef.current = nextPuzzleIndex;
        selectedAngleIdRef.current = DEFAULT_ANGLE_ID;
        setCurrentPuzzleIndex(nextPuzzleIndex);
        setSelectedAngleId(DEFAULT_ANGLE_ID);
        setLastActionLabel(`Pocket ${angle.landingPocketLabel} scored. ${nextPuzzle.name} ready`);
        return "target";
      }

      clearTimer();
      stateRef.current = "cleared";
      setState("cleared");
      setLastActionLabel(`Pocket ${angle.landingPocketLabel} cleared the run`);
      return "target";
    }

    if (currentPuzzle.hazardPocketIds.includes(angle.landingPocketId)) {
      setLastOutcome("hazard");
      setLastActionLabel(`Pocket ${angle.landingPocketLabel} hit a hazard`);
      return "hazard";
    }

    setLastOutcome("miss");
    setLastActionLabel(`Pocket ${angle.landingPocketLabel} missed the goal`);
    return "miss";
  }

  return {
    angleOptions: angleOptions.map((angle) => ({
      bounceCount: angle.bounceCount,
      id: angle.id,
      isSelected: angle.id === selectedAngleId,
      label: angle.label,
    })),
    beginRun,
    boardHeight: BOARD_HEIGHT,
    boardWidth: BOARD_WIDTH,
    chooseAngle,
    currentPuzzleIndex,
    currentPuzzleName: puzzle.name,
    elapsedSeconds,
    lastActionLabel,
    lastBounceCount,
    lastLandingPocketId,
    lastLandingPocketLabel: angleOptions.find((angle) => angle.landingPocketId === lastLandingPocketId)?.landingPocketLabel ?? null,
    lastOutcome,
    launch,
    pockets: pockets.map((pocket) => ({
      id: pocket.id,
      isLastLanding: pocket.id === lastLandingPocketId,
      label: pocket.label,
      status: pocket.id === puzzle.targetPocketId
        ? "target"
        : puzzle.hazardPocketIds.includes(pocket.id)
          ? "hazard"
          : "neutral",
      x: pocket.x,
    })),
    puzzleCount: config.puzzles.length,
    requiredBounces: puzzle.requiredBounces,
    selectedAngleBounceCount: selectedAngle?.bounceCount ?? 0,
    selectedAngleId,
    selectedAngleLabel: selectedAngle?.label ?? null,
    shotsUsed,
    solutionAngleId: puzzle.solutionAngleId,
    state,
    targetPocketLabel: puzzle.targetPocketLabel,
    timeLimitSeconds: config.timeLimitSeconds,
    tracePoints,
  };
}
