import express from 'express';
import prisma from '../lib/prisma';

const router = express.Router();

router.post('/store-token', async (req, res) => {
  const {
    id,
    email,
    name,
    isCreator,
    avatarUrl,
    subscriberCount,
    revenue,
    accessToken
  } = req.body;

  try {
    await prisma.authUser.upsert({
      where: { id }, // ✅ Use id because it's guaranteed unique
      update: {
        email,
        name,
        isCreator,
        avatarUrl,
        subscriberCount,
        revenue,
        accessToken
      },
      create: {
        id,
        email,
        name,
        isCreator,
        avatarUrl,
        subscriberCount,
        revenue,
        accessToken
      }
    });

    console.log("User stored/updated successfully");
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error storing token:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    res.status(500).json({ success: false, error: errorMessage });
  }
});

export default router;
