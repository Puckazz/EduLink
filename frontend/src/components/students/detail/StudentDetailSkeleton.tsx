import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function StudentDetailSkeleton() {
  return (
    <div className="space-y-7 pb-12 w-full">
      <Card className="overflow-hidden border-slate-700/30 bg-linear-to-br from-slate-900 to-slate-800 shadow-lg">
        <CardContent className="p-0">
          <Skeleton className="h-32 w-full rounded-none bg-slate-700/50" />
          <div className="flex flex-col gap-5 px-6 pb-7 pt-0 md:flex-row md:items-end md:justify-between">
            <div className="flex items-end gap-5">
              <Skeleton className="-mt-12 h-24 w-24 rounded-2xl border-4 border-white/90 shadow-xl" />
              <div className="space-y-3 pb-1">
                <Skeleton className="h-8 w-64 bg-slate-600/50" />
                <Skeleton className="h-4 w-96 bg-slate-600/30" />
              </div>
            </div>
            <Skeleton className="h-10 w-40 rounded-lg bg-slate-600/50" />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Card key={index} className="border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-4 w-32 bg-slate-200" />
              <Skeleton className="h-12 w-24 bg-slate-200" />
              {index > 0 && <Skeleton className="h-2 w-full bg-slate-100" />}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-7">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-6 w-48 bg-slate-200" />
              <div className="grid gap-4 md:grid-cols-2">
                {Array.from({ length: 6 }, (_, index) => (
                  <Skeleton
                    key={index}
                    className="h-16 w-full bg-slate-100 rounded-xl"
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-6 w-56 bg-slate-200" />
              {Array.from({ length: 3 }, (_, index) => (
                <Skeleton key={index} className="h-16 w-full bg-slate-100" />
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-7">
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-6 w-44 bg-slate-200" />
              {Array.from({ length: 2 }, (_, index) => (
                <Skeleton
                  key={index}
                  className="h-24 w-full bg-slate-100 rounded-xl"
                />
              ))}
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-4 p-6">
              <Skeleton className="h-6 w-40 bg-slate-200" />
              <div className="space-y-3">
                {Array.from({ length: 4 }, (_, index) => (
                  <Skeleton key={index} className="h-5 w-full bg-slate-100" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
