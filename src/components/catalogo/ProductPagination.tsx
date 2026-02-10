'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductPaginationProps {
    paginacion: {
        total: number;
        pagina: number;
        porPagina: number;
        totalPaginas: number;
    };
}

export function ProductPagination({ paginacion }: ProductPaginationProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const goToPage = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('pagina', page.toString());
        startTransition(() => {
            router.push(`/?${params.toString()}`, { scroll: true });
        });
    };

    const { pagina, totalPaginas } = paginacion;

    // Generate page numbers to show
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, pagina - Math.floor(maxVisible / 2));
    const end = Math.min(totalPaginas, start + maxVisible - 1);
    start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) {
        pages.push(i);
    }

    return (
        <div className="flex items-center justify-center gap-2">
            <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(pagina - 1)}
                disabled={pagina <= 1 || isPending}
                className="h-9 w-9"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            {start > 1 && (
                <>
                    <Button
                        variant={pagina === 1 ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => goToPage(1)}
                        disabled={isPending}
                        className="h-9 w-9"
                    >
                        1
                    </Button>
                    {start > 2 && (
                        <span className="px-1 text-slate-400">...</span>
                    )}
                </>
            )}

            {pages.map((page) => (
                <Button
                    key={page}
                    variant={page === pagina ? 'default' : 'outline'}
                    size="icon"
                    onClick={() => goToPage(page)}
                    disabled={isPending}
                    className={`h-9 w-9 ${page === pagina ? 'bg-emerald-600 text-white hover:bg-emerald-700' : ''}`}
                >
                    {page}
                </Button>
            ))}

            {end < totalPaginas && (
                <>
                    {end < totalPaginas - 1 && (
                        <span className="px-1 text-slate-400">...</span>
                    )}
                    <Button
                        variant={pagina === totalPaginas ? 'default' : 'outline'}
                        size="icon"
                        onClick={() => goToPage(totalPaginas)}
                        disabled={isPending}
                        className="h-9 w-9"
                    >
                        {totalPaginas}
                    </Button>
                </>
            )}

            <Button
                variant="outline"
                size="icon"
                onClick={() => goToPage(pagina + 1)}
                disabled={pagina >= totalPaginas || isPending}
                className="h-9 w-9"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
    );
}
