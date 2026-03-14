export type BrowserAnimationFrameHandle = number | null;
export type BrowserIntervalHandle = number | null;
export type BrowserTimeoutHandle = number | null;

export function requestBrowserAnimationFrame(callback: FrameRequestCallback): BrowserAnimationFrameHandle {
  if (typeof window === "undefined") {
    return null;
  }

  return window.requestAnimationFrame(callback);
}

export function cancelBrowserAnimationFrame(handle: BrowserAnimationFrameHandle): void {
  if (typeof window === "undefined" || handle === null) {
    return;
  }

  window.cancelAnimationFrame(handle);
}

export function startBrowserInterval(callback: () => void, delayMs: number): BrowserIntervalHandle {
  if (typeof window === "undefined") {
    return null;
  }

  return window.setInterval(callback, delayMs);
}

export function clearBrowserInterval(handle: BrowserIntervalHandle): void {
  if (typeof window === "undefined" || handle === null) {
    return;
  }

  window.clearInterval(handle);
}

export function startBrowserTimeout(callback: () => void, delayMs: number): BrowserTimeoutHandle {
  if (typeof window === "undefined") {
    return null;
  }

  return window.setTimeout(callback, delayMs);
}

export function clearBrowserTimeout(handle: BrowserTimeoutHandle): void {
  if (typeof window === "undefined" || handle === null) {
    return;
  }

  window.clearTimeout(handle);
}
