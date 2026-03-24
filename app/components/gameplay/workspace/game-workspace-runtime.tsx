import { createContext, useContext, type ReactNode } from "react";

type GameWorkspaceRuntimeValue = {
  autoStartRequest: number;
  instructionsActions: ReactNode;
  toolbarActions: ReactNode;
};

const gameWorkspaceRuntimeContext = createContext<GameWorkspaceRuntimeValue>({
  autoStartRequest: 0,
  instructionsActions: null,
  toolbarActions: null,
});

export function GameWorkspaceRuntimeProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: GameWorkspaceRuntimeValue;
}) {
  return (
    <gameWorkspaceRuntimeContext.Provider value={value}>
      {children}
    </gameWorkspaceRuntimeContext.Provider>
  );
}

export function useGameWorkspaceRuntime() {
  return useContext(gameWorkspaceRuntimeContext);
}