import { useState } from "react";

export function useGameWorkspace(initialDifficulty: "EASY" | "NORMAL" | "HARD" | "EXPERT" = "NORMAL") {
  const [difficulty, setDifficulty] = useState(initialDifficulty);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [targetDestination, setTargetDestination] = useState<string | null>(null);

  return {
    difficulty,
    isPlaying,
    showLeaveConfirm,
    targetDestination,
    beginRun() {
      setIsPlaying(true);
    },
    changeDifficulty(nextDifficulty: "EASY" | "NORMAL" | "HARD" | "EXPERT") {
      setDifficulty(nextDifficulty);
    },
    openLeaveConfirm(destination: string) {
      setTargetDestination(destination);
      setShowLeaveConfirm(true);
    },
    cancelLeaveConfirm() {
      setShowLeaveConfirm(false);
      setTargetDestination(null);
    },
    finishRun() {
      setIsPlaying(false);
      setShowLeaveConfirm(false);
      setTargetDestination(null);
    },
    setPlaying(nextValue: boolean) {
      setIsPlaying(nextValue);

      if (!nextValue) {
        setShowLeaveConfirm(false);
        setTargetDestination(null);
      }
    },
  };
}