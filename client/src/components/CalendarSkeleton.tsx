import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export function CalendarSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header row skeleton */}
      <div className="grid grid-cols-8 gap-2">
        <Skeleton className="h-16 w-full rounded-lg" />
        {Array.from({ length: 7 }, (_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
      
      {/* Team member rows skeleton */}
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="grid grid-cols-8 gap-2">
          <Skeleton className="h-20 w-full rounded-lg" />
          {Array.from({ length: 7 }, (_, j) => (
            <Skeleton key={j} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ))}
      
      {/* Summary skeleton */}
      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-4">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}