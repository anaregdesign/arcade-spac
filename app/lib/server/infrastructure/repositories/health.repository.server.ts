import { prisma } from "../prisma.server";
import { withDevelopmentFixtures } from "./dev-fixtures.server";

export async function verifyRuntimeDatabaseCompatibility() {
  return withDevelopmentFixtures(
    async () => {
      await prisma.userProfile.findUnique({
        where: { userId: "__healthcheck__" },
        select: { themePreference: true },
      });
      return true;
    },
    () => true,
  );
}
