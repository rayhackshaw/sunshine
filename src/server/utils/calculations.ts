import type { db } from "~/server/db";
import type { SunEntryDynamic } from "~/utils/interfaces";
import { eq } from "drizzle-orm";
import { sunlight } from "~/server/db/schema";

export const calculateSunlight = ({
  sunrise,
  sunset,
}: {
  sunrise: number;
  sunset: number;
}) => {
  const value = sunset - sunrise;
  const rounded = Math.ceil(value / 100) * 100;
  return rounded;
};

export const updateSunlightPoints = async (
  sunlights: SunEntryDynamic[],
  database: typeof db
) => {
  const data = sunlights.reduce((acc, curr) => {
    const key = Object.keys(curr)[0];
    const value = curr[key as string];
    acc[key as string] = value as number;
    return acc;
  }, {} as Record<string, number>);

  await database.update(sunlight).set(data).where(eq(sunlight.id, 1));
};
