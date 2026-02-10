import { Suspense } from 'react';
import Link from 'next/link';
import { Package, Smartphone, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { obtenerProductosCatalogo, obtenerCategorias } from '@/lib/db/productos.queries';
import { ProductGrid } from '@/components/catalogo/ProductGrid';
import { ProductPagination } from '@/components/catalogo/ProductPagination';
import { ProductFilters } from '@/components/catalogo/ProductFilters';
import { LiveSearch } from '@/components/catalogo/LiveSearch';
import { Skeleton } from '@/components/ui/skeleton';

interface HomePageProps {
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

export default async function HomePage({ searchParams }: HomePageProps) {
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

  const hasFilters = params.busqueda || params.categoria;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white transition-all group-hover:scale-110 group-hover:bg-teal-700">
              <Package className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
              Nova<span className="text-teal-600">Medix</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-medium text-slate-500 hover:text-teal-700 hover:bg-teal-50">
                Acceso Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero Search Area */}
        <div className="mb-10 flex flex-col items-center justify-center text-center">
          {!hasFilters && (
            <>
              <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Catálogo Farmacéutico Digital
              </h1>
              <p className="mb-8 text-lg text-slate-500 max-w-xl mx-auto">
                Encuentra cientos de medicamentos y productos de salud al mejor precio.
              </p>
            </>
          )}

          <div className="w-full max-w-2xl transform transition-all duration-500 hover:scale-[1.01]">
            <LiveSearch variant="hero" placeholder="Buscar medicamento, sustancia o clave..." />
          </div>

          {!hasFilters && (
            <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-teal-500" />
                <span>Precios actualizados</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5 text-teal-500" />
                <span>Compatible con móvil</span>
              </div>
            </div>
          )}
        </div>

        {/* Filters & Results Header */}
        <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {hasFilters ? (
              <h2 className="text-xl font-bold text-teal-800">
                Resultados de búsqueda
              </h2>
            ) : (
              <h2 className="text-xl font-bold text-slate-800">
                Productos Destacados
              </h2>
            )}
            <p className="text-sm font-medium text-slate-500">
              {result.paginacion.total} producto{result.paginacion.total !== 1 ? 's' : ''} disponible{result.paginacion.total !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <ProductFilters
              categorias={categorias}
              currentCategoria={params.categoria}
              currentOrden={params.ordenPor}
            />
          </div>
        </div>

        {/* Products Grid */}
        <Suspense
          fallback={
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-72 rounded-xl bg-slate-200" />
              ))}
            </div>
          }
        >
          <ProductGrid productos={result.productos} />
        </Suspense>

        {/* Empty State */}
        {result.productos.length === 0 && (
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16 text-center">
            <div className="mb-4 rounded-full bg-slate-100 p-4">
              <Package className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              No encontramos lo que buscas
            </h3>
            <p className="max-w-md text-slate-500 mt-2">
              Intenta con otro término o verifica la ortografía.
            </p>
            <Button
              variant="link"
              className="mt-4 text-teal-600 hover:text-teal-700"
              onClick={() => window.location.href = '/'}
            >
              Ver todos los productos
            </Button>
          </div>
        )}

        {/* Pagination */}
        {result.paginacion.totalPaginas > 1 && (
          <div className="mt-12 flex justify-center border-t border-slate-200 pt-8">
            <ProductPagination paginacion={result.paginacion} />
          </div>
        )}
      </main>

      <footer className="mt-auto border-t bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} NovaMedix. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
