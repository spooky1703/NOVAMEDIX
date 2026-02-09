import { Skeleton } from '@/components/ui/skeleton';

export default function CatalogoLoading() {
    return (
        <div className="min-h-screen bg-slate-50">
            <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Skeleton className="h-9 w-36" />
                    <Skeleton className="hidden h-10 w-96 sm:block" />
                    <Skeleton className="h-8 w-16" />
                </div>
            </header>
            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="mt-2 h-4 w-32" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <Skeleton key={i} className="h-64 rounded-xl" />
                    ))}
                </div>
            </main>
        </div>
    );
}
