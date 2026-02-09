'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface LiveSearchProps {
    placeholder?: string;
    className?: string;
}

export function LiveSearch({
    placeholder = 'Buscar por nombre, clave o código...',
    className = '',
}: LiveSearchProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('busqueda') || '');
    const [isSearching, setIsSearching] = useState(false);

    // Debounced search — pushes URL params after 300ms of no typing
    const pushSearch = useCallback(
        (value: string) => {
            const params = new URLSearchParams(searchParams.toString());
            if (value.trim()) {
                params.set('busqueda', value.trim());
            } else {
                params.delete('busqueda');
            }
            params.delete('pagina'); // Reset to page 1 on new search
            router.push(`/catalogo?${params.toString()}`);
            setIsSearching(false);
        },
        [router, searchParams]
    );

    useEffect(() => {
        setIsSearching(true);
        const timer = setTimeout(() => {
            pushSearch(query);
        }, 300);
        return () => clearTimeout(timer);
    }, [query, pushSearch]);

    // Sync with URL if user navigates back/forward
    useEffect(() => {
        const urlQuery = searchParams.get('busqueda') || '';
        if (urlQuery !== query) {
            setQuery(urlQuery);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const handleClear = () => {
        setQuery('');
    };

    return (
        <div className={`relative ${className}`}>
            {isSearching ? (
                <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-emerald-500" />
            ) : (
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            )}
            <Input
                type="text"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-9"
            />
            {query && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                    <X className="h-3.5 w-3.5" />
                </button>
            )}
        </div>
    );
}
