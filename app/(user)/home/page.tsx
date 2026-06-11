import { Home, Search, Bell, Mail, GraduationCap, Sparkles, TrendingUp, Users, BookOpen } from "lucide-react";
import PostFeed from "@/components/feed/PostFeed";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getPosts } from "@/lib/data";
import { Suspense } from "react";



export default async function HomePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include: { university: true },
  });

  if (!user?.universityId) {
    redirect("/onboarding");
  }

  const universityName = user.university?.name || "University Feed";

  return (
    <div className="flex flex-col h-full w-full overflow-y-auto">

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-3xl mx-auto w-full space-y-6">
          {/* University Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-xl bg-linear-to-br from-primary/15 to-primary/5 shadow-sm">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {universityName}
              </h1>
              <p className="text-muted-foreground text-xs sm:text-sm mt-0.5">
                See what&apos;s happening in your university network.
              </p>
            </div>
          </div>


          {/* Post Feed */}
          <Suspense fallback={<HomeSkeleton />}>
            <PostFeedData userId={userId} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="space-y-6">
      {/* Post Box Skeleton */}
      <div className="soft-card p-5 space-y-4 animate-pulse">
        <div className="flex gap-3">
          <div className="size-10 rounded-full bg-muted" />
          <div className="flex-1 h-10 rounded-xl bg-muted" />
        </div>
      </div>
      
      {/* Feed Skeletons */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="soft-card p-5 space-y-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-3 w-24 rounded-lg bg-muted" />
              <div className="h-2 w-16 rounded-lg bg-muted" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full rounded-lg bg-muted" />
            <div className="h-3 w-5/6 rounded-lg bg-muted" />
          </div>
          <div className="h-40 w-full rounded-2xl bg-muted" />
        </div>
      ))}
    </div>
  );
}

async function PostFeedData({ userId }: { userId: string }) {
  const posts = await getPosts(userId);
  return <PostFeed initialPosts={posts as any} />;
}
