import { createContext, useContext, type ReactNode } from "react";

type GameWorkspaceRuntimeValue = {
  autoStartRequest: number;
  toolbarActions: ReactNode;
};

const gameWorkspaceRuntimeContext = createContext<GameWorkspaceRuntimeValue>({
  autoStartRequest: 0,
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