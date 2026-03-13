import { useState } from "react";

export type GameDifficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";

export function useGameWorkspace(initialDifficulty: GameDifficulty = "NORMAL") {
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [isPlaying, setIsPlaying] = useState(false);

  return {
    difficulty,
    isPlaying,
    beginRun() {
      setIsPlaying(true);
    },
    changeDifficulty(nextDifficulty: GameDifficulty) {
      setDifficulty(nextDifficulty);
    },
    finishRun() {
      setIsPlaying(false);
    },
    setPlaying(nextValue: boolean) {
      setIsPlaying(nextValue);
    },
  };
}

export type GameWorkspaceController = ReturnType<typeof useGameWorkspace>;
