export function formatDuration(totalSeconds: number) {
  return `${Math.floor(totalSeconds / 60)}:${(totalSeconds % 60).toString().padStart(2, "0")}`;
}

export function formatElapsedMs(elapsedMs: number) {
  return `${(elapsedMs / 1000).toFixed(2)}s`;
}
