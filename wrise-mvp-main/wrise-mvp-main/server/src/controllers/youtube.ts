// src/controllers/youtube.ts
import { Request, Response } from 'express';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { OpenAI } from 'openai';
import prisma from '../lib/prisma';

import { ApifyClient } from 'apify-client';
import ffmpegBinary from 'ffmpeg-static';
import ffmpeg from 'fluent-ffmpeg';
import fetch, { RequestInfo } from 'node-fetch';
import { getUserFromToken } from '../services/supabaseService';

dotenv.config();

// ———————————————————————————————————————————————————————
// Config
// ———————————————————————————————————————————————————————
const TEMP_DIR = process.env.TEMP_DIR || os.tmpdir();
const MAX_WHISPER_MB = 25;
const TARGET_BITRATE_K = Number(process.env.YT_AUDIO_KBPS || 32);
const FALLBACK_BITRATE_K = 16;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Use the proper Apify token env var (fallback to old name if present)
const apify = new ApifyClient({
  token:
    process.env.INSTAGRAM_API_TOKEN!, // last-resort fallback
});

// Ensure ffmpeg binary is set (needed on serverless)
if (!ffmpegBinary) {
  console.warn('[youtube] ffmpeg-static path not found; fluent-ffmpeg may fail at runtime.');
} else {
  ffmpeg.setFfmpegPath(ffmpegBinary);
}

// ———————————————————————————————————————————————————————
// Utilities
// ———————————————————————————————————————————————————————
function safeJoinTemp(filename: string) {
  return path.join(TEMP_DIR, filename);
}

function fileSizeMB(p: string) {
  try {
    return fs.statSync(p).size / (1024 * 1024);
  } catch {
    return 0;
  }
}

async function ensureSmallEnoughOrReencode(
  inputPath: string,
  targetKbps: number,
  fallbackKbps: number
): Promise<string> {
  if (fileSizeMB(inputPath) <= MAX_WHISPER_MB) return inputPath;

  const reencoded = inputPath.replace(/\.mp3$/i, `.re${targetKbps}k.mp3`);
  await new Promise<void>((resolve, reject) => {
    ffmpeg(inputPath)
      .audioChannels(1)
      .audioBitrate(targetKbps)
      .audioFrequency(16000)
      .format('mp3')
      .output(reencoded)
      .on('end', () => resolve())
      .on('error', reject)
      .run();
  });

  if (fileSizeMB(reencoded) <= MAX_WHISPER_MB) {
    try { fs.unlinkSync(inputPath); } catch {}
    return reencoded;
  }

  const reencoded2 = inputPath.replace(/\.mp3$/i, `.re${fallbackKbps}k.mp3`);
  await new Promise<void>((resolve, reject) => {
    ffmpeg(reencoded)
      .audioChannels(1)
      .audioBitrate(fallbackKbps)
      .audioFrequency(16000)
      .format('mp3')
      .output(reencoded2)
      .on('end', () => resolve())
      .on('error', reject)
      .run();
  });

  try { fs.unlinkSync(reencoded); } catch {}
  if (fileSizeMB(reencoded2) > MAX_WHISPER_MB) {
    throw new Error(`Audio still exceeds ${MAX_WHISPER_MB}MB after re-encoding.`);
  }
  try { fs.unlinkSync(inputPath); } catch {}
  return reencoded2;
}

// ———————————————————————————————————————————————————————
// Apify audio downloader
// ———————————————————————————————————————————————————————
async function downloadAudioWithApify(videoUrl: string, baseName: string): Promise<string> {
  const run = await apify.actor("bytepulselabs/youtube-video-downloader").call({
    urls: [videoUrl],   // ✅ use `urls` instead of `startUrls`
  });

  const { items } = await apify.dataset(run.defaultDatasetId).listItems();
  if (!items?.length) throw new Error(`No downloadable items for ${videoUrl}`);

  const audioUrl =
    (items[0]?.audio && typeof items[0].audio === 'object' && 'url' in items[0].audio ? (items[0].audio as { url?: string }).url : undefined) ||
    items[0]?.downloadUrl ||
    items[0]?.url; // fallback just in case

  if (!audioUrl) throw new Error(`No audio URL found for ${videoUrl}`);

  const outPath = safeJoinTemp(`${baseName}.mp3`);
  const response = await fetch(audioUrl as RequestInfo);
  if (!response.ok || !response.body) {
    throw new Error(`Failed to fetch audio from ${audioUrl}`);
  }

  const fileStream = fs.createWriteStream(outPath);
  await new Promise<void>((resolve, reject) => {
    response.body.pipe(fileStream);
    response.body.on("error", reject);
    fileStream.on("finish", resolve);
  });

  return outPath;
}


