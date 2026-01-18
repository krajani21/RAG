import { Request, Response } from "express";
import { queryOpenAI } from "../services/supabaseService";

export const askHandler = async (req: Request, res: Response):Promise<void> => {
  const { question } = req.body;

  if (!question || question.trim().length < 3) {
    res.status(400).json({ error: "Invalid question" });
    return;
  }

  try {
    const answer = await queryOpenAI(req.body.question);
    res.status(200).json({ answer });
    return;
  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ error: "OpenAI failed to respond." });
    return;
  }
};