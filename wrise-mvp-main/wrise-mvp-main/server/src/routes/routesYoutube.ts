import { Router, Request, Response } from 'express';
import { getUserYoutubeVideos, scrapeFastYouTubeChannel } from '../controllers/youtube';
import prisma from '../lib/prisma';

const router = Router();

router.post('/youtube/scrape', scrapeFastYouTubeChannel);
router.get("/youtube/videos", getUserYoutubeVideos);

export default router;
