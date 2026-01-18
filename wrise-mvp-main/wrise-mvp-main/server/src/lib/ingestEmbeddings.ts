// server/src/lib/ingestEmbeddings.ts
import cuid from "cuid";  // npm install cuid
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from "@supabase/supabase-js";
import prisma from "../lib/prisma";
import * as dotenv from "dotenv";

dotenv.config();

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// LangChain setup
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 500,
  chunkOverlap: 50,
});
const embeddings = new OpenAIEmbeddings();

export async function ingest(contentId?: string) {
  console.log("🚀 Starting embedding job...");

  const contents = await prisma.content.findMany({
    where: {
      sourceType: "pdf",
      ...(contentId ? { contentId } : {}),
    },
    include: {
      user: true,
    },
  });

  console.log(`Found ${contents.length} PDFs to embed.`);

  for (const content of contents) {
    console.log(`Embedding: ${content.title} (${content.contentId})`);

    if (!content.user || !content.user.email) {
      console.warn(`⚠️ Skipping content ${content.contentId}, no user email found`);
      continue;
    }

    const userEmail = content.user.email;
    const authUser = await prisma.authUser.findUnique({
      where: { email: userEmail },
    });

    if (!authUser) {
      console.warn(`⚠️ No authUser found for email: ${userEmail}`);
      continue;
    }

    const docs = await splitter.createDocuments([content.transcript]);
    const texts = docs.map((doc) => doc.pageContent);
    console.log(`📄 Split into ${texts.length} chunks`);

    const vectors = await embeddings.embedDocuments(texts);
    console.log(`🔢 Generated ${vectors.length} vectors`);

    for (let i = 0; i < vectors.length; i++) {
      const id = cuid();

      const { error } = await supabase.from("content_vectors").insert({
        id,
        contentId: content.contentId,
        creatorId: authUser.id,
        contentText: texts[i],
        metadata: {
          contentId: content.contentId,
          sourceType: "pdf",
          creator_id: authUser.id, // ✅ Required for RAG filter to work
        },
        sourceType: "pdf",
        embedding: vectors[i],
      });

      if (error) {
        console.error(`❌ Failed to insert chunk ${i + 1}:`, error.message);
      }
    }

    console.log(`✅ Inserted ${vectors.length} vectors for: ${content.title}`);
    console.log("🧠 Sample metadata:", {
      contentId: content.contentId,
      sourceType: "pdf",
      creator_id: authUser.id,
    });
  }

  console.log("✅ All content embedded.");
}
