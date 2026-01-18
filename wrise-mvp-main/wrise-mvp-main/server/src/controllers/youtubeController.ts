// // youtubeController.ts
// import { Request, Response } from "express";
// import { getUserVideos, getVideoComments, getVideoTranscripts } from "../services/youtubeService";
// import { getFallbackTranscript } from "../utils/youtubeTranscriptFallback";
// import { storeYouTubeContent } from "../services/youtubeService";


// export const fetchUserVideos = async (req: Request, res: Response) => {
//   console.log("📥 Incoming request to fetchUserVideos");
//   console.log("🔐 req.user:", req.user);

//   const { accessToken, id: userId } = req.user as {
//     accessToken?: string;
//     id?: string;
//   };

//   if (!accessToken || !userId) {
//     console.warn("🚫 Missing access token or userId");
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   try {
//     const videos = await getUserVideos(accessToken);

//     if (!Array.isArray(videos) || videos.length === 0) {
//       return res.status(404).json({ error: "No videos found" });
//     }

//     // Fetch transcript + store each video in parallel.
//     const results = await Promise.allSettled(
//       videos.map(async (v) => {
//         const videoId =
//           v?.snippet?.resourceId?.videoId ||
//           (v as any).id;

//         if (!videoId) {
//           console.warn("⚠️   Skipping video with no videoId:", v);
//           return;
//         }

//         const { transcript } = await getVideoTranscripts(videoId);

//         await storeYouTubeContent(userId, v, transcript, accessToken);

//         console.log(`✅ Stored video ${videoId} for user ${userId}`);
//       })
//     );

//     results
//       .filter((r) => r.status === "rejected")
//       .forEach((r) =>
//         console.error("❌ Error saving a video:", (r as PromiseRejectedResult).reason)
//       );

//     // Return the list of videos to the client
//     res.json(videos);
//   } catch (err: any) {
//     console.error("❌ Error in fetchUserVideos:", err.message, err.stack);
//     res.status(500).json({ error: "Failed to fetch or store videos" });
//   }
// };
// export const fetchComments = async (req: Request, res: Response) => {
//   const { videoId } = req.params;
//   const accessToken = (req.user as { accessToken?: string })?.accessToken;
//   if (!accessToken) return res.status(401).json({ error: "No access token" });

//   try {
//     const comments = await getVideoComments(videoId, accessToken);
//     res.json(comments);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to fetch comments" });
//   }
// };

// export const fetchTranscripts = async (req: Request, res: Response):Promise<void> => {
//  const { videoId } = req.params;

//   try {
//     // Try to fetch transcript from YouTube
//     const transcript = await getVideoTranscripts(videoId);
//     // res.json(transcript);
//     console.log(`Transcript Result from ${transcript.source} for video ${videoId}:\n`);
//     console.log(transcript.transcript);

//     res.json({ source: "youtube", transcript });
//      return;
//   } catch (err: any) {
//     console.warn(`YouTube transcript unavailable: ${err.message}`);

//     try {
//       const fallbackTranscript = await getFallbackTranscript(videoId);
//        res.json({ source: "openai", transcript: fallbackTranscript });
//        return;
//     } catch (fallbackErr: any) {
//       console.error(`Fallback transcription failed for ${videoId}:`, fallbackErr);
//        res.status(500).json({
//         error: "Transcript not available via YouTube or OpenAI",
//         details: fallbackErr.message,
//       });
//       return;
//     }
//   }
// };


// export const fetchAndStoreYouTubeData = async (req: Request, res: Response):Promise<void> => {
//   const accessToken = (req.user as { accessToken?: string, id?: string })?.accessToken;
//   const userId = (req.user as { accessToken?: string, id?: string })?.id;

//   if (!accessToken || !userId) {
//     res.status(401).json({ error: "Unauthorized" });
//     return;
//   }
  
//   try {
//     const videos = await getUserVideos(accessToken);

//     if (videos && Array.isArray(videos)) {
//       for (const v of videos) {
//         const videoId = v?.snippet?.resourceId?.videoId;
//         if (typeof videoId === "string") {
//           const transcript = await getVideoTranscripts(videoId);
//           await storeYouTubeContent(userId, v, transcript.transcript, accessToken);
//         } else {
//           console.warn("Skipping video due to missing videoId:", v);
//         }
//       }
//     } else {
//       res.status(500).json({ error: "No videos found to process" });
//       return;
//     }

//     res.json({ success: true, message: "YouTube data saved" });
//   } catch (err) {
//   console.error(err);
//   res.status(500).json({ error: (err as Error).message || "Unknown error" });
//   }
// };
