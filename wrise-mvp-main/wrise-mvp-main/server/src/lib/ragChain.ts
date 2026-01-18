import { ChatOpenAI } from '@langchain/openai';
import { formatDocumentsAsString } from 'langchain/util/document';
import { vectorStorePromise } from './vectorStore';
import { Document } from 'langchain/document';

const llm = new ChatOpenAI({
  modelName: 'gpt-4.1', //change gpt-3.5-turbo to gpt-4.1 if needed
  temperature: 0.3,
});

export async function runRAG({
  question,
  creatorId,
  k = 5,
}: {
  question: string;
  creatorId: string;
  k?: number;
}): Promise<{
  answer: string;
  sources: Document[];
}> {
  const vectorStore = await vectorStorePromise;
  // const retriever = vectorStore.asRetriever(k, {
  //   filter: { creatorId  }, 
  // });
  // const retriever = vectorStore.asRetriever(k, {
  //   filter:{
  //     "metadata.creator_id": creatorId, // ✅ Correct nested filter
  //   },
  // }); 

  // const docs: Document[] = await retriever.getRelevantDocuments(question);
  // console.log(`Retrieved ${docs.length} docs:`);
  const docs = await vectorStore.asRetriever(k * 3).getRelevantDocuments(question);

  // Filter documents manually by metadata.creator_id
  const filteredDocs = docs.filter(doc => doc.metadata?.creator_id === creatorId).slice(0, k);

  filteredDocs.forEach((doc, i) => {
    console.log(`Doc ${i + 1} content snippet:`, doc.pageContent.slice(0, 200));
  });
  if (filteredDocs.length === 0) {
    return {
      answer: `Sorry, I couldn't find an answer to that in the content.`,
      sources: [],
    };
  }

  const contextChunks = formatDocumentsAsString(filteredDocs);

  const systemPrompt = `
You are a helpful, intelligent chatbot that responds in the tone and style of the creator. You can only use the creator’s actual content to answer questions. Do not make up facts, and do not answer if the information is not available in the provided content. If the content does not include a relevant answer, simply say: "Sorry, I couldn't find an answer to that in the content."

INSTRUCTIONS:
Use the context below, taken from the actual content, to answer the user's question as accurately as possible. If multiple pieces of context relate to the question, synthesize them into a coherent response. Always stick to the creator's voice, using their typical phrasing or tone when appropriate.

--- BEGIN CONTEXT ---
${contextChunks}
--- END CONTEXT ---
`;

  const res = await llm.call([
    { role: 'system', content: systemPrompt },
    { role: 'user', content: question },
  ]);

  const answer = typeof res?.content === 'string' ? res.content : '';

  return {
    answer,
    sources: filteredDocs,
  };
}