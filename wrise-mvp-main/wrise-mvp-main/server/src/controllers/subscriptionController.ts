import { Request, Response } from "express";
import prisma from "../lib/prisma";

export const getSubscriptionStatus = async (req: Request, res: Response): Promise<void> => {
  const { creatorId } = req.params;
  const fanId = req.header("x-user-id");

  if (!fanId) {
     res.status(401).json({ error: "Fan ID missing" });
     return
  }

  try {
    const access = await prisma.fanAccess.findUnique({
      where: { fanId_creatorId: { fanId, creatorId } },
    });

    const active =
      !!access &&
      access.status === "active" &&
      (!access.expiresAt || access.expiresAt > new Date());

    if (!active) {
       res.status(402).json({ error: "Payment required" });
       return;
    }

     res.status(200).json({ access: "granted" });
     return;
  } catch (error) {
    console.error("Subscription status error:", error);
     res.status(500).json({ error: "Internal server error" });
     return
  }
};
