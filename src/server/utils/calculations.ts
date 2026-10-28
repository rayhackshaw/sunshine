import type { DbClient } from "~/server/db";
import type { SunEntryDynamic } from "~/utils/interfaces";
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
  database: DbClient
) => {
  const data = sunlights.reduce((acc, curr) => {
    const key = Object.keys(curr)[0];
    const value = curr[key as string];
    acc[key as string] = value as number;
    return acc;
  }, {} as Record<string, number>);

  await database
    .insert(sunlight)
    .values({ id: 1, ...data } as typeof sunlight.$inferInsert)
    .onConflictDoUpdate({ target: sunlight.id, set: data });
};
