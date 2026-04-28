import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(["development", "test", "production"]),
    // Database connection strings
    POSTGRES_URL_POOLING: z.string().url(),
    POSTGRES_URL_NON_POOLING: z.string().url(),
    // API Keys and Secrets
    CRON_SECRET: z.string().min(32),
    OPENWEATHERMAP_API_KEY: z.string().min(1),
  },

  client: {
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: z.string().min(1),
  },

  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    POSTGRES_URL_POOLING: process.env.POSTGRES_URL_POOLING,
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
    CRON_SECRET: process.env.CRON_SECRET,
    OPENWEATHERMAP_API_KEY: process.env.OPENWEATHERMAP_API_KEY,
    NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN:
      process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
  },

  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
