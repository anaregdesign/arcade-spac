import { listPersistedGames } from "../../../domain/entities/game-catalog";
import { prisma } from "../prisma.server";

let catalogSyncPromise: Promise<void> | null = null;

async function synchronizeGameCatalog() {
  const games = listPersistedGames();

  await prisma.$transaction(
    games.map((game) =>
      prisma.game.upsert({
        where: { key: game.key },
        update: {
          name: game.name,
          shortDescription: game.shortDescription,
          accentColor: game.accentColor,
          rulesSummary: game.rulesSummary,
        },
        create: game,
      })
    ),
  );
}

export async function ensureCanonicalGameCatalog() {
  if (!catalogSyncPromise) {
    catalogSyncPromise = synchronizeGameCatalog().catch((error) => {
      catalogSyncPromise = null;
      throw error;
    });
  }

  await catalogSyncPromise;
}