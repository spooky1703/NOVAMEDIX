import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            {/* Header skeleton */}
            <div className="bg-[#0f1b2d] h-16" />

            {/* Hero skeleton */}
            <div className="bg-[#0f1b2d] pb-16 pt-12 flex flex-col items-center px-4">
                <Skeleton className="h-10 w-96 max-w-full bg-white/10 rounded-lg mb-4" />
                <Skeleton className="h-5 w-72 max-w-full bg-white/5 rounded mb-10" />
                <Skeleton className="h-14 w-full max-w-2xl bg-white/10 rounded-full" />
            </div>

            {/* Content skeleton */}
            <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                <div className="mb-8 flex items-end justify-between">
                    <div>
                        <Skeleton className="h-6 w-48 bg-slate-200 rounded mb-2" />
                        <Skeleton className="h-4 w-32 bg-slate-200 rounded" />
                    </div>
                    <Skeleton className="h-9 w-40 bg-slate-200 rounded" />
                </div>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                            <Skeleton className="aspect-square w-full bg-slate-100" />
                            <div className="p-4 space-y-3">
                                <Skeleton className="h-4 w-full bg-slate-200 rounded" />
                                <Skeleton className="h-4 w-3/4 bg-slate-200 rounded" />
                                <div className="flex gap-2">
                                    <Skeleton className="h-5 w-24 bg-blue-50 rounded" />
                                    <Skeleton className="h-5 w-24 bg-blue-50 rounded" />
                                </div>
                                <div>
                                    <Skeleton className="h-3 w-12 bg-slate-200 rounded mb-1" />
                                    <Skeleton className="h-7 w-24 bg-red-50 rounded" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
