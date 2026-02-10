import { Skeleton } from '@/components/ui/skeleton';
import { Package } from 'lucide-react';

export default function Loading() {
    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header Skeleton */}
            <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600/20">
                            <Package className="h-4 w-4 text-teal-600" />
                        </div>
                        <span className="text-lg font-bold text-slate-300">
                            Nova<span className="text-teal-600/50">Medix</span>
                        </span>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Hero Search Skeleton */}
                <div className="mb-10 flex flex-col items-center justify-center text-center">
                    <div className="w-full max-w-2xl transform transition-all duration-500 hover:scale-[1.01]">
                        <Skeleton className="h-14 w-full rounded-full" />
                    </div>
                </div>

                {/* Filters & Results Header Skeleton */}
                <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <Skeleton className="h-8 w-48 mb-2" />
                        <Skeleton className="h-4 w-32" />
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                        <Skeleton className="h-10 w-44 rounded-md" />
                        <Skeleton className="h-10 w-44 rounded-md" />
                    </div>
                </div>

                {/* Products Grid Skeleton */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="mb-4 flex items-center justify-center h-48 bg-slate-50 rounded-lg">
                                <Skeleton className="h-12 w-12 rounded-lg" />
                            </div>

                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-16 mb-2" />
                                <Skeleton className="h-5 w-full" />
                                <Skeleton className="h-5 w-3/4" />
                            </div>

                            <div className="mt-4 flex items-end justify-between pt-4 border-t border-slate-50">
                                <div>
                                    <Skeleton className="h-3 w-12 mb-1" />
                                    <Skeleton className="h-7 w-24" />
                                </div>
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
