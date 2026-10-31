-- Migration: Change profile_embeddings.embedding from vector(1024) to vector(768)
-- Reason: Switching from Mistral mistral-embed (1024 dims) to Gemini text-embedding-004 (768 dims)
--
-- WARNING: This deletes all existing embeddings. After running this migration,
-- call GET /api/embeddings/generate-all (with admin auth) to re-embed all profiles.

-- Step 1: Drop the existing column (pgvector does not support ALTER COLUMN for vector dimensions)
ALTER TABLE profile_embeddings DROP COLUMN IF EXISTS embedding;

-- Step 2: Add the new 768-dim column
ALTER TABLE profile_embeddings ADD COLUMN embedding vector(768);

-- Step 3: Drop the old HNSW/IVFFlat index if it exists and recreate for 768 dims
DROP INDEX IF EXISTS profile_embeddings_embedding_idx;

CREATE INDEX profile_embeddings_embedding_idx
  ON profile_embeddings
  USING hnsw (embedding vector_cosine_ops);
