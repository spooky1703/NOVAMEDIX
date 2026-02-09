import Link from 'next/link';
import { Search, Package, ArrowRight, Shield, Zap, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
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
          <div className="flex items-center gap-3">
            <Link href="/catalogo">
              <Button variant="ghost" className="text-slate-600 hover:text-emerald-600">
                Catálogo
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-emerald-100/50 blur-3xl" />
          <div className="absolute right-0 top-1/4 h-[400px] w-[400px] rounded-full bg-teal-50/50 blur-3xl" />
        </div>
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
              <Zap className="h-3.5 w-3.5" />
              Precios actualizados diariamente
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Tu distribuidora farmacéutica{' '}
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                digital
              </span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Consulta nuestro catálogo completo de más de 1,600 productos farmacéuticos.
              Precios actualizados, búsqueda instantánea y acceso desde cualquier dispositivo.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/catalogo">
                <Button size="lg" className="h-12 gap-2 bg-emerald-600 px-8 text-base hover:bg-emerald-700">
                  <Search className="h-4 w-4" />
                  Explorar catálogo
                </Button>
              </Link>
              <Link href="/catalogo">
                <Button variant="outline" size="lg" className="h-12 gap-2 px-8 text-base">
                  Ver todos los productos
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t bg-white py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="group relative rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 transition-colors group-hover:bg-emerald-100">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Búsqueda instantánea</h3>
              <p className="text-slate-600">
                Encuentra cualquier producto por nombre, clave o código en milisegundos.
              </p>
            </div>
            <div className="group relative rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600 transition-colors group-hover:bg-teal-100">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Precios al día</h3>
              <p className="text-slate-600">
                Precios actualizados diariamente para que siempre tengas la información correcta.
              </p>
            </div>
            <div className="group relative rounded-2xl border border-slate-100 bg-white p-8 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition-colors group-hover:bg-sky-100">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-slate-900">Catálogo completo</h3>
              <p className="text-slate-600">
                Más de 1,600 productos disponibles para consulta en cualquier momento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-slate-50 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Heart className="h-4 w-4 text-emerald-500" />
              NovaMedix — Catálogo Farmacéutico Digital
            </div>
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} Todos los derechos reservados
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
