export type AppHelpSection = {
  eyebrow: string;
  title: string;
  body: string;
};

export function buildSharedHelpSections(extraSections: AppHelpSection[] = []) {
  return [
    {
      eyebrow: "1. Choose a game",
      title: "Start from the board that matches your goal",
      body: "Use search, filters, and the game grid to pick the fastest next move instead of scanning the whole app for progress details.",
    },
    {
      eyebrow: "2. Read total points",
      title: "Overall points reward cross-game strength",
      body: "Your total grows from the best confirmed score in each game, so broad improvement matters more than repeating a score you already own.",
    },
    {
      eyebrow: "3. Read rankings",
      title: "Use overall and game boards together",
      body: "Overall rankings show your cross-game standing. Game boards show where one stronger clear can close the gap to the next rival.",
    },
    {
      eyebrow: "4. Know run states",
      title: "Confirmed clears count, pending saves wait",
      body: "A run is recorded only after the board ends or you finish it explicitly. Pending saves stay visible but do not change rankings or total points until the retry succeeds.",
    },
    ...extraSections,
  ];
}
