import express from "express";
import { getSubscriptionStatus } from "../controllers/subscriptionController";

const router = express.Router();

// GET /api/subscription/status/:creatorId
router.get("/subscription/status/:creatorId", getSubscriptionStatus);

export default router;
