import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { findSimilarProfiles, generateAndUpsertEmbedding } from "@/lib/embeddings";
import pg from "pg";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has an embedding, generate one if not
    const pool = new pg.Pool({
      connectionString: process.env.DATABASE_POOLING_URL || process.env.DATABASE_URL!,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    let hasEmbedding = false;
    try {
      const existingEmbedding = await pool.query(
        `SELECT user_id FROM profile_embeddings WHERE user_id = $1`,
        [user.id]
      );
      hasEmbedding = existingEmbedding.rows.length > 0;
      console.log(`User ${user.id} ${hasEmbedding ? 'already has' : 'does not have'} an embedding`);
    } catch (dbError) {
      console.error(`Database error checking embeddings for user ${user.id}:`, dbError);
      // Table might not exist, continue without embedding check
    } finally {
      await pool.end();
    }

    if (!hasEmbedding) {
      console.log(`Generating embedding for user ${user.id} (${user.firstName} ${user.lastName})`);
      try {
        await generateAndUpsertEmbedding(user);
        console.log(`Successfully generated embedding for user ${user.id}`);
      } catch (embedError) {
        console.error(`Failed to generate embedding for user ${user.id}:`, embedError);
        // Return empty recommendations if we can't generate embedding
        return NextResponse.json({ recommendations: [] });
      }
    }

    // Find similar profiles via pgvector cosine similarity
    let matches: { user_id: number; similarity: number }[] = [];
    try {
      matches = await findSimilarProfiles(user.id, 5);
      console.log(`Found ${matches.length} matches for user ${user.id}`);
      if (matches.length > 0) {
        console.log(`Top matches:`, matches.slice(0, 3).map(m => ({ user_id: m.user_id, similarity: m.similarity })));
      }
    } catch (similarityError) {
      console.error(`Error finding similar profiles for user ${user.id}:`, similarityError);
      // Return empty recommendations if similarity search fails
      return NextResponse.json({ recommendations: [] });
    }

    if (matches.length === 0) {
      return NextResponse.json({ recommendations: [] });
    }

    // Fetch full user data for matched profiles
    const matchedUserIds = matches.map((m) => m.user_id);
    const recommendedUsers = await prisma.user.findMany({
      where: { id: { in: matchedUserIds } },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        roleTitle: true,
        company: true,
        domain: true,
        skills: true,
        profile_photo: true,
        role: true,
        openToMentor: true,
        clerkId: true,
      },
    });

    // Merge similarity scores and sort by similarity
    const recommendations = recommendedUsers
      .map((u) => {
        const match = matches.find((m) => m.user_id === u.id);
        return {
          ...u,
          similarity: match?.similarity ?? 0,
        };
      })
      .sort((a, b) => b.similarity - a.similarity);

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("Recommendation fetch failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
