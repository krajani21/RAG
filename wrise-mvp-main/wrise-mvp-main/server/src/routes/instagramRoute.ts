import express from 'express';
import { scrapeInstagramReelsDynamic } from '../controllers/instagramController';

const router = express.Router();

router.post('/scrape-reels', scrapeInstagramReelsDynamic);

export default router;