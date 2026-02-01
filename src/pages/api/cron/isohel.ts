import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import {
  calculateSunlight,
  updateSunlightPoints,
} from "~/server/utils/calculations";
import { locationNames } from "~/utils/cities";
import type { City, CityWithUrl, SunEntryDynamic } from "~/utils/interfaces";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const authHeader = req.headers.authorization;

  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({ success: false });
  }

  try {
    const cityResponses: CityWithUrl[] = [];
    locationNames.forEach((city) => {
      const queryCity =
        city === "LosAngeles"
          ? "Los%20Angeles"
          : city === "CapeTown"
          ? "Cape%20Town"
          : city;

      cityResponses.push({
        city,
        url: `https://api.openweathermap.org/data/2.5/weather?q=${queryCity}&appid=20c8317a75161fafee1718a9ffd5f7b2&units=metric`,
      });
    });

    const allResponsesWithData: City[] = (await Promise.all(
      cityResponses.map(async (x) => {
        return (await fetch(x.url)).json();
      })
    )) as City[];

    const sunlights: SunEntryDynamic[] = [];

    allResponsesWithData.forEach((city) => {
      const sunlight = calculateSunlight({
        sunrise: city.sys.sunrise,
        sunset: city.sys.sunset,
      });
      const name = city.name.replace(" ", "").toLowerCase();
      sunlights.push({
        [name]: sunlight,
      });
    });

    await updateSunlightPoints(sunlights, prisma);

    return res.status(200).json({
      sunlights: sunlights,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};

export default handler;
