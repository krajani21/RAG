// youtubeTranscriptFallback.ts
import fs from 'fs';
import path from 'path';
// import axios from 'axios';
import ytdl from '@distube/ytdl-core';
// import FormData from 'form-data';
import { OpenAI } from "openai";
import { v4 as uuidv4 } from 'uuid';
import 'dotenv/config';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const TEMP_DIR = path.resolve(__dirname, '../temp');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR);
}

// Step 1: Download audio from YouTube
export const downloadAudio = async (videoId: string): Promise<string> => {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  const audioPath = path.join(TEMP_DIR, `${uuidv4()}.mp3`);

  return new Promise((resolve, reject) => {
    const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' });
    const writeStream = fs.createWriteStream(audioPath);

    stream.pipe(writeStream);
    stream.on('error', reject);
    writeStream.on('finish', () => resolve(audioPath));
    writeStream.on('error', reject);
  });
};

// Step 2: Transcribe audio using OpenAI Whisper (via SDK)
export const transcribeWithWhisper = async (filePath: string): Promise<string> => {
  const response = await openai.audio.transcriptions.create({
    file: fs.createReadStream(filePath),
    model: "whisper-1",
    response_format: "text",
  });

  return response as unknown as string;
};

// Step 3: Main utility function
export const getFallbackTranscript = async (videoId: string): Promise<string> => {
  let audioPath: string | undefined;

  try {
    console.log(`🎧 Downloading audio for video ${videoId}`);
    audioPath = await downloadAudio(videoId);

    console.log(`🧠 Transcribing audio using OpenAI Whisper`);
    const transcript = await transcribeWithWhisper(audioPath);
    console.log(`📄 Fallback transcript result:\n${transcript}`); 
    return transcript;
  } catch (err) {
    console.error("❌ Failed to generate fallback transcript:", err);
    throw new Error("Fallback transcription failed");
  } finally {
    if (audioPath && fs.existsSync(audioPath)) {
      fs.unlinkSync(audioPath);
    }
  }
};
