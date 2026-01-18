import { Router } from "express";
import { askHandler } from "../controllers/askController";

const router = Router();

router.post("/ask", askHandler);

export default router;
