// server/src/controllers/chatController.ts
import type { Request, Response, NextFunction } from "express";
import { runRAG } from "../lib/ragChain";

const chatHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.method === "GET") {
      // Public fan hub page (just show link/info)
      const { creatorId } = req.params;

      if (!creatorId) {
        res.status(400).json({ error: "Missing creatorId in URL" });
        return;
      }

      res.status(200).json({
        message: `Public chat page for creator ${creatorId}`,
      });
      return;
    }

    if (req.method === "POST") {
      const { question, creatorId } = req.body;

      if (!question || !creatorId) {
        res.status(400).json({ error: "Missing question or creatorId" });
        return;
      }

      const response = await runRAG({
        question,
        creatorId,
        k: 5,
      });

      res.status(200).json(response);
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("❌ Chat error:", error);
    res.status(500).json({ error: "Chat processing failed" });
  }
};

export default chatHandler;
