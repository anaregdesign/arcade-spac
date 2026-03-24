export function buildGameplayShareText(input: {
  gameDescription: string;
  gameName: string;
  shareUrl: string;
}) {
  return [
    input.gameName,
    input.gameDescription,
    `Play here: ${input.shareUrl}`,
  ].join("\n");
}