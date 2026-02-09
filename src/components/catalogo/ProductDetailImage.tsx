'use client';

import { useState } from 'react';
import { Package, Info } from 'lucide-react';

interface ProductDetailImageProps {
    src: string | null | undefined;
    alt: string;
}

export function ProductDetailImage({ src, alt }: ProductDetailImageProps) {
    const [imgError, setImgError] = useState(false);
    const hasImage = src && !imgError;

    return (
        <>
            <div className="flex h-64 w-full items-center justify-center">
                {hasImage ? (
                    <img
                        src={src}
                        alt={alt}
                        className="max-h-full max-w-full object-contain"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <Package className="h-32 w-32 text-emerald-200" />
                )}
            </div>
            {hasImage && (
                <div className="mt-4 flex items-start gap-1.5 rounded-md bg-slate-100/80 px-3 py-2">
                    <Info className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
                    <p className="text-[11px] leading-tight text-slate-400">
                        Imagen ilustrativa. La presentación del producto puede variar según disponibilidad del fabricante.
                    </p>
                </div>
            )}
        </>
    );
}
