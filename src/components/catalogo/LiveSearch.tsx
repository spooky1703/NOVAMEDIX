'use client';

import { useState, useRef, useEffect, useTransition, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';

interface Suggestion {
    id: string;
    nombre: string;
    clave: string;
}

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
    const suggestDebounceRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const [hasValue, setHasValue] = useState(!!searchParams.get('busqueda'));
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

    // Sync input from URL on mount / navigation
    useEffect(() => {
        const urlValue = searchParams.get('busqueda') || '';
        if (inputRef.current && !inputRef.current.matches(':focus')) {
            inputRef.current.value = urlValue;
            setHasValue(!!urlValue);
        }
    }, [searchParams]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Cleanup timeouts
    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            if (suggestDebounceRef.current) clearTimeout(suggestDebounceRef.current);
        };
    }, []);

    const fetchSuggestions = useCallback(async (query: string) => {
        if (query.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setIsLoadingSuggestions(true);
        try {
            const res = await fetch(`/api/productos/sugerencias?q=${encodeURIComponent(query)}`);
            if (res.ok) {
                const data: Suggestion[] = await res.json();
                setSuggestions(data);
                setShowSuggestions(data.length > 0);
                setActiveIndex(-1);
            }
        } catch {
            // silently fail
        } finally {
            setIsLoadingSuggestions(false);
        }
    }, []);

    const navigateToSearch = useCallback((value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value.trim()) {
            params.set('busqueda', value.trim());
        } else {
            params.delete('busqueda');
        }
        params.delete('pagina');

        setShowSuggestions(false);
        setSuggestions([]);

        startTransition(() => {
            router.push(`/?${params.toString()}`, { scroll: false });
        });
    }, [searchParams, router]);

    const handleInput = () => {
        const value = inputRef.current?.value || '';
        setHasValue(!!value);

        // Fetch suggestions with debounce
        if (suggestDebounceRef.current) clearTimeout(suggestDebounceRef.current);
        suggestDebounceRef.current = setTimeout(() => fetchSuggestions(value), 150);
    };

    const handleClear = () => {
        if (inputRef.current) inputRef.current.value = '';
        setHasValue(false);
        setSuggestions([]);
        setShowSuggestions(false);
        navigateToSearch('');
        inputRef.current?.focus();
    };

    const handleSelectSuggestion = (suggestion: Suggestion) => {
        if (inputRef.current) inputRef.current.value = suggestion.nombre;
        setHasValue(true);
        navigateToSearch(suggestion.nombre);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!showSuggestions || suggestions.length === 0) {
            if (e.key === 'Enter') {
                navigateToSearch(inputRef.current?.value || '');
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
                break;
            case 'Enter':
                e.preventDefault();
                if (activeIndex >= 0 && activeIndex < suggestions.length) {
                    handleSelectSuggestion(suggestions[activeIndex]);
                } else {
                    navigateToSearch(inputRef.current?.value || '');
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                break;
        }
    };

    const handleFocus = () => {
        const value = inputRef.current?.value || '';
        if (value.length >= 2 && suggestions.length > 0) {
            setShowSuggestions(true);
        }
    };

    const isHero = variant === 'hero';

    // ─── Highlight matching text ───
    const highlightMatch = (text: string, query: string) => {
        const idx = text.toLowerCase().indexOf(query.toLowerCase());
        if (idx === -1) return text;
        return (
            <>
                {text.slice(0, idx)}
                <span className="font-bold text-[#0f1b2d]">{text.slice(idx, idx + query.length)}</span>
                {text.slice(idx + query.length)}
            </>
        );
    };

    const currentQuery = inputRef.current?.value || '';

    // ─── Dropdown ───
    const dropdown = showSuggestions && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-[100] mt-2 max-h-80 overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white shadow-2xl">
            {suggestions.map((s, i) => (
                <button
                    key={s.id}
                    type="button"
                    onMouseDown={(e) => {
                        e.preventDefault(); // Prevent blur before click
                        handleSelectSuggestion(s);
                    }}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${i === activeIndex ? 'bg-slate-50' : 'hover:bg-slate-50'
                        } ${i > 0 ? 'border-t border-slate-100' : ''}`}
                >
                    <Search className="h-4 w-4 shrink-0 text-slate-400" />
                    <div className="flex flex-col min-w-0">
                        <span className="truncate text-slate-700">
                            {highlightMatch(s.nombre, currentQuery)}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 truncate">
                            {s.clave}
                        </span>
                    </div>
                </button>
            ))}
        </div>
    );

    // ─── HERO VARIANT ───
    if (isHero) {
        return (
            <div ref={containerRef} className={`relative w-full ${className}`}>
                <div className="relative flex items-center overflow-visible rounded-full bg-white shadow-xl ring-1 ring-white/20">
                    <Search className="absolute left-5 h-5 w-5 text-slate-400 pointer-events-none" />

                    <input
                        ref={inputRef}
                        type="text"
                        placeholder={placeholder}
                        defaultValue={searchParams.get('busqueda') || ''}
                        onInput={handleInput}
                        onKeyDown={handleKeyDown}
                        onFocus={handleFocus}
                        autoComplete="off"
                        className="h-14 w-full rounded-full bg-transparent pl-14 pr-28 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none sm:text-lg"
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
                        onClick={() => navigateToSearch(inputRef.current?.value || '')}
                        className="absolute right-2 flex h-10 w-10 items-center justify-center rounded-full bg-[#1e3a5f] text-white transition-colors hover:bg-[#0f1b2d] sm:h-11 sm:w-11"
                    >
                        {isPending || isLoadingSuggestions ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <Search className="h-5 w-5" />
                        )}
                    </button>
                </div>

                {dropdown}
            </div>
        );
    }

    // ─── DEFAULT VARIANT ───
    return (
        <div ref={containerRef} className={`relative w-full ${className}`}>
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
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    autoComplete="off"
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

            {dropdown}
        </div>
    );
}
