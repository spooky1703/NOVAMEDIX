'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';

interface LiveSearchProps {
    placeholder?: string;
    className?: string;
    variant?: 'default' | 'hero';
}

export function LiveSearch({
    placeholder = 'Buscar producto...',
    className = '',
    variant = 'default',
}: LiveSearchProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const [hasValue, setHasValue] = useState(!!searchParams.get('busqueda'));

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
            router.push(`/?${params.toString()}`, { scroll: false });
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
        inputRef.current?.focus();
    };

    const handleSubmit = () => {
        const value = inputRef.current?.value || '';
        if (debounceRef.current) clearTimeout(debounceRef.current);
        pushSearch(value);
    };

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    const isHero = variant === 'hero';

    if (isHero) {
        return (
            <div className={`relative w-full ${className}`}>
                <div className="relative flex items-center overflow-hidden rounded-full bg-white shadow-xl ring-1 ring-white/20">
                    <Search className="absolute left-5 h-5 w-5 text-slate-400 pointer-events-none" />

                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={placeholder}
                        defaultValue={searchParams.get('busqueda') || ''}
                        onInput={handleInput}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
                        className="h-14 w-full bg-transparent pl-14 pr-28 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none sm:text-lg"
                    />

                    {hasValue && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-[72px] rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}

                    <button
                        type="button"
                        onClick={handleSubmit}
                        className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#1e3a5f] text-white transition-colors hover:bg-[#0f1b2d] sm:h-11 sm:w-11"
                    >
                        {isPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Search className="h-5 w-5" />
                        )}
                    </button>
                </div>
            </div>
        );
    }

    // Default variant
    return (
        <div className={`relative w-full ${className}`}>
            <div className="relative">
                {isPending ? (
                    <Loader2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-500" />
                ) : (
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                )}

                <input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    defaultValue={searchParams.get('busqueda') || ''}
                    onInput={handleInput}
                    className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 pl-10 pr-9 text-sm shadow-sm transition-all placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
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
        </div>
    );
}
