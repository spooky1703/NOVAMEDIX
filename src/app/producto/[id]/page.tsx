import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Package, Tag, Hash, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { obtenerProductoPorId } from '@/lib/db/productos.queries';

interface ProductoDetailProps {
    params: Promise<{ id: string }>;
}

export default async function ProductoDetailPage({ params }: ProductoDetailProps) {
    const { id } = await params;
    const producto = await obtenerProductoPorId(id);

    if (!producto) {
        notFound();
    }

    const precio = Number(producto.precio);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="border-b bg-white">
                <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
                    <Link href="/catalogo">
                        <Button variant="ghost" size="sm" className="gap-1">
                            <ArrowLeft className="h-4 w-4" />
                            Volver al catálogo
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                <Card className="overflow-hidden border-slate-200 shadow-sm">
                    <div className="grid md:grid-cols-2">
                        {/* Image */}
                        <div className="flex items-center justify-center bg-gradient-to-br from-slate-50 to-emerald-50/30 p-12">
                            <Package className="h-32 w-32 text-emerald-200" />
                        </div>

                        {/* Details */}
                        <CardContent className="flex flex-col justify-center p-8">
                            {producto.categoria && (
                                <Badge variant="secondary" className="mb-3 w-fit">
                                    {producto.categoria}
                                </Badge>
                            )}

                            <h1 className="text-2xl font-bold text-slate-900">
                                {producto.nombre || 'Sin nombre'}
                            </h1>

                            {producto.descripcion && (
                                <p className="mt-3 text-sm text-slate-600">{producto.descripcion}</p>
                            )}

                            <div className="mt-6">
                                <p className="text-3xl font-bold text-emerald-600">
                                    ${precio.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    <span className="ml-2 text-sm font-normal text-slate-400">MXN</span>
                                </p>
                            </div>

                            <Separator className="my-6" />

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <Tag className="h-4 w-4 text-slate-400" />
                                    <span className="font-medium text-slate-600">Clave:</span>
                                    <span className="font-mono text-slate-900">{producto.clave}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Hash className="h-4 w-4 text-slate-400" />
                                    <span className="font-medium text-slate-600">Código:</span>
                                    <span className="font-mono text-slate-900">{producto.codigo}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <Calendar className="h-4 w-4 text-slate-400" />
                                    <span className="font-medium text-slate-600">Actualizado:</span>
                                    <span className="text-slate-900">
                                        {new Date(producto.updatedAt).toLocaleDateString('es-MX', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric',
                                        })}
                                    </span>
                                </div>
                            </div>

                            <Badge
                                variant={producto.activo ? 'default' : 'secondary'}
                                className={`mt-6 w-fit ${producto.activo ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-slate-100 text-slate-500'}`}
                            >
                                {producto.activo ? 'Disponible' : 'No disponible'}
                            </Badge>
                        </CardContent>
                    </div>
                </Card>
            </main>
        </div>
    );
}
