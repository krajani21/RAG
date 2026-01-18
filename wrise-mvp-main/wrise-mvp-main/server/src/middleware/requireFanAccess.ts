import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";

export default async function requireFanAccess(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const fanId = req.header("x-user-id");
  // const { creatorId } = req.body as { creatorId?: string };
  const creatorId = (req.body as { creatorId?: string })?.creatorId || req.params.creatorId;
  
  if (!fanId || !creatorId) {
    res.status(400).json({ error: "Missing x-user-id header or creatorId" });
    return;
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
  } catch (e) {
    res.status(500).json({ error: "Access check failed" });
    return;
  }

  next();
}

