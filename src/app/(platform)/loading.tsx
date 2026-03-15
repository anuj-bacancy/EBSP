import { Skeleton } from "@/components/ui/skeleton";

function KpiSkeleton() {
  return (
    <div className="space-y-3 rounded-[24px] border border-[var(--border)] bg-[var(--panel)] p-5">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-28" />
      <Skeleton className="h-3 w-40" />
    </div>
  );
}

export default function PlatformLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <Skeleton className="h-4 w-24 rounded-full" />
        <Skeleton className="h-9 w-96" />
        <Skeleton className="h-5 w-[30rem]" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiSkeleton />
        <KpiSkeleton />
        <KpiSkeleton />
        <KpiSkeleton />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.8fr_1fr]">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-52" />
        <Skeleton className="h-52" />
      </div>
    </div>
  );
}