// ———————————————————————————————————————————————————————
// Whisper transcription
// ———————————————————————————————————————————————————————
async function transcribeWithWhisper(filePath: string): Promise<string | null> {
  try {
    const mb = fileSizeMB(filePath);
    if (mb > MAX_WHISPER_MB) {
      throw new Error(`File ${mb.toFixed(2)}MB exceeds Whisper limit ${MAX_WHISPER_MB}MB`);
    }

    const resp = await openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-1',
    });

    return (resp as any).text?.trim() || null;
  } catch (err) {
    console.error('[youtube] Whisper transcription failed:', err);
    return null;
  }
}

// ———————————————————————————————————————————————————————
// Controllers
// ———————————————————————————————————————————————————————
export const scrapeFastYouTubeChannel = async (req: Request, res: Response): Promise<void> => {
  const { channel, accessToken } = req.body;

  if (!accessToken) {
    res.status(401).json({ error: 'Missing access token' });
    return;
  }

  const user = await prisma.authUser.findFirst({ where: { accessToken } });
  if (!user) {
    res.status(401).json({ error: 'Invalid access token or user not found' });
    return;
  }

  if (!channel || !channel.startsWith('https://www.youtube.com/')) {
    res.status(400).json({ error: 'Valid YouTube channel URL required' });
    return;
  }

  try {
    // 1) Discover videos via Apify (metadata only)
    const run = await apify.actor('streamers/youtube-channel-scraper').call({
      startUrls: [{ url: channel }],
      maxResults: Number(process.env.YT_MAX_RESULTS || 1),
      maxResultsShorts: 0,
      maxResultStreams: 0,
    });

    const { items } = await apify.dataset(run.defaultDatasetId).listItems();
    const videoItems = (items || []).filter(
      (v: any) => typeof v?.url === 'string' && (v.url.includes('watch?v=') || v.url.includes('shorts/'))
    );

    // 2) For each video: comments, audio+transcription, persist
    const savedItems = await Promise.all(
      videoItems.map(async (video: any, idx: number) => {
        const videoUrl: string = video.url;
        const title: string = video.title || 'Untitled';
        const publishedAt: string | undefined = video.publishedAt;

        // Optional: comments
        let comments: string[] = [];
        try {
          const maxComments = Number(process.env.YT_MAX_COMMENTS || 5);
          if (maxComments > 0) {
            const commentRun = await apify.actor('streamers/youtube-comments-scraper').call({
              startUrls: [{ url: videoUrl }],
              maxComments,
            });
            const { items: commentItems } = await apify.dataset(commentRun.defaultDatasetId).listItems();
            comments = (commentItems || [])
              .map((c: any) => c?.text || c?.comment || '')
              .filter(Boolean)
              .slice(0, maxComments);
          }
        } catch (err) {
          console.warn(`[youtube] Comments fetch failed for ${videoUrl}`, err);
        }

        let transcript: string | null = null;
        const baseName = `yt_${Date.now()}_${idx}`;
        let audioPath: string | null = null;

        try {
          audioPath = await downloadAudioWithApify(videoUrl, baseName);
          audioPath = await ensureSmallEnoughOrReencode(audioPath, TARGET_BITRATE_K, FALLBACK_BITRATE_K);
          transcript = await transcribeWithWhisper(audioPath);
        } catch (err) {
          console.warn(`[youtube] Audio/Whisper failed for ${videoUrl}:`, err);
        } finally {
          if (audioPath) {
            try { fs.unlinkSync(audioPath); } catch {}
          }
        }

        const thumbnail: string | null = video.thumbnails?.[0]?.url || video.thumbnailUrl || null;

        try {
          return await prisma.scrapedVideo.upsert({
            where: { videoUrl },
            update: {
              title,
              thumbnail,
              publishedAt: publishedAt ? new Date(publishedAt) : undefined,
              transcript: transcript ?? '',
              comments,
              user: { connect: { id: user.id } },
            },
            create: {
              title,
              videoUrl,
              thumbnail,
              publishedAt: publishedAt ? new Date(publishedAt) : undefined,
              transcript: transcript ?? '',
              comments,
              user: { connect: { id: user.id } },
            },
          });
        } catch (err) {
          console.error(`[youtube] DB save failed for ${videoUrl}:`, err);
          return {
            id: null,
            title,
            videoUrl,
            thumbnail,
            publishedAt: publishedAt ? new Date(publishedAt) : null,
            transcript: transcript ?? '',
            comments,
            userId: user.id,
          };
        }
      })
    );

    res.json({ items: savedItems });
  } catch (err) {
    console.error('[youtube] scrapeFastYouTubeChannel error:', err);
    res.status(500).json({ error: 'scraper failed' });
  }
};

