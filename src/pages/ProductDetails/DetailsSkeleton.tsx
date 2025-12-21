import { Skeleton } from "@/components/ui/skeleton";

const DetailsSkeleton = () => (
  <div className="container mx-auto max-w-7xl px-4 py-8">
    <div className="mb-6 h-6 w-48 animate-pulse rounded bg-slate-100" />
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
      <div className="space-y-4 lg:col-span-7">
        <Skeleton className="aspect-square w-full rounded-xl md:aspect-[4/3]" />
        <div className="flex gap-4">
          <Skeleton className="h-20 w-20 rounded-lg" />
          <Skeleton className="h-20 w-20 rounded-lg" />
          <Skeleton className="h-20 w-20 rounded-lg" />
        </div>
      </div>
      <div className="lg:col-span-5">
        <Skeleton className="h-[500px] w-full rounded-xl" />
      </div>
    </div>
  </div>
);

export default DetailsSkeleton