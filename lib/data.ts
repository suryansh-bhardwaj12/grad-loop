import { prisma } from "./prisma";
import { findSimilarProfiles, generateAndUpsertEmbedding } from "./embeddings";

/**
 * Opportunities are fetched server-side. No client fetch overhead.
 */
export async function getOpportunities() {
  return await prisma.opportunity.findMany({
    include: {
      author: {
        select: {
          firstName: true,
          lastName: true,
          profile_photo: true,
          roleTitle: true,
          company: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
}

export async function getUserConversations(clerkId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true }
  });

  if (!user) return [];

  const conversations = await prisma.conversation.findMany({
    where: {
      participants: {
        some: { id: user.id }
      }
    },
    include: {
      participants: {
        where: {
          NOT: { id: user.id }
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          profile_photo: true,
          clerkId: true,
          roleTitle: true,
        }
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          sender: {
            select: { firstName: true }
          }
        }
      }
    },
    orderBy: {
      lastMessageAt: 'desc'
    }
  });

  return conversations.map(conv => ({
    id: conv.id,
    otherUser: conv.participants[0] || null,
    lastMessage: conv.messages[0] ? {
      content: conv.messages[0].content,
      createdAt: conv.messages[0].createdAt.toISOString(),
      senderId: conv.messages[0].senderId,
      senderName: conv.messages[0].sender.firstName,
      read: conv.messages[0].read
    } : null,
    lastMessageAt: conv.lastMessageAt.toISOString()
  }));
}

export async function getRecommendedUsers(clerkId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId },
  });

  if (!user) return [];

  try {
    await generateAndUpsertEmbedding(user);
    
    const matches = await findSimilarProfiles(user.id, 8);
    
    if (matches.length === 0) return [];

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

    return recommendedUsers
      .map((u) => {
        const match = matches.find((m) => m.user_id === u.id);
        return {
          ...u,
          similarity: match?.similarity ?? 0,
        };
      })
      .sort((a, b) => b.similarity - a.similarity);
  } catch (err) {
    console.error("Recommendation error:", err);
    return [];
  }
}

export async function getUserConnections(clerkId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { connections: true }
  });
  return user?.connections || [];
}

export async function getPosts(clerkId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true, universityId: true }
  });

  if (!user || !user.universityId) return [];

  const posts = await prisma.post.findMany({
    where: { universityId: user.universityId },
    include: {
      author: {
        select: {
          clerkId: true,
          firstName: true,
          lastName: true,
          roleTitle: true,
          profile_photo: true,
        }
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        }
      },
      likes: {
        where: { userId: user.id },
        select: { id: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return posts.map(post => ({
    ...post,
    isLiked: post.likes.length > 0,
    createdAt: post.createdAt.toISOString()
  }));
}

export async function getConnectionsList(clerkId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { connections: true }
  });

  if (!user || user.connections.length === 0) return [];

  return await prisma.user.findMany({
    where: {
      id: { in: user.connections }
    },
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
      clerkId: true,
      openToMentor: true,
    }
  });
}

export async function getPendingRequests(clerkId: string) {
  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: { id: true }
  });

  if (!user) return { received: [], sent: [] };

  const [received, sent] = await Promise.all([
    prisma.connectionRequest.findMany({
      where: { receiverId: user.id, status: 'PENDING' },
      include: {
        sender: {
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
            clerkId: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.connectionRequest.findMany({
      where: { senderId: user.id, status: 'PENDING' },
      include: {
        receiver: {
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
            clerkId: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return {
    received: received.map(r => ({ id: r.id, createdAt: r.createdAt.toISOString(), sender: r.sender })),
    sent: sent.map(s => ({ id: s.id, createdAt: s.createdAt.toISOString(), receiver: s.receiver }))
  };
}
