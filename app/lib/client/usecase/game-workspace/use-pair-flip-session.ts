import { useEffect, useMemo, useRef, useState } from "react";

type Difficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";
type SessionState = "idle" | "playing" | "cleared" | "failed";

type Card = {
  id: string;
  isMatched: boolean;
  isOpen: boolean;
  symbol: string;
};

const symbols = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
] as const;

const difficultyConfig: Record<Difficulty, { columns: number; pairCount: number; rows: number; timeLimitSeconds: number }> = {
  EASY: { columns: 4, pairCount: 6, rows: 3, timeLimitSeconds: 40 },
  NORMAL: { columns: 4, pairCount: 8, rows: 4, timeLimitSeconds: 55 },
  HARD: { columns: 5, pairCount: 10, rows: 4, timeLimitSeconds: 70 },
  EXPERT: { columns: 6, pairCount: 12, rows: 4, timeLimitSeconds: 85 },
};

function chunkCards(cards: Card[], columns: number) {
  const rows: Card[][] = [];

  for (let index = 0; index < cards.length; index += columns) {
    rows.push(cards.slice(index, index + columns));
  }

  return rows;
}

function shuffle<T>(values: T[]) {
  const next = values.slice();

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

function buildDeck(pairCount: number) {
  return symbols.slice(0, pairCount).flatMap((symbol) => [
    { id: `${symbol}-1`, isMatched: false, isOpen: false, symbol },
    { id: `${symbol}-2`, isMatched: false, isOpen: false, symbol },
  ]);
}

function cloneBoard(board: Card[][]) {
  return board.map((row) => row.map((card) => ({ ...card })));
}

export function usePairFlipSession(difficulty: Difficulty) {
  const config = useMemo(() => difficultyConfig[difficulty], [difficulty]);
  const mismatchTimeoutRef = useRef<number | null>(null);
  const [board, setBoard] = useState<Card[][]>(() => chunkCards(buildDeck(config.pairCount), config.columns));
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [mismatchCount, setMismatchCount] = useState(0);
  const [openCardIds, setOpenCardIds] = useState<string[]>([]);
  const [state, setState] = useState<SessionState>("idle");

  useEffect(() => {
    if (mismatchTimeoutRef.current !== null) {
      window.clearTimeout(mismatchTimeoutRef.current);
      mismatchTimeoutRef.current = null;
    }

    setBoard(chunkCards(buildDeck(config.pairCount), config.columns));
    setElapsedSeconds(0);
    setMismatchCount(0);
    setOpenCardIds([]);
    setState("idle");
  }, [config]);

  useEffect(() => {
    if (state !== "playing") {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setElapsedSeconds((currentValue) => {
        const nextValue = Math.min(config.timeLimitSeconds, currentValue + 1);

        if (nextValue >= config.timeLimitSeconds) {
          setState((currentState) => (currentState === "playing" ? "failed" : currentState));
        }

        return nextValue;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [config.timeLimitSeconds, state]);

  useEffect(() => () => {
    if (mismatchTimeoutRef.current !== null) {
      window.clearTimeout(mismatchTimeoutRef.current);
    }
  }, []);

  function beginRun() {
    if (mismatchTimeoutRef.current !== null) {
      window.clearTimeout(mismatchTimeoutRef.current);
      mismatchTimeoutRef.current = null;
    }

    setBoard(chunkCards(shuffle(buildDeck(config.pairCount)), config.columns));
    setElapsedSeconds(0);
    setMismatchCount(0);
    setOpenCardIds([]);
    setState("playing");
  }

  function tapCard(rowIndex: number, columnIndex: number) {
    if (state !== "playing" || openCardIds.length >= 2) {
      return;
    }

    const currentCard = board[rowIndex]?.[columnIndex];

    if (!currentCard || currentCard.isMatched || currentCard.isOpen) {
      return;
    }

    const nextBoard = cloneBoard(board);
    nextBoard[rowIndex][columnIndex].isOpen = true;
    const nextOpenCardIds = [...openCardIds, currentCard.id];
    setBoard(nextBoard);
    setOpenCardIds(nextOpenCardIds);

    if (nextOpenCardIds.length < 2) {
      return;
    }

    const openCards = nextBoard.flat().filter((card) => nextOpenCardIds.includes(card.id));

    if (openCards.length !== 2) {
      return;
    }

    if (openCards[0].symbol === openCards[1].symbol) {
      const matchedBoard = nextBoard.map((row) =>
        row.map((card) =>
          nextOpenCardIds.includes(card.id)
            ? { ...card, isMatched: true, isOpen: true }
            : card),
      );

      const allMatched = matchedBoard.flat().every((card) => card.isMatched);
      setBoard(matchedBoard);
      setOpenCardIds([]);

      if (allMatched) {
        setState("cleared");
      }

      return;
    }

    setMismatchCount((currentValue) => currentValue + 1);
    mismatchTimeoutRef.current = window.setTimeout(() => {
      setBoard((currentBoard) =>
        currentBoard.map((row) =>
          row.map((card) =>
            nextOpenCardIds.includes(card.id)
              ? { ...card, isOpen: false }
              : card),
        ),
      );
      setOpenCardIds([]);
      mismatchTimeoutRef.current = null;
    }, 640);
  }

  const matchedPairCount = board.flat().filter((card) => card.isMatched).length / 2;

  return {
    beginRun,
    board,
    columns: config.columns,
    elapsedSeconds,
    matchedPairCount,
    mismatchCount,
    remainingPairs: config.pairCount - matchedPairCount,
    state,
    timeLimitSeconds: config.timeLimitSeconds,
    totalPairs: config.pairCount,
    tapCard,
  };
}
