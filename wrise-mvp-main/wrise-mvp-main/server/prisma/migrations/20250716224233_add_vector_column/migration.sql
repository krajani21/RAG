-- This is an empty migration.


-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column if not exists
ALTER TABLE "content_vectors"
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Add index if not already present
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename = 'content_vectors'
      AND indexname = 'content_vectors_embedding_idx'
  )
  THEN
    CREATE INDEX content_vectors_embedding_idx
    ON "content_vectors"
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
  END IF;
END$$;
