import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/server/db";
import { wakeDatabase } from "~/server/utils/awake";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const authHeader = req.headers.authorization;

  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({ success: false });
  }

  try {
    // wake database if sleeping
    await wakeDatabase(prisma);

    return res.status(200).json({
      message: "Database queried.",
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};

export default handler;