export const getUserYoutubeVideos = async (req: Request, res: Response): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "Missing Authorization header" });
    return;
  }

  const token = authHeader.replace("Bearer ", "");
  const user = await getUserFromToken(token);

  if (!user) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  try {
    const videos = await prisma.scrapedVideo.findMany({
      where: { userId: user.id },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
    });
    res.json({ items: videos });
  } catch (err) {
    console.error("[youtube] Failed to fetch videos", err);
    res.status(500).json({ error: "Failed to fetch videos" });
  }
};



// // src/controllers/youtube.ts
// import { Request, Response } from 'express';
// import dotenv from 'dotenv';
// import fs from 'fs';
// import path from 'path';
// import os from 'os';
// import { promisify } from 'util';
// import { pipeline as nodePipeline } from 'stream';
// import { OpenAI } from 'openai';
// import prisma from '../lib/prisma';

// import { ApifyClient } from 'apify-client'; // only for listing videos & comments
// import ytdl from 'ytdl-core';
// import ffmpegPath from 'ffmpeg-static';
// import ffmpeg from 'fluent-ffmpeg';

// dotenv.config();

// const pipeline = promisify(nodePipeline);

// // ———————————————————————————————————————————————————————
// // Config
// // ———————————————————————————————————————————————————————
// const TEMP_DIR = process.env.TEMP_DIR || os.tmpdir(); // works on Vercel/Render
// const MAX_WHISPER_MB = 25; // Whisper upload hard limit
// const TARGET_BITRATE_K = Number(process.env.YT_AUDIO_KBPS || 32); // keep small
// const FALLBACK_BITRATE_K = 16; // if still > 25MB, try again smaller

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// // Only used for discovering latest video + comments (not for downloading)
// const apify = new ApifyClient({
//   token: process.env.INSTAGRAM_API_TOKEN!, // reuse your existing env var
// });

// // Ensure ffmpeg binary is set (needed on serverless)
// ffmpeg.setFfmpegPath(ffmpegPath!);

// // ———————————————————————————————————————————————————————
// // Utilities
// // ———————————————————————————————————————————————————————
// function safeJoinTemp(filename: string) {
//   return path.join(TEMP_DIR, filename);
// }

// function fileSizeMB(p: string) {
//   try {
//     const s = fs.statSync(p).size;
//     return s / (1024 * 1024);
//   } catch {
//     return 0;
//   }
// }

// async function ensureSmallEnoughOrReencode(
//   inputPath: string,
//   targetKbps: number,
//   fallbackKbps: number
// ): Promise<string> {
//   if (fileSizeMB(inputPath) <= MAX_WHISPER_MB) return inputPath;

//   const reencoded = inputPath.replace(/\.mp3$/i, `.re${targetKbps}k.mp3`);
//   await new Promise<void>((resolve, reject) => {
//     ffmpeg(inputPath)
//       .audioChannels(1)
//       .audioBitrate(targetKbps)
//       .audioFrequency(16000)
//       .format('mp3')
//       .output(reencoded)
//       .on('end', () => resolve())
//       .on('error', reject)
//       .run();
//   });

//   if (fileSizeMB(reencoded) <= MAX_WHISPER_MB) {
//     try { fs.unlinkSync(inputPath); } catch {}
//     return reencoded;
//   }

//   const reencoded2 = inputPath.replace(/\.mp3$/i, `.re${fallbackKbps}k.mp3`);
//   await new Promise<void>((resolve, reject) => {
//     ffmpeg(reencoded)
//       .audioChannels(1)
//       .audioBitrate(fallbackKbps)
//       .audioFrequency(16000)
//       .format('mp3')
//       .output(reencoded2)
//       .on('end', () => resolve())
//       .on('error', reject)
//       .run();
//   });

//   try { fs.unlinkSync(reencoded); } catch {}
//   if (fileSizeMB(reencoded2) > MAX_WHISPER_MB) {
//     throw new Error(`Audio still exceeds ${MAX_WHISPER_MB}MB after re-encoding.`);
//   }
//   try { fs.unlinkSync(inputPath); } catch {}
//   return reencoded2;
// }

// // --- YouTube download hardening ---------------------------------------------

