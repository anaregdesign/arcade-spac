import type { GameWorkspaceController } from "../../../lib/client/usecase/game-workspace/use-game-workspace";
import type { GameInstructions } from "./game-instructions-dialog";

export type AlternateGameLink = {
  href: string;
  label: string;
} | null;

export type GameWorkspaceComponentProps = {
  alternateGame: AlternateGameLink;
  instructions: GameInstructions;
  workspace: GameWorkspaceController;
};
