import type { db } from "~/server/db";
import { eq } from "drizzle-orm";
import { sunlight } from "~/server/db/schema";

export const wakeDatabase = async (database: typeof db) => {
  try {
    await database.select().from(sunlight).where(eq(sunlight.id, 1)).limit(1);
  } catch (e) {
    console.log(e);
  }
};
