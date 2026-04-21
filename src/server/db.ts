import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { Pool } from "@neondatabase/serverless";
import { env } from "~/env.mjs";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const createPrismaClient = () => {
  // Use Neon serverless adapter for Cloudflare Workers compatibility
  // Create a Pool instance and pass it to the PrismaNeon adapter
  const pool = new Pool({ connectionString: env.POSTGRES_PRISMA_URL });
  const adapter = new PrismaNeon(pool);

  return new PrismaClient({
    adapter,
    log: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
