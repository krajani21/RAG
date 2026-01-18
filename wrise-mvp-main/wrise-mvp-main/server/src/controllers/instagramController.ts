import { Request, Response } from 'express';
import fs from 'fs';
import { downloadVideo } from '../utils/downloadVideo';
import { fetchInstagramReels, fetchReelCommentsMap, transcribeAudio } from '../services/apifyService';
import { embedTranscriptForUser } from '../lib/embedTranscriptForUser';
import prisma from '../lib/prisma';
import { supabase } from '../services/supabaseService';

export const scrapeInstagramReelsDynamic = async (req: Request, res: Response): Promise<void> => {
  const { username } = req.body;
  const authHeader = req.headers.authorization;

  if (!username || typeof username !== 'string') {
    res.status(400).json({ error: 'Missing or invalid Instagram username.' });
    return;
  }

  if (!authHeader) {
    res.status(401).json({ error: 'Unauthorized: missing token' });
    return;
  }

  const token = authHeader.split(' ')[1];

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    console.error('Error fetching user from Supabase:', error);
    res.status(401).json({ error: 'Invalid token or user not found' });
    return;
  }

  const authUser = await prisma.authUser.findUnique({
    where: { id: user.id },
  });

  if (!authUser) {
    res.status(404).json({ error: 'User not found in database' });
    return;
  }

  const userId = authUser.id;

  try {
    const reels = (await fetchInstagramReels(username, 2)) as Array<{
      url: string;
      videoUrl: string;
      [key: string]: any;
    }>;
    const reelUrls = reels.map((r) => r.url);
    const commentsMap: Record<string, string[]> = await fetchReelCommentsMap(username, reelUrls);

    const reelsWithExtras = [];

    for (const reel of reels) {
      let transcript = '';

      try {
        if (reel.videoUrl) {
          const filePath = await downloadVideo(reel.videoUrl);
          transcript = await transcribeAudio(filePath);
          fs.unlinkSync(filePath);
          console.log(`Transcript for reel ${reel.url}:`, transcript);
        }
      } catch (err) {
        console.warn(`Transcription failed for ${reel.url}:`, err);
      }

      // Save to InstagramReel table
      const savedReel = await prisma.instagramReel.upsert({
        where: { reelUrl: reel.url },
        update: {
          transcript,
          comments: commentsMap[reel.url] || [],
          videoUrl: reel.videoUrl,
          user: { connect: { id: userId } },
        },
        create: {
          userId,
          username,
          videoUrl: reel.videoUrl,
          reelUrl: reel.url,
          transcript,
          comments: commentsMap[reel.url] || [],
        },
      });

      // ✅ Create associated Content record for vector linkage
      const savedContent = await prisma.content.create({
        data: {
          userId,
          sourceType: "instagram",
          transcript,
          videoId: reel.videoUrl,
          title: `Instagram Reel - ${reel.url}`,
          comment: commentsMap[reel.url]?.[0] ?? null,
          createdAt: new Date(),
        },
      });

      // ✅ Embed with correct contentId
      await embedTranscriptForUser({
        transcript: savedReel.transcript ?? "",
        reelUrl: savedReel.reelUrl,
        user: { email: authUser.email },
        sourceType: "instagram",
        contentId: savedContent.contentId,
      });

      reelsWithExtras.push(savedReel);
    }

    res.status(200).json({ message: 'Reels scraped and saved.', reels: reelsWithExtras });
  } catch (error) {
    console.error('Scraper error:', error);
    res.status(500).json({ error: 'Failed to scrape and save Instagram Reels.' });
  }
};
