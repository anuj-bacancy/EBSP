import { SiteHeader } from "@/components/layout/site-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div>
      <SiteHeader />
      <main className="mx-auto max-w-7xl space-y-8 px-6 py-16">
        <div className="space-y-4">
          <Skeleton className="h-5 w-48 rounded-full" />
          <Skeleton className="h-14 w-full max-w-4xl" />
          <Skeleton className="h-6 w-full max-w-2xl" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </main>
    </div>
  );
}
