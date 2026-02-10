'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming cn exists, if not I'll just use template literals carefully

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
    const pathname = usePathname();
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
        params.delete('pagina'); // Reset pagination

        // Determine target path: always go to root '/' for catalog search
        // If current path is NOT root, we must push to root.
        // If current path IS root, standard replacement.

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

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    const isHero = variant === 'hero';

    return (
        <div className={`relative w-full ${className}`}>
            <div className="relative">
                {isPending ? (
                    <Loader2 className={`absolute animate-spin text-teal-500 ${isHero ? 'left-5 top-1/2 h-5 w-5 -translate-y-1/2' : 'left-3 top-1/2 h-4 w-4 -translate-y-1/2'}`} />
                ) : (
                    <Search className={`absolute text-slate-400 ${isHero ? 'left-5 top-1/2 h-5 w-5 -translate-y-1/2' : 'left-3 top-1/2 h-4 w-4 -translate-y-1/2'}`} />
                )}

                <input
                    ref={inputRef}
                    type="text"
                    placeholder={placeholder}
                    defaultValue={searchParams.get('busqueda') || ''}
                    onInput={handleInput}
                    className={`
                        flex w-full border bg-white transition-all placeholder:text-slate-400 focus-visible:outline-none focus:ring-2 focus:ring-teal-500/20
                        ${isHero
                            ? 'h-14 rounded-full border-slate-200 px-6 pl-14 pr-12 text-lg shadow-lg focus:border-teal-500'
                            : 'h-9 rounded-md border-slate-200 px-3 pl-10 pr-9 text-sm shadow-sm focus-visible:ring-1 focus-visible:ring-slate-950'
                        }
                    `}
                />

                {hasValue && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className={`absolute -translate-y-1/2 rounded-full p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 ${isHero ? 'right-4 top-1/2' : 'right-3 top-1/2 p-0.5'}`}
                    >
                        <X className={isHero ? 'h-5 w-5' : 'h-3.5 w-3.5'} />
                    </button>
                )}
            </div>
        </div>
    );
}
