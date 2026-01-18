import cuid from "cuid";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from "@supabase/supabase-js";
import prisma from "../lib/prisma";
import * as dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50,
});
const embeddings = new OpenAIEmbeddings();

type VideoItem = {
  transcript: string;
  videoUrl?: string;
  reelUrl?: string;
  contentId: string; // ✅ Now required
  user: { email: string };
  sourceType: "instagram" | "youtube";
};

export async function embedTranscriptForUser(item: VideoItem) {
  if (!item.transcript?.trim()) {
    console.warn("⚠️ No transcript, skipping embedding.");
    return;
  }

  const authUser = await prisma.authUser.findUnique({
    where: { email: item.user.email },
  });

  if (!authUser) {
    console.warn(`⚠️ authUser not found for email: ${item.user.email}`);
    return;
  }

  const docs = await splitter.createDocuments([item.transcript]);
  const texts = docs.map((doc) => doc.pageContent);
  const vectors = await embeddings.embedDocuments(texts);

  for (let i = 0; i < vectors.length; i++) {
    const { error } = await supabase.from("content_vectors").insert({
      id: cuid(),
      contentId: item.contentId, // ✅ Use passed-in contentId
      creatorId: authUser.id,
      contentText: texts[i],
      metadata: {
        contentId: item.contentId,
        sourceType: item.sourceType,
        creator_id: authUser.id,
        ...(item.videoUrl ? { videoUrl: item.videoUrl } : {}),
        ...(item.reelUrl ? { reelUrl: item.reelUrl } : {}),
      },
      sourceType: item.sourceType,
      embedding: vectors[i],
    });

    if (error) {
      console.error(`❌ Embedding insert failed for chunk ${i}:`, error.message, {
        contentId: item.contentId,
        textSnippet: texts[i].slice(0, 50),
        userEmail: item.user.email,
      });
    }
  }

  console.log(`✅ Embedded ${texts.length} chunks for ${item.sourceType} (contentId: ${item.contentId})`);
}
