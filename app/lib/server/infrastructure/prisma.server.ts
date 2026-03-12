import { PrismaMssql } from "@prisma/adapter-mssql";
import { getRuntimeConfig } from "./config/runtime-config.server";
import { PrismaClient } from "./generated/prisma/client";

declare global {
  var __arcadePrisma__: PrismaClient | undefined;
}

function createPrismaClient() {
  const config = getRuntimeConfig();

  return new PrismaClient({
    adapter: new PrismaMssql(config.databaseUrl),
  });
}

export const prisma = globalThis.__arcadePrisma__ ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__arcadePrisma__ = prisma;
}