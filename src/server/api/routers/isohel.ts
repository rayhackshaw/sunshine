import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { z } from "zod";
import { type inferProcedureOutput } from "@trpc/server";
import { locationNames } from "~/utils/cities";

type RouterType = typeof isohelRouter;

export type GetAllDataOutput = NonNullable<
  inferProcedureOutput<RouterType["getAllData"]>
>;

const validCityNames = locationNames.map((name) => name.toLowerCase());

const cityNameSchema = z.enum(validCityNames as [string, ...string[]]);

export const isohelRouter = createTRPCRouter({
  getAllData: publicProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.sunlight.findUnique({
      where: {
        id: 1,
      },
    });
  }),
  updatePoints: protectedProcedure
    .input(
      z.object({
        newPoints: z.object({
          sunlights: z.array(
            z.record(cityNameSchema, z.number().int().nonnegative())
          ),
        }),
      })
    )
    .mutation(
      async ({
        input,
        ctx,
      }): Promise<{ success: boolean; updated: number }> => {
        const updateData: Record<string, number> = {};

        const sunlights = input.newPoints.sunlights;
        for (const cityEntry of sunlights) {
          const entries = Object.entries(cityEntry);
          for (const [cityName, sunlightValue] of entries) {
            if (validCityNames.includes(cityName)) {
              updateData[cityName] = sunlightValue;
            }
          }
        }

        await ctx.prisma.sunlight.update({
          where: {
            id: 1,
          },
          data: updateData,
        });

        return { success: true, updated: Object.keys(updateData).length };
      }
    ),
});
