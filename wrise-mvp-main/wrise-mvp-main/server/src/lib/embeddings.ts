import { OpenAIEmbeddings } from '@langchain/openai';

export const openaiEmbeddings = new OpenAIEmbeddings({
  modelName: 'text-embedding-ada-002',
});
