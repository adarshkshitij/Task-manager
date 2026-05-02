import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  pool?: Pool;
  prisma?: PrismaClient;
};

function makePrisma(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set.");
  }

  const pool =
    globalForPrisma.pool ??
    new Pool({ connectionString });

  const adapter = new PrismaPg(pool);

  const client = new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
    globalForPrisma.prisma = client;
  }

  return client;
}

// Lazy singleton — only connects when first property is accessed,
// so Next.js build-time page collection won't crash.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = globalForPrisma.prisma ?? makePrisma();
    globalForPrisma.prisma = client;
    return (client as unknown as Record<string | symbol, unknown>)[prop];
  },
});
