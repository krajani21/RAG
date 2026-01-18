import * as dotenv from 'dotenv';
dotenv.config();

import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { createClient } from '@supabase/supabase-js';
import { openaiEmbeddings } from './embeddings';

const supabaseClient = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const vectorStorePromise = SupabaseVectorStore.fromExistingIndex(
  openaiEmbeddings,
  {
    client: supabaseClient,
    tableName: 'content_vectors',
    queryName: 'match_content_vectors',
  }
);