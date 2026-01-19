import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function StudioCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full">
      <div className="relative">
        <Skeleton className="aspect-[4/3] w-full" />
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        <div className="flex items-center gap-1 mb-3">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between items-center">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-6 w-28" />
      </CardFooter>
    </Card>
  );
}

export function StudioGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <StudioCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function StudioPageSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <Skeleton className="h-10 w-2/3 mb-4" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Skeleton className="col-span-2 row-span-2 aspect-[4/3] rounded-xl" />
        <Skeleton className="aspect-[4/3] rounded-xl" />
        <Skeleton className="aspect-[4/3] rounded-xl" />
        <Skeleton className="aspect-[4/3] rounded-xl" />
        <Skeleton className="aspect-[4/3] rounded-xl" />
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-4/5" />
          <Skeleton className="h-6 w-3/4" />
          
          <div className="mt-8">
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="grid grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-40 rounded-lg" />
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-8 w-32" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
