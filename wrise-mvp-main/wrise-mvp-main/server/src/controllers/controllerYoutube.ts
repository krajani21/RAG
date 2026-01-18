// import { Request, Response } from 'express';
// import { ApifyClient } from 'apify-client';
// import dotenv from 'dotenv';
// import ffmpegPath from 'ffmpeg-static'; //npm install ffmpeg-static
// import ffmpeg from 'fluent-ffmpeg'; //npm install fluent-ffmpeg
// import fs from 'fs';
// import path from 'path';
// import { OpenAI } from 'openai';
// import youtubedl from 'yt-dlp-exec';
// import prisma from '../lib/prisma';
// import { storeYouTubeContent } from '../services/youtubeService';
// import { fetchCaptionsFromUrl } from '../utils/youtubeCaptions';
// import FormData from 'form-data';
// dotenv.config();
// import axios from 'axios';

// const client = new ApifyClient({
//   token: process.env.INSTAGRAM_API_TOKEN!,
// });

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// const MAX_MB = 25;

// async function transcribeAudioWithSplitting(audioPath: string): Promise<string | null> {
//   const stats = fs.statSync(audioPath);
//   const sizeMB = stats.size / (1024 * 1024);

//   // If under 25MB, transcribe directly
//   if (sizeMB <= MAX_MB) {
//     const response = await openai.audio.transcriptions.create({
//       file: fs.createReadStream(audioPath),
//       model: 'whisper-1',
//     });
//     return response.text;
//   }

//   // Split into chunks using ffmpeg
//   const chunkDir = path.dirname(audioPath);
//   const baseName = path.basename(audioPath, '.mp3');
//   const chunkPrefix = path.join(chunkDir, `${baseName}_chunk_`);

//   return new Promise((resolve, reject) => {
//     ffmpeg(audioPath)
//       .audioCodec('copy')
//       .format('mp3')
//       .outputOptions(['-f segment', '-segment_time 1200']) 
//       .output(`${chunkPrefix}%03d.mp3`)
//       .on('end', async () => {
//         try {
//           const files = fs.readdirSync(chunkDir)
//             .filter(f => f.startsWith(`${baseName}_chunk_`) && f.endsWith('.mp3'));

//           const transcripts = await Promise.all(
//             files.map(async (f) => {
//               const response = await openai.audio.transcriptions.create({
//                 file: fs.createReadStream(path.join(chunkDir, f)),
//                 model: 'whisper-1',
//               });
//               fs.unlinkSync(path.join(chunkDir, f)); 
//               return response.text;
//             })
//           );

//           resolve(transcripts.join(' '));
//         } catch (err) {
//           reject(err);
//         }
//       })
//       .on('error', reject)
//       .run();
//   });
// }


// ffmpeg.setFfmpegPath(ffmpegPath!);

// async function downloadAndConvertAudio(videoUrl: string, filename: string): Promise<string> {
//   const outputPath = path.resolve(__dirname, '..', 'temp', `${filename}.mp3`);

//   return new Promise((resolve, reject) => {
//     youtubedl(videoUrl, {
//       extractAudio: true,
//       audioFormat: 'mp3',
//       output: outputPath,
//       ffmpegLocation: ffmpegPath!,
//       cookies: path.resolve(__dirname, 'config', 'cookies.txt'),
//     })
//       .then(() => resolve(outputPath))
//       .catch(reject);
//   });
// }

// export const scrapeFastYouTubeChannel = async (req: Request, res: Response): Promise<void> => {
//   const { channel, accessToken } = req.body;

//    if (!accessToken) {
//     res.status(401).json({ error: "Missing access token" });
//     return;
//   }

//   const user = await prisma.authUser.findFirst({ where: { accessToken } });

//     if (!user) {
//     res.status(401).json({ error: "Invalid access token or user not found" });
//     return;
//   }

//   if (!channel || !channel.startsWith("https://www.youtube.com/")) {
//     res.status(400).json({ error: 'Valid YouTube channel URL required' });
//     return;
//   }

//   const input = {
//     startUrls: [{ url: channel }],
//     maxResults: 1,
//     maxResultsShorts: 0,
//     maxResultStreams: 0,
//   };

//   try {
//       const run = await client.actor('streamers/youtube-channel-scraper').call(input);
//       const { items } = await client.dataset(run.defaultDatasetId).listItems();
//       // const videoItems = items.filter((v: any) => v.url.includes('watch?v='));
//       const videoItems = items.filter((v: any) =>
//         v.url.includes('watch?v=') || v.url.includes('shorts/')
//       );
//       const itemsWithTranscripts = await Promise.all(videoItems.map(async (video: any, idx: number) => {
//         let transcript: string | null = null;
//         let comments: string[] = [];

//           // Start comment scraping in parallel with audio download
//         const commentPromise = (async () => {
//           try {
//             const commentRun = await client.actor('streamers/youtube-comments-scraper').call({
//               startUrls: [{ url: video.url }],
//               maxComments: 1,
//             });

