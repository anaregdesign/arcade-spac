import type { GameWorkspaceController } from "../../../lib/client/usecase/game-workspace/use-game-workspace";

export type AlternateGameLink = {
  href: string;
  label: string;
} | null;

export type GameWorkspaceComponentProps = {
  alternateGame: AlternateGameLink;
  workspace: GameWorkspaceController;
};
