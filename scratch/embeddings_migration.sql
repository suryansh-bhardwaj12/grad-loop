-- ============================================================
-- pgvector Profile Embeddings Migration (Google Gemini 768 dims)
-- ============================================================

-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create profile_embeddings table
CREATE TABLE IF NOT EXISTS profile_embeddings (
  id         BIGSERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
  embedding  vector(768),             -- Google Gemini embedding output dimension (768)
  profile_text TEXT,                  -- The text that was embedded (for debugging)
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Create HNSW index for fast cosine similarity search
CREATE INDEX IF NOT EXISTS idx_profile_embeddings_hnsw
  ON profile_embeddings
  USING hnsw (embedding vector_cosine_ops);

-- 4. Create similarity search function
CREATE OR REPLACE FUNCTION match_profiles(
  query_embedding vector(768),
  match_count     INT DEFAULT 5,
  exclude_user_id INT DEFAULT -1
)
RETURNS TABLE (
  user_id    INT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
    SELECT
      pe.user_id,
      (1 - (pe.embedding <=> query_embedding))::FLOAT AS similarity
    FROM profile_embeddings pe
    WHERE pe.user_id != exclude_user_id
      AND pe.embedding IS NOT NULL
    ORDER BY pe.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;