// // Realistic headers help some CDNs accept the request
// const YT_REQUEST_HEADERS = {
//   'user-agent':
//     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
//   'accept-language': 'en-US,en;q=0.9',
//   // If you still see 410/403 on some videos (age/region), add a cookie string:
//   // 'cookie': process.env.YT_COOKIE || ''
// };

// // Normalize shorts → watch URL (ytdl works better with watch)
// function normalizeYouTubeUrl(url: string) {
//   try {
//     const u = new URL(url);
//     if (u.pathname.startsWith('/shorts/')) {
//       const id = u.pathname.split('/shorts/')[1]?.split('?')[0];
//       if (id) return `https://www.youtube.com/watch?v=${id}`;
//     }
//   } catch {}
//   return url;
// }

// // Simple retry wrapper for transient CDN errors
// async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
//   let lastErr: any;
//   for (let i = 0; i <= retries; i++) {
//     try {
//       return await fn();
//     } catch (e: any) {
//       const code = e?.statusCode || e?.inputStreamError?.statusCode;
//       if (code !== 410 && code !== 403) throw e;
//       lastErr = e;
//       // backoff 0.8s, then 1.3s, etc.
//       await new Promise(r => setTimeout(r, 800 + i * 500));
//     }
//   }
//   throw lastErr;
// }


// // Downloads audio stream with ytdl-core, transcodes to low‑bitrate mono MP3
// // Downloads audio with ytdl-core (itag 140 preferred), pipes through ffmpeg → MP3
// async function downloadAudioAsMp3(
//   rawVideoUrl: string,
//   baseName: string,
//   kbps: number
// ): Promise<string> {
//   const videoUrl = normalizeYouTubeUrl(rawVideoUrl);
//   const tmpOut = safeJoinTemp(`${baseName}.mp3`);

//   // Resolve info first so we can choose a stable format and pass headers
//   const info = await ytdl.getInfo(videoUrl, {
//     requestOptions: { headers: YT_REQUEST_HEADERS }
//   });

//   // Prefer m4a (itag 140). Fallback to best audio-only.
//   const preferred =
//     info.formats.find(f => f.itag === 140) ||
//     ytdl.chooseFormat(info.formats, { quality: 'highestaudio', filter: 'audioonly' });

//   // Create stream from resolved format. Disable internal chunking to avoid 410.
//   const audioStream = ytdl.downloadFromInfo(info, {
//     format: preferred,
//     requestOptions: { headers: YT_REQUEST_HEADERS },
//     dlChunkSize: 0,           // <- critical: request whole file instead of segments
//     highWaterMark: 1 << 25,   // 32 MB buffer
//     filter: 'audioonly'
//   });

//   await new Promise<void>((resolve, reject) => {
//     ffmpeg(audioStream)
//       .audioChannels(1)
//       .audioBitrate(kbps)
//       .audioFrequency(16000)
//       .format('mp3')
//       .save(tmpOut)
//       .on('end', () => resolve())
//       .on('error', reject);
//   });

//   return tmpOut;
// }

// async function transcribeWithWhisper(filePath: string): Promise<string | null> {
//   try {
//     const mb = fileSizeMB(filePath);
//     if (mb > MAX_WHISPER_MB) {
//       throw new Error(`File ${mb.toFixed(2)}MB exceeds Whisper limit ${MAX_WHISPER_MB}MB`);
//     }

//     const resp = await openai.audio.transcriptions.create({
//       file: fs.createReadStream(filePath),
//       model: 'whisper-1',
//     });

//     return resp.text?.trim() || null;
//   } catch (err) {
//     console.error('Whisper transcription failed:', err);
//     return null;
//   }
// }

// // ———————————————————————————————————————————————————————
// // Controller: Scrape channel → recent videos → download audio → Whisper
// // ———————————————————————————————————————————————————————
// export const scrapeFastYouTubeChannel = async (req: Request, res: Response): Promise<void> => {
//   const { channel, accessToken } = req.body;

//   if (!accessToken) {
//     res.status(401).json({ error: 'Missing access token' });
//     return;
//   }

//   const user = await prisma.authUser.findFirst({ where: { accessToken } });
//   if (!user) {
//     res.status(401).json({ error: 'Invalid access token or user not found' });
//     return;
//   }

//   if (!channel || !channel.startsWith('https://www.youtube.com/')) {
//     res.status(400).json({ error: 'Valid YouTube channel URL required' });
//     return;
//   }

