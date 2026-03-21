import { listSignInUsers } from "../infrastructure/repositories/arcade-dashboard.repository.server";

export async function getLoginOptions() {
  const users = await listSignInUsers();

  return users.map((user) => {
    const seasonalSummary = user.overallSummaries[0];

    return {
      id: user.id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      tagline: user.profile?.tagline ?? "Arcade challenger",
      totalPoints: seasonalSummary?.totalPoints ?? 0,
      rank: seasonalSummary?.currentRank ?? null,
      favoriteSummary: user.favorites.length === 0
        ? "No favorites yet"
        : user.favorites.length === 1
          ? user.favorites[0]?.game.name ?? "No favorites yet"
          : `${user.favorites.length} favorites`,
    };
  });
}