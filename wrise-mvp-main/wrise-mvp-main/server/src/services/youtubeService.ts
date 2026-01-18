// youtubeService.ts
import { youtube_v3, google } from "googleapis";
import { YoutubeTranscript } from "youtube-transcript"; // npm i youtube-transcript
import { getFallbackTranscript } from "../utils/youtubeTranscriptFallback";
import { embedTranscriptForUser } from "../lib/embedTranscriptForUser";
import prisma from "../lib/prisma";

const createOAuthClient = (accessToken: string) => {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  return oauth2Client;
};

export const getUserVideos = async (accessToken: string) => {
  const oauth2Client = createOAuthClient(accessToken);

  const youtube = google.youtube({
    version: "v3",
    auth: oauth2Client,
  });

  const res = await youtube.channels.list({
    mine: true,
    part: ["contentDetails"],
  });

  const uploadsPlaylistId = res.data.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) throw new Error("No uploads playlist found");

  const videosRes = await youtube.playlistItems.list({
    playlistId: uploadsPlaylistId,
    part: ["snippet"],
    maxResults: 10,
  });

  return videosRes.data.items;
};

export const getVideoComments = async (videoId: string, accessToken: string) => {
  const oauth2Client = createOAuthClient(accessToken);

  const youtube = google.youtube({
    version: "v3",
    auth: oauth2Client,
  });

  const res = await youtube.commentThreads.list({
    videoId,
    part: ["snippet"],
    maxResults: 20,
  });

  return res.data.items;
};

export const getVideoTranscripts = async (videoId: string) => {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    if (!transcript || transcript.length === 0) {
      console.warn(`⚠️ YouTube transcript empty for ${videoId}, falling back to Whisper`);
      const whisperTranscript = await getFallbackTranscript(videoId);
      return { source: "openai", transcript: whisperTranscript };
    }

    // Convert array to plain string
    const transcriptText = transcript.map(t => t.text).join(" ");

    return {
      source: "youtube",
      transcript: transcriptText,
    };
  } catch (err) {
    console.warn(`⚠️ YouTube transcript failed for ${videoId}, falling back to Whisper`);
    const whisperTranscript = await getFallbackTranscript(videoId);
    return { source: "openai", transcript: whisperTranscript };
  }
};

// export const storeYouTubeContent = async (userId: string, video: any, transcript: string, accessToken: string) => {
//   const comments = await getVideoComments(video.id, accessToken);
//   const topComment = comments?.[0]?.snippet?.topLevelComment?.snippet?.textDisplay || null;

//   try {
//     await prisma.content.create({
//       data: {
//         userId,
//         sourceType: "youtube",
//         transcript,
//         videoId: video.snippet.resourceId?.videoId || video.snippet.videoId || video.id, // handles different structures
//         title: video.snippet.title,
//         comment: topComment,
//         createdAt: new Date(video.snippet.publishedAt),
//       },
//     });
//   } catch (err) {
//     console.error(`❌ Failed to store content for video ${video.id}:`, err);
//     throw err;
//   }
export const storeYouTubeContent = async (
  userId: string,
  video: any,
  transcript: string,
  accessToken: string,
) => {
  const videoId =
    video.snippet?.resourceId?.videoId ||
    video.snippet?.videoId ||
    (video as any).id;

  let comment: string | null = null;
  try {
    const comments = await getVideoComments(videoId, accessToken);
    comment =
      comments?.[0]?.snippet?.topLevelComment?.snippet?.textDisplay ?? null;
  } catch (err: any) {
    console.warn("⚠️  Could not fetch comments for", videoId, err.message);
  }

  const savedContent = await prisma.content.create({
    data: {
      userId,
      sourceType: "youtube",
      transcript,
      videoId,
      title: video.snippet.title,
      comment,
      createdAt: new Date(video.snippet.publishedAt),
    },
  });

  const authUser = await prisma.authUser.findUnique({
    where: { id: userId },
  });

  if (!authUser) {
    console.warn(`⚠️ authUser not found for userId: ${userId}`);
    return;
  }

  await embedTranscriptForUser({
    user: { email: authUser.email },
    transcript,
    sourceType: "youtube",
    videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
    contentId: savedContent.contentId, // ✅ use the correct foreign key
  });
};


