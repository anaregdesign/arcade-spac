import { defineConfig } from "prisma/config";

const DEFAULT_DEV_DATABASE_URL = "sqlserver://localhost:1433;database=arcade;user=sa;password=Passw0rd!;encrypt=false;trustServerCertificate=true";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env.DATABASE_URL ?? DEFAULT_DEV_DATABASE_URL,
  },
});
