import { Suspense } from 'react';
import Link from 'next/link';
import { Package, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { obtenerProductosCatalogo, obtenerCategorias } from '@/lib/db/productos.queries';
import { ProductGrid } from '@/components/catalogo/ProductGrid';
import { ProductPagination } from '@/components/catalogo/ProductPagination';
import { ProductFilters } from '@/components/catalogo/ProductFilters';
import { Skeleton } from '@/components/ui/skeleton';

interface CatalogoPageProps {
    searchParams: Promise<{
        busqueda?: string;
        categoria?: string;
        precioMin?: string;
        precioMax?: string;
        ordenPor?: string;
        pagina?: string;
    }>;
}

export const dynamic = 'force-dynamic';

export default async function CatalogoPage({ searchParams }: CatalogoPageProps) {
    const params = await searchParams;
    const filtros = {
        busqueda: params.busqueda || undefined,
        categoria: params.categoria || undefined,
        precioMin: params.precioMin ? Number(params.precioMin) : undefined,
        precioMax: params.precioMax ? Number(params.precioMax) : undefined,
        ordenPor: (params.ordenPor as 'nombre_asc' | 'nombre_desc' | 'precio_asc' | 'precio_desc') || 'nombre_asc',
        pagina: params.pagina ? Number(params.pagina) : 1,
        porPagina: 24,
    };

    const [result, categorias] = await Promise.all([
        obtenerProductosCatalogo(filtros),
        obtenerCategorias(),
    ]);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-lg">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
                            <Package className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold text-slate-900">
                            Nova<span className="text-emerald-600">Medix</span>
                        </span>
                    </Link>
                    <form action="/catalogo" method="GET" className="hidden flex-1 px-8 sm:block">
                        <div className="relative mx-auto max-w-xl">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                name="busqueda"
                                placeholder="Buscar por nombre, clave o código..."
                                defaultValue={params.busqueda || ''}
                                className="pl-10"
                            />
                        </div>
                    </form>
                    <Link href="/login">
                        <Button variant="ghost" size="sm" className="text-slate-500">
                            Admin
                        </Button>
                    </Link>
                </div>
                {/* Mobile search */}
                <div className="border-t px-4 py-2 sm:hidden">
                    <form action="/catalogo" method="GET">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                name="busqueda"
                                placeholder="Buscar productos..."
                                defaultValue={params.busqueda || ''}
                                className="pl-10"
                            />
                        </div>
                    </form>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                {/* Filters row */}
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Catálogo de Productos</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {result.paginacion.total} producto{result.paginacion.total !== 1 ? 's' : ''} encontrado{result.paginacion.total !== 1 ? 's' : ''}
                        </p>
                    </div>
                    <ProductFilters
                        categorias={categorias}
                        currentCategoria={params.categoria}
                        currentOrden={params.ordenPor}
                    />
                </div>

                {/* Product grid */}
                <Suspense
                    fallback={
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <Skeleton key={i} className="h-64 rounded-xl" />
                            ))}
                        </div>
                    }
                >
                    <ProductGrid productos={result.productos} />
                </Suspense>

                {/* Pagination */}
                {result.paginacion.totalPaginas > 1 && (
                    <div className="mt-8">
                        <ProductPagination paginacion={result.paginacion} />
                    </div>
                )}
            </main>
        </div>
    );
}
