import { prisma } from "../prisma.server";
import { withDevelopmentFixtures } from "./dev-fixtures.server";

export async function verifyRuntimeDatabaseCompatibility() {
  return withDevelopmentFixtures(
    async () => {
      await Promise.all([
        prisma.userProfile.findUnique({
          where: { userId: "__healthcheck__" },
          select: { themePreference: true },
        }),
        prisma.userFeedbackLog.findFirst({
          select: { id: true },
        }),
      ]);
      return true;
    },
    () => true,
  );
}