//             await new Promise((r) => setTimeout(r, 2000));
//             const commentData = await client.dataset(commentRun.defaultDatasetId).listItems();
//             return commentData.items.map((c: any) => c.text || c.comment || "").filter(Boolean);
//           }catch (err) {
//               console.warn(`Comment fetch failed for ${video.url}`, err);
//               return [];
//           }
//           })();

//           // Audio download & transcription
//           // const filename = `audio_${Date.now()}_${idx}`;
//           // const audioPath = await downloadAndConvertAudio(video.url, filename);

//           // const voiceId = await uploadVoiceCloneToResemble(voiceSamplePath, user.id);

//           const transcriptPromise = (async () => {
//             try {
//               const captions = await fetchCaptionsFromUrl(video.url);
//               if (captions && captions.trim().length > 100) {
//                 console.log(`✅ Used YouTube captions for: ${video.url}`);
//                 return captions;
//               }

//               console.log(`⚠️ No usable captions for ${video.url}, falling back to Whisper...`);
//               const filename = `audio_${Date.now()}_${idx}`;
//               const audioPath = await downloadAndConvertAudio(video.url, filename);
//               const result = await transcribeAudioWithSplitting(audioPath);
//               fs.unlinkSync(audioPath); // Cleanup audio file
//               return result;


//             }

//             catch (err) {
//               console.warn(`Transcript failed for ${video.url}`, err);
//               return null;
//             }
//           })();

//           // const transcriptPromise = (async () => {
//           //   try {
//           //     return await transcribeAudioWithSplitting(audioPath);
//           //   } catch (err) {
//           //     console.warn(`Transcript failed for ${video.url}`, err);
//           //     return null;
//           //   } finally {
//           //     fs.unlinkSync(audioPath);
//           //   }
//           // })();

//           [comments, transcript] = await Promise.all([commentPromise, transcriptPromise]);
//           return {
//             title: video.title,
//             videoUrl: video.url,
//             thumbnail: video.thumbnails?.[0]?.url || video.thumbnailUrl || null,
//             publishedAt: video.publishedAt,
//             transcript,
//             comments,
//           };
//         })
//       );
      
//     console.log('Scraped videos with OpenAI transcripts:', itemsWithTranscripts);
//     // res.json({ items: itemsWithTranscripts });
//     // Save to Supabase via Prisma

//     const savedItems = await Promise.all(
//       itemsWithTranscripts.map(async (video) => {
//         if (!video.transcript?.trim()) {
//           console.warn(`⚠️ Skipping embedding for ${video.videoUrl} – no transcript`);
//           return null;
//         }

//         try {
//           await storeYouTubeContent(user.id, {
//             snippet: {
//               title: video.title,
//               publishedAt: video.publishedAt || new Date().toISOString(),
//               resourceId: { videoId: video.videoUrl.split("v=")[1] || video.videoUrl },
//             },
//           }, video.transcript, accessToken);

//           console.log(`✅ Embedded YouTube video: ${video.title}`);
//         } catch (err) {
//           console.error(`❌ Failed to store/embed video ${video.videoUrl}:`, err);
//         }

//         // Optional: still save to ScrapedVideo if needed
//         return prisma.scrapedVideo.upsert({
//           where: { videoUrl: video.videoUrl },
//           update: {
//             title: video.title,
//             thumbnail: video.thumbnail,
//             publishedAt: video.publishedAt ? new Date(video.publishedAt) : undefined,
//             transcript: video.transcript,
//             comments: video.comments,
//             user: { connect: { id: user.id } },
//           },
//           create: {
//             title: video.title,
//             videoUrl: video.videoUrl,
//             thumbnail: video.thumbnail,
//             publishedAt: video.publishedAt ? new Date(video.publishedAt) : undefined,
//             transcript: video.transcript,
//             comments: video.comments,
//             user: { connect: { id: user.id } },
//           },
//         });
//       })
//     );

    
//     res.json({ items: savedItems });
//       } catch (err) {
//         console.error('[YT scrape] error:', err);
//         res.status(500).json({ error: 'scraper failed' });
//       }
// };


// export const getUserYoutubeVideos = async (req: Request, res: Response): Promise<void> => {
//   const accessToken = req.headers.authorization?.replace("Bearer ", "");

//   if (!accessToken) {
//     res.status(401).json({ error: "Missing access token" });
//     return;
//   }

//   const user = await prisma.authUser.findFirst({ where: { accessToken } });

//   if (!user) {
//     res.status(401).json({ error: "Invalid token" });
//     return;
//   }

//   try {
//     const videos = await prisma.scrapedVideo.findMany({
//       where: { userId: user.id },
//       orderBy: { publishedAt: "desc" },
//     });

//     res.json({ items: videos });
//   } catch (err) {
//     console.error("Failed to fetch videos", err);
//     res.status(500).json({ error: "Failed to fetch videos" });
//   }
// };
