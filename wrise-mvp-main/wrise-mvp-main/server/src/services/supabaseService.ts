import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import fs from 'fs';
import dotenv from 'dotenv';
import { file } from 'googleapis/build/src/apis/file';

dotenv.config();

export const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY! 
});

export const uploadFileToSupabase = async (
  buffer: Buffer,
  storagePath: string,
  mimeType: string
): Promise<string> => {
  const { error } = await supabase
    .storage
    .from("uploads")               
    .upload(storagePath, buffer, {
    contentType: mimeType,          
      // upsert: true,                 
    });

  if (error) {
    console.error("Supabase upload error:", error);
    throw error;
  }

  // Get the public URL for the freshly‑uploaded object
  const { data } = supabase.storage.from("uploads").getPublicUrl(storagePath);
  return data.publicUrl;
};

export const insertMetadata = async ({ content, fileType, fileUrl }: { content: string; fileType: string; fileUrl: string | null }) => {
  const { data, error } = await supabase.from('documents').insert([{ content, fileType, fileUrl }]).select();
  if (error) throw error;
  return data;
};

// --- Token verification helper ---
export const getUserFromToken = async (token: string) => {
  if (!token) return null;

  // Ask Supabase Auth to decode/verify the token
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    console.error("Supabase token verification failed:", error);
    return null;
  }

  return user; // contains id, email, role, etc.
};


export const queryOpenAI = async (inputText: string, systemPrompt = "You are a helpful assistant.") => {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Summarize this content:\n${inputText}` }
    ],

  });
  console.log("Answer:", completion.choices[0].message.content);
  return completion.choices[0]?.message?.content;
};