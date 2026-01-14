import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";

export function StudioCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      {/* Image skeleton */}
      <Skeleton className="h-48 w-full rounded-none" />

      <CardHeader>
        <div className="flex justify-between items-start">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>

      <CardFooter className="border-t pt-4">
        <Skeleton className="h-4 w-20" />
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
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Gallery skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Skeleton className="aspect-video rounded-lg" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="aspect-square rounded-lg" />
          <Skeleton className="aspect-square rounded-lg" />
        </div>
      </div>

      {/* Info skeleton */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div>
            <Skeleton className="h-10 w-2/3 mb-2" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>

          <Skeleton className="h-32 w-full" />

          {/* Rooms skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-8 w-32" />
            <div className="grid gap-4">
              <RoomCardSkeleton />
              <RoomCardSkeleton />
            </div>
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="space-y-4">
          <Skeleton className="h-64 rounded-lg" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export function RoomCardSkeleton() {
  return (
    <Card>
      <div className="flex flex-col md:flex-row">
        <Skeleton className="h-48 md:h-auto md:w-48 rounded-l-lg" />
        <div className="flex-1 p-4 space-y-3">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="flex justify-between items-center pt-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Filters skeleton */}
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-28" />
        <Skeleton className="h-10 w-36" />
        <Skeleton className="h-10 w-24" />
      </div>

      {/* Results count */}
      <Skeleton className="h-5 w-48" />

      {/* Grid */}
      <StudioGridSkeleton count={9} />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-8 w-16" />
          </Card>
        ))}
      </div>

      {/* Chart skeleton */}
      <Card className="p-6">
        <Skeleton className="h-6 w-32 mb-4" />
        <Skeleton className="h-64 w-full" />
      </Card>

      {/* Table skeleton */}
      <Card className="p-6">
        <Skeleton className="h-6 w-40 mb-4" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-24 w-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      <Card className="p-6 space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="grid gap-4">
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-4 w-16 mb-2" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <Skeleton className="h-10 w-32" />
      </Card>
    </div>
  );
}
