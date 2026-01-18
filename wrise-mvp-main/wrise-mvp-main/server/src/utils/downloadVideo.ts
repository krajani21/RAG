import { mkdirSync, existsSync } from 'fs';
import path from 'path';
import axios from 'axios';
import { createWriteStream } from 'fs';
import { v4 as uuidv4 } from 'uuid';

export async function downloadVideo(url: string): Promise<string> {
  const dir = path.resolve(__dirname, '../tmp');

  // Create tmp folder if it doesn't exist
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const filePath = path.resolve(dir, `${uuidv4()}.mp4`);
  const writer = createWriteStream(filePath);

  const response = await axios({
    url,
    method: 'GET',
    responseType: 'stream',
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(filePath));
    writer.on('error', reject);
  });
}
