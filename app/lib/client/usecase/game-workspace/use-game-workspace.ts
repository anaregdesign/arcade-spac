import { useState } from "react";

export type GameDifficulty = "EASY" | "NORMAL" | "HARD" | "EXPERT";

export function useGameWorkspace(initialDifficulty: GameDifficulty = "NORMAL") {
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionRevision, setSessionRevision] = useState(0);
  const [autoStartRequest, setAutoStartRequest] = useState(0);

  return {
    autoStartRequest,
    difficulty,
    isPlaying,
    sessionRevision,
    beginRun() {
      setIsPlaying(true);
    },
    changeDifficulty(nextDifficulty: GameDifficulty) {
      setDifficulty(nextDifficulty);
    },
    finishRun() {
      setIsPlaying(false);
    },
    restartRun() {
      setIsPlaying(true);
      setSessionRevision((current) => current + 1);
      setAutoStartRequest((current) => current + 1);
    },
    setPlaying(nextValue: boolean) {
      setIsPlaying(nextValue);
    },
  };
}

export type GameWorkspaceController = ReturnType<typeof useGameWorkspace>;
