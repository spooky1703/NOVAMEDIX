'use client';

import Image from 'next/image';
import Link from 'next/link';

export interface SerializedProduct {
    id: string;
    clave: string;
    codigo: string;
    nombre: string;
    descripcion: string | null;
    precio: number;
    categoria: string | null;
    imagen: string | null;
    activo: boolean;
    createdAt: string;
    updatedAt: string;
}

interface ProductCardProps {
    producto: SerializedProduct;
}

export function ProductCard({ producto }: ProductCardProps) {
    const precio = producto.precio;

    return (
        <Link href={`/producto/${producto.id}`} className="group block">
            <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:shadow-lg hover:border-slate-300 hover:-translate-y-0.5">
                {/* Image */}
                <div className="relative flex aspect-square items-center justify-center border-b border-slate-100 bg-slate-50 p-4">
                    {producto.imagen ? (
                        <Image
                            src={producto.imagen}
                            alt={producto.nombre || producto.codigo}
                            fill
                            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                    ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-300">
                            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs">Sin imagen</span>
                        </div>
                    )}

                    {!producto.activo && (
                        <div className="absolute right-2 top-2 rounded-full bg-slate-800/80 px-2.5 py-0.5 text-[10px] font-bold text-white uppercase tracking-wide">
                            No disponible
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col p-4">
                    {/* Product Name */}
                    <h3 className="mb-3 text-sm font-bold leading-snug text-[#0f1b2d] uppercase line-clamp-2 min-h-[2.5rem]">
                        {producto.nombre || 'SIN NOMBRE'}
                    </h3>

                    {/* Code Badges */}
                    <div className="mb-4 flex flex-wrap gap-1.5">
                        <span className="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-[10px] font-mono font-medium text-blue-700 ring-1 ring-inset ring-blue-200 truncate max-w-[130px]">
                            {producto.clave}
                        </span>
                        <span className="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-[10px] font-mono font-medium text-blue-700 ring-1 ring-inset ring-blue-200 truncate max-w-[130px]">
                            {producto.codigo}
                        </span>
                    </div>

                    {/* Price */}
                    <div className="mt-auto">
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">
                            Precio
                        </span>
                        <span className="text-xl font-extrabold text-red-600">
                            ${precio.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
}
