import type { GameWorkspaceController } from "../../../lib/client/usecase/game-workspace/use-game-workspace";
import type { GameInstructions } from "./game-instructions-dialog";

export type AlternateGameLink = {
  href: string;
  key: string;
  label: string;
};

export type GameWorkspaceComponentProps = {
  alternateGames: AlternateGameLink[];
  instructions: GameInstructions;
  workspace: GameWorkspaceController;
};
