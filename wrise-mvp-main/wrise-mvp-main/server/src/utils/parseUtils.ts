import pdfParse from "pdf-parse";
import { exec } from "child_process";
import fs from "fs";

export const extractTextFromPDF = async (path: string): Promise<string> => {
  const dataBuffer = fs.readFileSync(path);
  const data = await pdfParse(dataBuffer);
  return data.text;
};

export const extractAudioText = async (videoPath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const audioPath = videoPath.replace(/\.\w+$/, ".wav");
    exec(`ffmpeg -i ${videoPath} -q:a 0 -map a ${audioPath}`, async (err) => {
      if (err) return reject(err);

      // dummy speech-to-text result
      resolve("Transcribed audio text from video");

      // NOTE: Replace this with a call to a real speech-to-text API (e.g., AssemblyAI, Whisper API)
    });
  });
};
