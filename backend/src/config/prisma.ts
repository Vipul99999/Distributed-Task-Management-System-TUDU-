import { PrismaClient } from "@prisma/client";
import { env } from "./env";

declare global {
  // Prevent multiple Prisma instances in development
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prismaClient =
  globalThis.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalThis.prisma = prismaClient;
}

export const prisma = prismaClient;