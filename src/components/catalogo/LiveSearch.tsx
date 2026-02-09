'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
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
    const [isPending, startTransition] = useTransition();

    // Use an uncontrolled input via ref to avoid React re-render conflicts
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const [hasValue, setHasValue] = useState(!!searchParams.get('busqueda'));

    // Set initial value from URL on mount only
    useEffect(() => {
        const urlValue = searchParams.get('busqueda') || '';
        if (inputRef.current && !inputRef.current.matches(':focus')) {
            inputRef.current.value = urlValue;
            setHasValue(!!urlValue);
        }
    }, [searchParams]);

    const pushSearch = (value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value.trim()) {
            params.set('busqueda', value.trim());
        } else {
            params.delete('busqueda');
        }
        params.delete('pagina');
        startTransition(() => {
            router.push(`/catalogo?${params.toString()}`);
        });
    };

    const handleInput = () => {
        const value = inputRef.current?.value || '';
        setHasValue(!!value);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => pushSearch(value), 400);
    };

    const handleClear = () => {
        if (inputRef.current) inputRef.current.value = '';
        setHasValue(false);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        pushSearch('');
    };

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    return (
        <div className={`relative ${className}`}>
            {isPending ? (
                <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-emerald-500" />
            ) : (
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            )}
            <input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                defaultValue={searchParams.get('busqueda') || ''}
                onInput={handleInput}
                className="flex h-9 w-full rounded-md border border-slate-200 bg-transparent px-3 py-1 pl-10 pr-9 text-sm shadow-sm transition-colors placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
            />
            {hasValue && (
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
