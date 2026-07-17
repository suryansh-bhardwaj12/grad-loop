import { Suspense } from "react";
import { getOpportunities } from "@/lib/data";
import OpportunitiesView from "@/components/opportunities/OpportunitiesView";
import { Briefcase } from "lucide-react";



export default async function OpportunitiesPage() {
  return (
    <Suspense fallback={<OpportunitiesLoading />}>
      <OpportunitiesData />
    </Suspense>
  );
}

async function OpportunitiesData() {
  const opportunities = await getOpportunities();
  return <OpportunitiesView initialOpportunities={opportunities} />;
}

function OpportunitiesLoading() {
  return (
    <div className="flex flex-col h-full w-full p-6 sm:p-10 overflow-y-auto bg-background/50 animate-pulse">
      <div className="max-w-5xl mx-auto w-full space-y-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div className="space-y-3">
             <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-xl bg-muted" />
                <div className="h-8 w-48 rounded-xl bg-muted" />
             </div>
             <div className="h-4 w-64 rounded-lg bg-muted ml-1" />
          </div>
          <div className="h-12 w-40 rounded-2xl bg-muted" />
        </div>

        <div className="h-14 w-full rounded-3xl bg-muted" />

        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[200px] w-full rounded-[2.5rem] bg-muted/40" />
          ))}
        </div>
      </div>
    </div>
  );
}
