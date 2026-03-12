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
      favoriteGame: user.profile?.favoriteGame?.toLowerCase() ?? "unselected",
    };
  });
}