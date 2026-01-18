import { Request, Response } from "express";
import axios from "axios";
import prisma from "../lib/prisma";

export const handleStripeOAuthCallback = async (req: Request, res: Response): Promise<void> => {
  const { code, state } = req.query; // state = userId

  if (!code || !state) {
     res.status(400).send("Missing code or state");
     return;
  }

  try {
    const response = await axios.post("https://connect.stripe.com/oauth/token", null, {
      params: {
        grant_type: "authorization_code",
        client_secret: process.env.STRIPE_SECRET_KEY!,
        code,
      },
    });

    const stripeAccountId = response.data.stripe_user_id;
    const userId = state as string;

    await prisma.creatorBilling.upsert({
      where: { userId },
      update: { stripeCustomerId: stripeAccountId },
      create: { userId, stripeCustomerId: stripeAccountId },
    });

    return res.redirect("http://localhost:8080/"); // you can change this
  } catch (err) {
    if (typeof err === "object" && err !== null && "response" in err && typeof (err as any).response === "object" && (err as any).response !== null && "data" in (err as any).response) {
      console.error("Stripe OAuth Error:", (err as any).response.data);
    } else if (typeof err === "object" && err !== null && "message" in err) {
      console.error("Stripe OAuth Error:", (err as any).message);
    } else {
      console.error("Stripe OAuth Error:", err);
    }
     res.status(500).send("Failed to connect Stripe account");
     return;
  }
};