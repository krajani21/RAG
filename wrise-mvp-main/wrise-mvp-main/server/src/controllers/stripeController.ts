// controllers/stripeController.ts
import { Request, Response } from "express";
import Stripe from "stripe";
import prisma from "../lib/prisma";
import { error } from "console";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

const priceMap: Record<string, Record<string, number>> = {
  monthly: {
    Growth: 2900,
    Pro: 7900,
  },
  yearly: {
    Growth: 29000,
    Pro: 79000,
  },
};

export const createCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  const { plan, tier } = req.body;

  if (!plan || !tier) {
    res.status(400).json({ error: "Missing plan or tier" });
    return;
  }

  const price = priceMap[tier]?.[plan];
  if (!price) {
    res.status(400).json({ error: "Invalid pricing selection" });
    return;
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: price,
            product_data: {
              name: `${plan} Plan (${tier})`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `http://localhost:8080/payment-callback`,
      metadata: {
    userId: req.body.userId,
    plan: req.body.plan,
    tier: req.body.tier,
  },
});


    res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe error:", error);
    res.status(500).json({ error: "Failed to create Stripe session" });
  }
};

export const createFanCheckoutSession = async (req: Request, res: Response): Promise<void> => {
  const { fanId, creatorId, amountCents, accessType } = req.body as {
    fanId: string;
    creatorId: string;
    amountCents: number;
    accessType?: "one_time" | "subscription";
  };

  if (!fanId || !creatorId || !amountCents) {
    res.status(400).json({ error: "Missing fanId, creatorId or amountCents" });
    return;
  }

  const creator = await prisma.creatorBilling.findUnique({ where: { userId: creatorId } });
  if (!creator?.stripeCustomerId) {
    res.status(400).json({ error: "Creator has not connected Stripe" });
    return;
  }

  const isSubscription = accessType === "subscription";
  const applicationFee = Math.round(amountCents * 0.2); // 20%

  try {
    const session = await stripe.checkout.sessions.create({
      mode: isSubscription ? "subscription" : "payment",
      payment_method_types: ["card"],
      line_items: [
        isSubscription
          ? {
              price_data: {
                currency: "usd",
                recurring: { interval: "month" },
                unit_amount: amountCents,
                product_data: { name: "Chat Access Subscription" },
              },
              quantity: 1,
            }
          : {
              price_data: {
                currency: "usd",
                unit_amount: amountCents,
                product_data: { name: "Chat Access" },
              },
              quantity: 1,
            },
      ],
      success_url: `http://localhost:8080/success?creatorId=${creatorId}`,
      cancel_url: `http://localhost:8080/hub/${creatorId}`,
      payment_intent_data: !isSubscription
        ? {
            application_fee_amount: applicationFee,
            transfer_data: { destination: creator.stripeCustomerId },
          }
        : undefined,
      subscription_data: isSubscription
        ? {
            transfer_data: { destination: creator.stripeCustomerId },
            application_fee_percent: 20,
          }
        : undefined,
      metadata: {
        type: "fan_access",
        fanId,
        creatorId,
        accessType: isSubscription ? "subscription" : "one_time",
      },
    });

    res.status(200).json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Failed to create fan checkout session" });
  }
};
export const verifyPaymentStatus = async (req: Request, res: Response) => {
  const userId = req.params.userId;

  if (!userId) return res.status(400).json({ paid: false });

  try {
    const billing = await prisma.creatorBilling.findUnique({
      where: { userId },
    });

    if (!billing || !billing.hasPaid) {
      return res.status(200).json({ paid: false });
    }

    return res.status(200).json({ paid: true });
  } catch (err) {
    console.error("Payment verification error:", err);
    return res.status(500).json({ paid: false });
  }
};

export const markCreatorAsPaid = async (req: Request, res: Response) => {
  const { userId, plan, tier } = req.body;

  if (!userId || !plan || !tier) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const existing = await prisma.creatorBilling.findUnique({ where: { userId } });

    if (existing) {
      await prisma.creatorBilling.update({
        where: { userId },
        data: { hasPaid: true, plan, tier },
      });
    } else {
      await prisma.creatorBilling.create({
        data: {
          userId,
          hasPaid: true,
          plan,
          tier,
        },
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Failed to mark creator as paid:", err);
    return res.status(500).json({ error: "Failed to update billing" });
  }
};

export const createAccountLink = async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.body;

  if (!userId) {
    res.status(400).json({ error: "Missing userId" });
    return;
  }

  try {
    // 1. Check if creator already has an account
    let creator = await prisma.creatorBilling.findUnique({ where: { userId } });

    let accountId = creator?.stripeCustomerId;

    // 2. Create a new Express account if none exists
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
      });

      accountId = account.id;

      // Store it in Supabase via Prisma
      if (creator) {
        await prisma.creatorBilling.update({
          where: { userId },
          data: { stripeCustomerId: accountId },
        });
      } else {
        await prisma.creatorBilling.create({
          data: {
            userId,
            stripeCustomerId: accountId,
            hasPaid: false,
            plan: "",
            tier: "",
          },
        });
      }
    }

    // 3. Create an account onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: "http://localhost:8080/pricing", // redirect if canceled
      return_url: "http://localhost:8080/",   
      type: "account_onboarding",
    });

    res.status(200).json({ url: accountLink.url });
  } catch (err) {
    console.error("Failed to create account link:", err);
    res.status(500).json({ error: "Failed to create Stripe account link" });
  }
};

