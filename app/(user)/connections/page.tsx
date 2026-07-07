import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { getConnectionsList, getPendingRequests, getRecommendedUsers } from "@/lib/data";
import ConnectionsView from "@/components/connections/ConnectionsView";
import { Loader2 } from "lucide-react";



export default async function ConnectionsPage() {
  const { userId: clerkId } = await auth();

  if (!clerkId) return null;

  return (
    <Suspense fallback={<ConnectionsLoading />}>
      <ConnectionsData clerkId={clerkId} />
    </Suspense>
  );
}

async function ConnectionsData({ clerkId }: { clerkId: string }) {
  const [connections, pending, recommendations] = await Promise.all([
    getConnectionsList(clerkId),
    getPendingRequests(clerkId),
    getRecommendedUsers(clerkId)
  ]);

  return (
    <ConnectionsView 
      initialConnections={connections as any}
      initialReceived={pending.received as any}
      initialSent={pending.sent as any}
      initialRecommendations={recommendations as any}
    />
  );
}

function ConnectionsLoading() {
  return (
    <div className="flex flex-col h-full w-full p-6 sm:p-10 overflow-y-auto animate-pulse">
      <div className="mb-8 space-y-3">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-muted" />
          <div className="h-8 w-40 rounded-xl bg-muted" />
        </div>
        <div className="h-4 w-64 rounded-lg bg-muted ml-1" />
      </div>

      <div className="flex gap-2 mb-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-10 w-24 rounded-lg bg-muted" />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="soft-card p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-xl bg-muted" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-24 rounded-lg bg-muted" />
                <div className="h-2 w-16 rounded-lg bg-muted" />
              </div>
            </div>
            <div className="flex gap-1">
              <div className="h-4 w-12 rounded bg-muted" />
              <div className="h-4 w-12 rounded bg-muted" />
            </div>
            <div className="flex gap-2">
              <div className="h-9 flex-1 rounded-lg bg-muted" />
              <div className="h-9 w-12 rounded-lg bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
