import { resolveGameKey, toRouteGameKey, toStoredGameKey } from "../../../domain/entities/game-catalog";
import {
  listUserFavoriteGameKeysFixture,
  toggleUserFavoriteGameFixture,
  withDevelopmentFixtures,
} from "./dev-fixtures.server";
import { ensureCanonicalGameCatalog } from "./game-catalog.repository.server";
import { prisma } from "../prisma.server";

export async function listUserFavoriteGameKeys(userId: string) {
  return withDevelopmentFixtures(
    async () => {
      const favorites = await prisma.userFavorite.findMany({
        where: { userId },
        include: {
          game: {
            select: { key: true },
          },
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      return favorites.map((favorite) => toRouteGameKey(favorite.game.key));
    },
    () => listUserFavoriteGameKeysFixture(userId),
  );
}

export async function toggleUserFavoriteGame(input: { gameKey: string; userId: string }) {
  const canonicalGameKey = resolveGameKey(input.gameKey);

  if (!canonicalGameKey) {
    throw new Response("Game not found", { status: 404 });
  }

  const storedGameKey = toStoredGameKey(canonicalGameKey);

  return withDevelopmentFixtures(
    async () => {
      await ensureCanonicalGameCatalog();

      const game = await prisma.game.findFirst({
        where: { key: storedGameKey },
        select: { id: true, key: true },
      });

      if (!game) {
        throw new Response("Game not found", { status: 404 });
      }

      const existingFavorite = await prisma.userFavorite.findUnique({
        where: {
          userId_gameId: {
            userId: input.userId,
            gameId: game.id,
          },
        },
      });

      if (existingFavorite) {
        await prisma.userFavorite.delete({
          where: {
            userId_gameId: {
              userId: input.userId,
              gameId: game.id,
            },
          },
        });

        return {
          gameKey: toRouteGameKey(game.key),
          isFavorite: false,
        };
      }

      await prisma.userFavorite.create({
        data: {
          userId: input.userId,
          gameId: game.id,
        },
      });

      return {
        gameKey: toRouteGameKey(game.key),
        isFavorite: true,
      };
    },
    () => toggleUserFavoriteGameFixture({
      userId: input.userId,
      gameKey: storedGameKey,
    }),
  );
}