export const stripeWebhookHandler = async (req: Request, res: Response) => {
  console.log("Stripe webhook received");

  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig!, webhookSecret);
    console.log("Webhook signature verified:", event.type);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata;

    console.log("Session metadata:", metadata);
    console.log("Session id:", session.id);
    console.log("Payment intent id:", session.payment_intent);
    console.log("Amount total:", session.amount_total);
    console.log("Currency:", session.currency);

    if (!metadata?.userId && !metadata?.fanId) {
      console.error("Missing userId or fanId in metadata:", metadata);
      return res.status(400).send("Missing metadata userId or fanId");
    }

    try {
      if (metadata?.userId && metadata?.plan && metadata?.tier) {
        console.log("Updating creatorBilling for userId:", metadata.userId);
        const existing = await prisma.creatorBilling.findUnique({
          where: { userId: metadata.userId },
        });
        if (existing) {
          await prisma.creatorBilling.update({
            where: { userId: metadata.userId },
            data: { hasPaid: true, plan: metadata.plan, tier: metadata.tier },
          });
        } else {
          await prisma.creatorBilling.create({
            data: { userId: metadata.userId, hasPaid: true, plan: metadata.plan, tier: metadata.tier },
          });
        }
        console.log("Creator plan payment recorded for:", metadata.userId);
      }

      if (metadata?.type === "fan_access" && metadata.fanId && metadata.creatorId) {
        const amountCents = session.amount_total || 0;
        const paymentIntentId = (session.payment_intent as string) || undefined;
        const isSubscription = metadata.accessType === "subscription";
        const expiresAt = isSubscription ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null;

        console.log("Upserting fan access for fanId:", metadata.fanId, "creatorId:", metadata.creatorId);
        await prisma.fanAccess.upsert({
          where: { fanId_creatorId: { fanId: metadata.fanId, creatorId: metadata.creatorId } },
          update: {
            status: "active",
            expiresAt,
            checkoutSessionId: session.id,
            paymentIntentId,
            amountCents,
          },
          create: {
            fanId: metadata.fanId,
            creatorId: metadata.creatorId,
            status: "active",
            accessType: isSubscription ? "subscription" : "one_time",
            expiresAt,
            checkoutSessionId: session.id,
            paymentIntentId,
            amountCents,
            currency: session.currency || "usd",
          },
        });
        console.log("Fan access granted:", metadata.fanId, "->", metadata.creatorId);
      }
    } catch (err) {
      console.error("Failed to update payment info in DB:", err);
      return res.status(500).send("DB update failed");
    }
  }

  res.json({ received: true });
};


// export const stripeWebhookHandler = async (req: Request, res: Response) => {
//   console.log("Stripe webhook received");
//   const sig = req.headers["stripe-signature"];
//   const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

//   let event: Stripe.Event;

//   try {
//     event = stripe.webhooks.constructEvent(req.body, sig!, webhookSecret);
//     console.log("Webhook signature verified:", event.type);
//   } catch (err: any) {
//     console.error("Webhook signature verification failed:", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   if (event.type === "checkout.session.completed") {
//     const session = event.data.object as Stripe.Checkout.Session;
//     const metadata = session.metadata;

//     console.log("Session metadata:", metadata);

//     if (!metadata?.userId || !metadata?.plan || !metadata?.tier) {
//       console.error("Missing metadata:", metadata);
//       return res.status(400).send("Missing metadata");
//     }

//     try {
//       // Existing admin/creator plan purchase flow
//       if (metadata?.userId && metadata?.plan && metadata?.tier) {
//         const existing = await prisma.creatorBilling.findUnique({
//           where: { userId: metadata.userId },
//         });
//         if (existing) {
//           await prisma.creatorBilling.update({
//             where: { userId: metadata.userId },
//             data: { hasPaid: true, plan: metadata.plan, tier: metadata.tier },
//           });
//         } else {
//           await prisma.creatorBilling.create({
//             data: { userId: metadata.userId, hasPaid: true, plan: metadata.plan, tier: metadata.tier },
//           });
//         }
//         console.log("Creator plan payment recorded for:", metadata.userId);
//       }

//       // Fan access flow
//       if (metadata?.type === "fan_access" && metadata.fanId && metadata.creatorId) {
//         const amountCents = session.amount_total || 0;
//         const paymentIntentId = (session.payment_intent as string) || undefined;
//         const isSubscription = metadata.accessType === "subscription";
//         const expiresAt = isSubscription ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null;

//         await prisma.fanAccess.upsert({
//           where: { fanId_creatorId: { fanId: metadata.fanId, creatorId: metadata.creatorId } },
//           update: {
//             status: "active",
//             expiresAt,
//             checkoutSessionId: session.id,
//             paymentIntentId,
//             amountCents,
//           },
//           create: {
//             fanId: metadata.fanId,
//             creatorId: metadata.creatorId,
//             status: "active",
//             accessType: isSubscription ? "subscription" : "one_time",
//             expiresAt,
//             checkoutSessionId: session.id,
//             paymentIntentId,
//             amountCents,
//             currency: session.currency || "usd",
//           },
//         });
//         console.log("Fan access granted:", metadata.fanId, "->", metadata.creatorId);
//       }
//     } catch (err) {
//       console.error("Failed to update payment info:", err);
//       return res.status(500).send("DB update failed");
//     }
//   }

//   res.json({ received: true });
// };
