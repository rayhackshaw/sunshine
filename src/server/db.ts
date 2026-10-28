import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema";

type D1Binding = Parameters<typeof drizzle>[0];

export const createDb = (binding: D1Binding) =>
  drizzle(binding, { schema });

export type DbClient = ReturnType<typeof createDb>;
