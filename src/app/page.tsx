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
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* ─── HEADER ─── */}
      <header className="sticky top-0 z-40 bg-[#0f1b2d] shadow-lg">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center group">
            <div className="flex h-12 items-center rounded-lg bg-white px-3 py-1 transition-all group-hover:shadow-md">
              <img src="/logo.png" alt="NovaMedix Farmacéutica" className="h-9 w-auto" />
            </div>
          </Link>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="font-medium text-slate-300 hover:text-white hover:bg-white/10">
                Acceso Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden bg-[#0f1b2d] pb-16 pt-12">
        {/* Red accent wave – top right */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-[320px] w-[320px] rounded-full bg-red-600/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-10 h-[220px] w-[400px] rotate-12 rounded-full bg-blue-700/10 blur-2xl" />

        {/* Wave SVG bottom */}
        <svg className="pointer-events-none absolute bottom-0 left-0 right-0 w-full" viewBox="0 0 1440 120" preserveAspectRatio="none" style={{ height: '80px' }}>
          <path d="M0,40 C360,120 720,0 1080,60 C1260,90 1380,50 1440,40 L1440,120 L0,120 Z" fill="#f1f5f9" />
          <path d="M0,60 C240,100 480,20 720,60 C960,100 1200,30 1440,60 L1440,120 L0,120 Z" fill="#f1f5f9" opacity="0.5" />
        </svg>

        <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h1 className="mb-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Catálogo Farmacéutico Digital
          </h1>
          <p className="mb-10 text-base text-slate-300 sm:text-lg">
            Encuentra cientos de medicamentos y productos de salud al mejor precio.
          </p>

          <div className="mx-auto w-full max-w-2xl">
            <LiveSearch variant="hero" placeholder="Buscar medicamento, sustancia o clave..." />
          </div>

          {!hasFilters && (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-green-400" />
                <span>Precios actualizados</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Smartphone className="h-4 w-4 text-blue-400" />
                <span>Compatible con móvil</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── MAIN CONTENT ─── */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {/* Filters & Results Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {hasFilters ? (
              <h2 className="text-xl font-bold text-[#0f1b2d]">
                Resultados de búsqueda
              </h2>
            ) : (
              <h2 className="text-xl font-bold text-[#0f1b2d]">
                Productos Destacados
              </h2>
            )}
            <p className="text-sm text-slate-500">
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
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-80 rounded-xl bg-slate-200" />
              ))}
            </div>
          }
        >
          <ProductGrid productos={result.productos} />
        </Suspense>

        {/* Empty State */}
        {result.productos.length === 0 && (
          <div className="mt-12 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white py-16 text-center">
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
              className="mt-4 text-[#0f1b2d] hover:text-red-600 font-semibold"
              asChild
            >
              <Link href="/">
                Ver todos los productos
              </Link>
            </Button>
          </div>
        )}

        {/* Pagination */}
        {result.paginacion.totalPaginas > 1 && (
          <div className="mt-12 flex justify-center pt-8">
            <ProductPagination paginacion={result.paginacion} />
          </div>
        )}
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="mt-auto bg-[#0f1b2d] pt-12 pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="mb-4">
                <div className="inline-flex items-center rounded-lg bg-white px-3 py-1.5">
                  <img src="/logo.png" alt="NovaMedix Farmacéutica" className="h-10 w-auto" />
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Distribuidora farmacéutica comprometida con la calidad y el mejor precio.
              </p>
            </div>

            {/* Links Col 1 */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-300">
                Catálogo
              </h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><Link href="/" className="hover:text-white transition-colors">Medicamentos</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">Precios</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">Medios</Link></li>
              </ul>
            </div>

            {/* Links Col 2 */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-300">
                Soporte
              </h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><a href="https://wa.me/527737360058" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Contacto</a></li>
                <li><Link href="/" className="hover:text-white transition-colors">Acceso Admin</Link></li>
                <li><Link href="/" className="hover:text-white transition-colors">Pedidos de productos</Link></li>
              </ul>
            </div>

            {/* Links Col 3 */}
            <div>
              <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-300">
                Legal
              </h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li><span className="cursor-default">Aviso de privacidad</span></li>
                <li><span className="cursor-default">Términos y condiciones</span></li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-center">
            <p className="text-xs text-slate-500">
              © {new Date().getFullYear()} NovaMedix Farmacéutica. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
