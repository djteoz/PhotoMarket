import { Skeleton } from "@/components/ui/skeleton";

export function CatalogSkeleton() {
  return (
    <div className="flex flex-col">
      {/* Hero Skeleton */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12">
        <div className="container mx-auto px-4">
          <Skeleton className="h-10 w-64 mb-3 bg-slate-700" />
          <Skeleton className="h-6 w-96 bg-slate-700" />

          <div className="flex flex-wrap gap-2 mt-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-9 w-24 rounded-full bg-slate-700"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-64 rounded-xl" />
            </div>
          </div>

          {/* Grid */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-5 w-48" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-xl overflow-hidden border bg-white"
                >
                  <Skeleton className="aspect-[4/3] w-full" />
                  <div className="p-4 space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <div className="flex justify-between pt-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 border rounded-lg bg-white">
          <Skeleton className="w-48 h-32 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <div className="flex justify-between pt-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-8 w-28" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
