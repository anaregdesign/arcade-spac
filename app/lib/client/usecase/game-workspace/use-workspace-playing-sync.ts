import { useEffect } from "react";

import type { GameWorkspaceController } from "./use-game-workspace";

export function useWorkspacePlayingSync(
  isPlaying: boolean,
  workspace: Pick<GameWorkspaceController, "setPlaying">,
) {
  useEffect(() => {
    workspace.setPlaying(isPlaying);
  }, [isPlaying, workspace]);
}
