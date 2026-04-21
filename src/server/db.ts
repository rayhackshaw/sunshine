import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { env } from "~/env.mjs";
import * as schema from "./db/schema";

const sql = neon(env.POSTGRES_PRISMA_URL);
export const db = drizzle(sql, { schema });
