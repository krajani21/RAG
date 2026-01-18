// utils/youtubeCaptions.ts
// import fs from 'fs';
// import path from 'path';
// import ytdlp from 'yt-dlp-exec';

// /**
//  * Clean SRT captions: strip timestamps, numbering, HTML entities, and deduplicate lines.
//  */
// function cleanSrtText(raw: string): string {
//   const lines = raw
//     .replace(/\r/g, '') // normalize line endings
//     .split('\n');

//   const cleanedLines: string[] = [];
//   let lastLine = '';

//   for (let i = 0; i < lines.length; i++) {
//     const line = lines[i].trim();

//     // Skip empty lines, timestamps, or index numbers
//     if (
//       line === '' ||
//       /^\d+$/.test(line) ||
//       /^\d{2}:\d{2}:\d{2},\d{3} -->/.test(line)
//     ) {
//       continue;
//     }

//     // Remove [bracketed cues] and HTML entities
//     const cleaned = line
//       .replace(/\[.*?\]/g, '')
//       .replace(/&amp;/g, '&')
//       .replace(/&lt;/g, '<')
//       .replace(/&gt;/g, '>');

//     if (cleaned !== lastLine) {
//       cleanedLines.push(cleaned);
//       lastLine = cleaned;
//     }
//   }

//   return cleanedLines.join(' ').replace(/\s{2,}/g, ' ').trim();
// }

// /**
//  * Fetch auto-generated English captions (.srt) from a YouTube video URL
//  */
// export async function fetchCaptionsIfAvailable(videoUrl: string): Promise<string | null> {
//   const tempPath = path.resolve(__dirname, '..', 'temp');
//   const outputBase = `captions_${Date.now()}`;
//   const outputFile = path.join(tempPath, `${outputBase}.en.srt`);
  
//   try {
//     await ytdlp(videoUrl, {
//       writeAutoSub: true,
//       subLang: 'en',
//       skipDownload: true,
//       subFormat: 'srt',           // produce .srt
//       output: path.join(tempPath, outputBase), // yt-dlp will append .en.srt
//       cookies: path.resolve(__dirname, '..', 'config', 'cookies.txt'),
//     });

//     if (!fs.existsSync(outputFile)) return null;

//     const raw = fs.readFileSync(outputFile, 'utf-8');
//     fs.unlinkSync(outputFile);

//     const cleaned = cleanSrtText(raw);

//     // Optional length cap
//     return cleaned.length > 100_000 ? cleaned.slice(0, 100_000) : cleaned;
//   } catch (err) {
//     console.warn('🟡 Failed to fetch captions with yt-dlp:', err);
//     return null;
//   }
// }

// /**
//  * Get latest video URL from a YouTube channel URL
//  */
// export async function getLatestVideoUrlFromChannel(channelUrl: string): Promise<string | null> {
//   try {
//     const stdout = await ytdlp(channelUrl, {
//       flatPlaylist: true,
//       getId: true,
//       playlistEnd: 1,
//     });
//     const videoId = String(stdout).trim().split('\n')[0];
//     return videoId ? `https://www.youtube.com/watch?v=${videoId}` : null;
//   } catch (err) {
//     console.warn('⚠️ Failed to get video ID from channel:', err);
//     return null;
//   }
// }

// /**
//  * Wrapper: handles both channel and video URLs
//  */
// export async function fetchCaptionsFromUrl(inputUrl: string): Promise<string | null> {
//   if (inputUrl.includes('/watch?v=') || inputUrl.includes('/shorts/')) {
//     return await fetchCaptionsIfAvailable(inputUrl);
//   }

//   const latestVideoUrl = await getLatestVideoUrlFromChannel(inputUrl);
//   if (!latestVideoUrl) return null;

//   return await fetchCaptionsIfAvailable(latestVideoUrl);
// }
