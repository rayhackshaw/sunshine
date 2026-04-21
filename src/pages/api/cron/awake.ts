import type { NextApiRequest, NextApiResponse } from "next";
import { db } from "~/server/db";
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
    await wakeDatabase(db);

    return res.status(200).json({
      success: true,
      message: "Database queried.",
    });
  } catch (error) {
    console.error("Error waking database:", error);
    res.status(500).json({
      success: false,
      error: "Failed to wake database"
    });
  }
};

export default handler;
