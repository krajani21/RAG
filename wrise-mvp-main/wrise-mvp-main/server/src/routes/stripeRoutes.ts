import express from "express";
import { createCheckoutSession, verifyPaymentStatus, markCreatorAsPaid, stripeWebhookHandler, createFanCheckoutSession } from "../controllers/stripeController";
import { handleStripeOAuthCallback } from "../controllers/stripeOauthController";
import { createAccountLink } from "../controllers/stripeController";


const router = express.Router();

router.get("/verify-payment/:userId", (req, res) => {
    verifyPaymentStatus(req, res);
});
router.post("/mark-paid", async (req, res) => {
  await markCreatorAsPaid(req, res);
});
router.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  stripeWebhookHandler(req, res);
});

router.post("/create-account-link", createAccountLink);
router.post("/create-checkout-session", createCheckoutSession);
router.post("/fan/create-checkout-session", createFanCheckoutSession);
router.get("/oauth/callback", handleStripeOAuthCallback);

export default router;
