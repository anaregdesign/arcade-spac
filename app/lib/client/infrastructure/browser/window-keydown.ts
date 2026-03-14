export function subscribeWindowKeydown(listener: (event: KeyboardEvent) => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("keydown", listener);

  return () => {
    window.removeEventListener("keydown", listener);
  };
}
