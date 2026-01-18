// src/services/apifyService.ts
import { ApifyClient } from 'apify-client';
import { OpenAI } from 'openai';
import fs from 'fs';

const client = new ApifyClient({ token: process.env.INSTAGRAM_API_TOKEN });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function fetchInstagramReels(username: string, resultsLimit = 2) {
  const input = { username: [username], resultsLimit };

  const run = await client.actor('apify/instagram-reel-scraper').call(input);
  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  return items.filter((post: any) => post.type === 'Video' && post.videoDuration < 90);
}


export async function fetchReelCommentsMap(username: string, reelUrls: string[]) {
  const input = {
    usernames: [username],
    resultsType: 'posts',
    scrapePosts: true,
    scrapeComments: true,
    resultsLimit: 2,
  };

  const run = await client.actor('apify/instagram-scraper').call(input);
  const { items } = await client.dataset(run.defaultDatasetId).listItems();

  // Build a map of reel URL -> comments
  const commentMap: Record<string, string[]> = {};

  for (const item of items) {
    if (
      typeof item.url === 'string' &&
      reelUrls.includes(item.url) &&
      Array.isArray(item.latestComments)
    ) {
      commentMap[item.url] = item.latestComments.map((c: any) => c.text);
    }
  }

  return commentMap;
}

export async function transcribeAudio(filePath: string): Promise<string> {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: 'whisper-1',
    language: 'en',
  });

  return transcription.text;
}
