'use client';

import { Producto } from '@prisma/client';
import Link from 'next/link';
import { useState } from 'react';
import { Package, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
    producto: Producto;
}

export function ProductCard({ producto }: ProductCardProps) {
    const precio = Number(producto.precio);
    const [imgError, setImgError] = useState(false);
    const hasImage = producto.imagen && !imgError;

    return (
        <Link href={`/producto/${producto.id}`}>
            <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-lg">
                {/* Image */}
                <div className="flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-emerald-50/30">
                    {hasImage ? (
                        <img
                            src={producto.imagen!}
                            alt={producto.nombre || producto.codigo}
                            className="h-full w-full object-contain p-3 transition-transform group-hover:scale-105"
                            onError={() => setImgError(true)}
                            loading="lazy"
                        />
                    ) : (
                        <Package className="h-12 w-12 text-emerald-200 transition-colors group-hover:text-emerald-300" />
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4">
                    {producto.categoria && (
                        <Badge variant="secondary" className="mb-2 w-fit text-xs">
                            {producto.categoria}
                        </Badge>
                    )}
                    <h3 className="mb-1 line-clamp-2 text-sm font-semibold leading-5 text-slate-900 group-hover:text-emerald-700">
                        {producto.nombre || 'Sin nombre'}
                    </h3>
                    <p className="mb-3 text-xs text-slate-400">
                        Clave: {producto.clave}
                    </p>
                    <div className="mt-auto flex items-end justify-between">
                        <span className="text-xl font-bold text-emerald-600">
                            ${precio.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 opacity-0 transition-opacity group-hover:opacity-100">
                            Ver detalle
                            <ArrowRight className="h-3 w-3" />
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