//   try {
//     // 1) Discover recent videos via Apify channel scraper (fast metadata only)
//     const run = await apify.actor('streamers/youtube-channel-scraper').call({
//       startUrls: [{ url: channel }],
//       maxResults: Number(process.env.YT_MAX_RESULTS || 1), // default: 1 latest video
//       maxResultsShorts: 0,
//       maxResultStreams: 0,
//     });

//     const { items } = await apify.dataset(run.defaultDatasetId).listItems();
//     const videoItems = (items || []).filter(
//       (v: any) => typeof v?.url === 'string' && (v.url.includes('watch?v=') || v.url.includes('shorts/'))
//     );

//     const savedItems = await Promise.all(
//       videoItems.map(async (video: any, idx: number) => {
//         const videoUrl: string = video.url;
//         const title: string = video.title || 'Untitled';
//         const publishedAt: string | undefined = video.publishedAt;

//         // Optional comments
//         let comments: string[] = [];
//         try {
//           const commentRun = await apify.actor('streamers/youtube-comments-scraper').call({
//             startUrls: [{ url: videoUrl }],
//             maxComments: Number(process.env.YT_MAX_COMMENTS || 5),
//           });
//           const { items: commentItems } = await apify.dataset(commentRun.defaultDatasetId).listItems();
//           comments = (commentItems || [])
//             .map((c: any) => c?.text || c?.comment || '')
//             .filter(Boolean)
//             .slice(0, Number(process.env.YT_MAX_COMMENTS || 5));
//         } catch (err) {
//           console.warn(`Comments fetch failed for ${videoUrl}`, err);
//         }

//         // Audio download & transcription
//         let transcript: string | null = null;
//         const baseName = `yt_${Date.now()}_${idx}`;
//         let audioPath: string | null = null;

//         try {
//           audioPath = await withRetry(() =>
//             downloadAudioAsMp3(videoUrl, baseName, TARGET_BITRATE_K)
//           );
          
//           audioPath = await ensureSmallEnoughOrReencode(audioPath, TARGET_BITRATE_K, FALLBACK_BITRATE_K);
//           transcript = await transcribeWithWhisper(audioPath);
//         } catch (err) {
//           console.warn(`Audio/Whisper failed for ${videoUrl}:`, err);
//         } finally {
//           if (audioPath) {
//             try { fs.unlinkSync(audioPath); } catch {}
//           }
//         }

//         const thumbnail: string | null =
//           video.thumbnails?.[0]?.url || video.thumbnailUrl || null;

//         // Persist to DB
//         try {
//           return await prisma.scrapedVideo.upsert({
//             where: { videoUrl },
//             update: {
//               title,
//               thumbnail,
//               publishedAt: publishedAt ? new Date(publishedAt) : undefined,
//               transcript: transcript ?? '',
//               comments,
//               user: { connect: { id: user.id } },
//             },
//             create: {
//               title,
//               videoUrl,
//               thumbnail,
//               publishedAt: publishedAt ? new Date(publishedAt) : undefined,
//               transcript: transcript ?? '',
//               comments,
//               user: { connect: { id: user.id } },
//             },
//           });
//         } catch (err) {
//           console.error(`DB save failed for ${videoUrl}:`, err);
//           // Return a lightweight object so the overall Promise.all still resolves gracefully
//           return {
//             id: null,
//             title,
//             videoUrl,
//             thumbnail,
//             publishedAt: publishedAt ? new Date(publishedAt) : null,
//             transcript: transcript ?? '',
//             comments,
//             userId: user.id,
//           };
//         }
//       })
//     );

//     res.json({ items: savedItems });
//   } catch (err) {
//     console.error('[YT scrape] error:', err);
//     res.status(500).json({ error: 'scraper failed' });
//   }
// };

// // ———————————————————————————————————————————————————————
// // Get user's saved videos
// // ———————————————————————————————————————————————————————
// export const getUserYoutubeVideos = async (req: Request, res: Response): Promise<void> => {
//   const accessToken = req.headers.authorization?.replace('Bearer ', '');

//   if (!accessToken) {
//     res.status(401).json({ error: 'Missing access token' });
//     return;
//   }

//   const user = await prisma.authUser.findFirst({ where: { accessToken } });
//   if (!user) {
//     res.status(401).json({ error: 'Invalid token' });
//     return;
//   }

//   try {
//     const videos = await prisma.scrapedVideo.findMany({
//       where: { userId: user.id },
//       orderBy: { publishedAt: 'desc' },
//     });
//     res.json({ items: videos });
//   } catch (err) {
//     console.error('Failed to fetch videos', err);
//     res.status(500).json({ error: 'Failed to fetch videos' });
//   }
// };

