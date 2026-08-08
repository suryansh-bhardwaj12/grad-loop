import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { getUserConversations, getRecommendedUsers, getUserConnections } from "@/lib/data";
import ChatsView from "@/components/chats/ChatsView";
import { Loader2 } from "lucide-react";
import { prisma } from "@/lib/prisma";



export default async function ChatsPage() {
  const { userId: clerkId } = await auth();

  if (!clerkId) return null;

  return (
    <Suspense fallback={<ChatsLoading />}>
      <ChatsData clerkId={clerkId} />
    </Suspense>
  );
}

async function ChatsData({ clerkId }: { clerkId: string }) {
  const [conversations, recommendations, connections, userProfile] = await Promise.all([
    getUserConversations(clerkId),
    getRecommendedUsers(clerkId),
    getUserConnections(clerkId),
    prisma.user.findUnique({ where: { clerkId }, select: { id: true } })
  ]);

  return (
    <ChatsView 
      initialConversations={conversations as any}
      initialRecommendations={recommendations as any}
      initialConnections={connections}
      currentUserId={userProfile?.id || null}
    />
  );
}

function ChatsLoading() {
  return (
    <div className="flex flex-col h-full w-full overflow-y-auto animate-pulse">
      <div className="p-6 sm:p-10 pb-0">
        <div className="flex items-center gap-3 mb-2">
          <div className="size-10 rounded-xl bg-muted" />
          <div className="h-8 w-32 rounded-xl bg-muted" />
        </div>
        <div className="h-4 w-48 rounded-lg bg-muted mt-2 ml-1" />
      </div>

      <div className="px-6 sm:px-10 mt-8 mb-6">
        <div className="h-4 w-32 rounded-lg bg-muted mb-4" />
        <div className="flex gap-3 overflow-x-hidden">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="shrink-0 w-[160px] h-[180px] rounded-2xl bg-muted/40" />
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 sm:px-10 space-y-4">
        <div className="h-10 w-full max-w-sm rounded-xl bg-muted mb-6" />
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="flex items-center gap-3 p-3">
            <div className="h-11 w-11 rounded-xl bg-muted" />
            <div className="flex-1 space-y-2">
              <div className="flex justify-between">
                <div className="h-3 w-24 rounded-lg bg-muted" />
                <div className="h-2 w-8 rounded-lg bg-muted" />
              </div>
              <div className="h-2 w-32 rounded-lg bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
