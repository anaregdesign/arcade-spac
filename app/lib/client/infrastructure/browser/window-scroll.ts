export function readWindowScrollY(): number {
  if (typeof window === "undefined") {
    return 0;
  }

  return window.scrollY;
}

export function subscribeWindowScroll(listener: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("scroll", listener, { passive: true });

  return () => {
    window.removeEventListener("scroll", listener);
  };
}

export function restoreWindowScroll(scrollY: number): void {
  if (typeof window === "undefined") {
    return;
  }

  window.requestAnimationFrame(() => {
    window.scrollTo({ behavior: "auto", top: scrollY });
  });
}
