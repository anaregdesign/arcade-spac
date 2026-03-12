import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

import { getRuntimeConfig } from "./config/runtime-config.server";
import { PrismaClient } from "./generated/prisma/client";

declare global {
  var __arcadePrisma__: PrismaClient | undefined;
}

function createPrismaClient() {
  const config = getRuntimeConfig();
  const sqlitePath = config.databaseUrl.replace("file:", "");
  const adapter = new PrismaBetterSqlite3({ url: sqlitePath });

  return new PrismaClient({ adapter });
}

export const prisma = globalThis.__arcadePrisma__ ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__arcadePrisma__ = prisma;
}