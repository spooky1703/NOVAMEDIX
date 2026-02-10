'use client';

import { Producto } from '@prisma/client';
import Link from 'next/link';
import { useState } from 'react';
import { Package, ArrowRight, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Define serialized type for Client Components
export interface SerializedProduct extends Omit<Producto, 'precio' | 'createdAt' | 'updatedAt'> {
    precio: number;
    createdAt: string;
    updatedAt: string;
}

interface ProductCardProps {
    producto: SerializedProduct;
}

export function ProductCard({ producto }: ProductCardProps) {
    const precio = producto.precio; // Already a number
    const [imgError, setImgError] = useState(false);
    const hasImage = producto.imagen && !imgError;

    return (
        <Link href={`/producto/${producto.id}`}>
            <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-teal-200 hover:shadow-lg">
                {/* Image Area */}
                <div className="relative flex h-48 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 to-teal-50/20 p-4">
                    {hasImage ? (
                        <div className="relative h-full w-full">
                            <img
                                src={producto.imagen!}
                                alt={producto.nombre || producto.codigo}
                                className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
                                onError={() => setImgError(true)}
                                loading="lazy"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center gap-2 text-slate-300 transition-colors group-hover:text-teal-200">
                            <Package className="h-12 w-12" />
                            <span className="text-[10px] font-medium uppercase tracking-wider">Sin imagen</span>
                        </div>
                    )}

                    {/* Status Badge */}
                    {!producto.activo && (
                        <div className="absolute right-2 top-2 rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur">
                            AGOTADO
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-4 pt-5">
                    {producto.categoria && (
                        <div className="mb-2 flex items-center gap-1.5">
                            <Tag className="h-3 w-3 text-teal-500" />
                            <span className="text-xs font-medium text-teal-600">
                                {producto.categoria}
                            </span>
                        </div>
                    )}

                    <h3 className="mb-1 line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-tight text-slate-800 group-hover:text-teal-700">
                        {producto.nombre || 'Producto sin nombre'}
                    </h3>

                    <div className="mb-4 flex items-center gap-2 text-[10px] text-slate-400">
                        <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-500">
                            {producto.clave}
                        </span>
                        <span>•</span>
                        <span className="font-mono truncate max-w-[80px]">
                            {producto.codigo}
                        </span>
                    </div>

                    <div className="mt-auto flex items-end justify-between border-t border-slate-50 pt-3">
                        <div className="flex flex-col">
                            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">
                                Precio
                            </span>
                            <span className="text-xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                                ${precio.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                        </div>

                        <div className="rounded-full bg-teal-50 p-2 text-teal-600 opacity-0 transition-all group-hover:opacity-100 group-hover:bg-teal-100">
                            <ArrowRight className="h-4 w-4" />
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
