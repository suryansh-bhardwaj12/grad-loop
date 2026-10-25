import dotenv from "dotenv";
import path from "path";
import pg from "pg";

dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

// Use command line arg or env var for DATABASE_URL (supports pooling URL)
const connectionString = process.argv[2] || process.env.DATABASE_POOLING_URL || process.env.DATABASE_URL!;

if (!connectionString) {
  console.error('Please provide DATABASE_URL as argument or environment variable');
  process.exit(1);
}

async function checkAndMigrate() {
  const pool = new pg.Pool({ connectionString });

  try {
    // Check if profile_embeddings table exists
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'profile_embeddings'
      );
    `);

    const tableExists = result.rows[0].exists;
    console.log(`Profile embeddings table ${tableExists ? 'exists' : 'does not exist'}`);

    if (!tableExists) {
      console.log('Running migration...');

      // Run the migration
      await pool.query(`
        CREATE EXTENSION IF NOT EXISTS vector;

        CREATE TABLE IF NOT EXISTS profile_embeddings (
          id         BIGSERIAL PRIMARY KEY,
          user_id    INTEGER NOT NULL UNIQUE REFERENCES "User"(id) ON DELETE CASCADE,
          embedding  vector(1024),
          profile_text TEXT,
          updated_at TIMESTAMPTZ DEFAULT now()
        );

        CREATE INDEX IF NOT EXISTS idx_profile_embeddings_hnsw
          ON profile_embeddings
          USING hnsw (embedding vector_cosine_ops);

        CREATE OR REPLACE FUNCTION match_profiles(
          query_embedding vector(1024),
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
              1 - (pe.embedding <=> query_embedding) AS similarity
            FROM profile_embeddings pe
            WHERE pe.user_id != exclude_user_id
              AND pe.embedding IS NOT NULL
            ORDER BY pe.embedding <=> query_embedding
            LIMIT match_count;
        END;
        $$;
      `);

      console.log('Migration completed successfully!');
    } else {
      console.log('Table already exists, no migration needed.');
    }

    // Check how many embeddings exist
    const countResult = await pool.query('SELECT COUNT(*) as count FROM profile_embeddings');
    console.log(`Found ${countResult.rows[0].count} embeddings in the database`);

  } catch (error) {
    console.error('Migration check failed:', error);
  } finally {
    await pool.end();
  }
}

checkAndMigrate();