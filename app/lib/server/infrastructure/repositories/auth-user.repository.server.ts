import { prisma } from "../prisma.server";

type EntraIdentity = {
  avatarUrl: string | null;
  displayName: string;
  entraObjectId: string;
};

export async function getOrCreateUserFromEntraIdentity(identity: EntraIdentity) {
  const existingUser = await prisma.user.findUnique({
    where: {
      entraObjectId: identity.entraObjectId,
    },
  });

  if (existingUser) {
    return prisma.user.update({
      where: { id: existingUser.id },
      data: {
        avatarUrl: identity.avatarUrl,
        displayName: identity.displayName,
      },
    });
  }

  return prisma.$transaction(async (transaction) => {
    const createdUser = await transaction.user.create({
      data: {
        avatarUrl: identity.avatarUrl,
        displayName: identity.displayName,
        entraObjectId: identity.entraObjectId,
        visibilityScope: "TENANT_ONLY",
      },
    });

    await transaction.userProfile.create({
      data: {
        tagline: "New arcade challenger",
        themePreference: "LIGHT",
        userId: createdUser.id,
      },
    });

    const games = await transaction.game.findMany({
      select: { id: true },
    });

    if (games.length > 0) {
      await transaction.userGameSummary.createMany({
        data: games.map((game) => ({
          gameId: game.id,
          userId: createdUser.id,
        })),
      });
    }

    await transaction.userOverallSummary.createMany({
      data: [
        {
          periodType: "SEASON",
          userId: createdUser.id,
        },
        {
          periodType: "LIFETIME",
          userId: createdUser.id,
        },
      ],
    });

    return createdUser;
  });
}
