import { useState } from "react";

import { isSoundMuted, setSoundMuted } from "../../sound-effects";

export function useSoundMute() {
  const [muted, setMuted] = useState(() => isSoundMuted());

  function toggleMute() {
    const next = !muted;
    setSoundMuted(next);
    setMuted(next);
  }

  return { muted, toggleMute };
}
