import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Tag, Hash, Calendar, MessageCircle, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { obtenerProductoPorId } from '@/lib/db/productos.queries';
import { ProductDetailImage } from '@/components/catalogo/ProductDetailImage';

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
    const phoneNumber = '527737360058';

    // Customize message
    const message = `Hola, me interesa el producto: *${producto.nombre}*\n(Clave: ${producto.clave || 'N/A'}).\n\n¿Me podrían confirmar si tienen disponible el modelo exacto que busco y su precio final?`;
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-30 border-b bg-white/80 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
                    <Link href="/">
                        <Button variant="ghost" size="sm" className="gap-2 text-slate-600 hover:text-teal-700">
                            <ArrowLeft className="h-4 w-4" />
                            Volver al catálogo
                        </Button>
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid gap-8 lg:grid-cols-2">
                    {/* Left Column: Image */}
                    <div className="flex flex-col gap-4">
                        <Card className="overflow-hidden border-slate-200 shadow-sm">
                            <div className="flex aspect-square items-center justify-center bg-gradient-to-br from-slate-50 to-teal-50/30 p-8">
                                <ProductDetailImage
                                    src={producto.imagen}
                                    alt={producto.nombre || producto.codigo}
                                />
                            </div>
                        </Card>

                        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold">Importante: Imagen de Referencia</p>
                                    <p className="mt-1 text-amber-700/80">
                                        La imagen mostrada es ilustrativa y puede no corresponder exactamente al lote actual.
                                        Por favor, confirma el modelo exacto y presentación al realizar tu pedido.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="flex flex-col">
                        <div className="mb-6">
                            {producto.categoria && (
                                <Badge variant="secondary" className="mb-4 bg-teal-50 text-teal-700 hover:bg-teal-100">
                                    {producto.categoria}
                                </Badge>
                            )}

                            <h1 className="text-3xl font-bold text-slate-900 leading-tight">
                                {producto.nombre || 'Producto sin nombre'}
                            </h1>

                            {producto.descripcion && (
                                <p className="mt-4 text-slate-600 leading-relaxed">
                                    {producto.descripcion}
                                </p>
                            )}
                        </div>

                        <div className="mt-auto rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
                            <div className="flex items-baseline justify-between mb-6">
                                <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">Precio Unitario</span>
                                <span className="text-4xl font-bold text-teal-700">
                                    ${precio.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    <span className="ml-2 text-base font-normal text-slate-400">MXN</span>
                                </span>
                            </div>

                            <Separator className="mb-6" />

                            <div className="grid grid-cols-2 gap-4 text-sm mb-8">
                                <div className="flex flex-col gap-1">
                                    <span className="text-slate-500 flex items-center gap-2">
                                        <Tag className="h-3.5 w-3.5" /> Clave interna
                                    </span>
                                    <span className="font-mono font-medium text-slate-900 bg-slate-100 px-2 py-1 rounded w-fit">
                                        {producto.clave}
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-slate-500 flex items-center gap-2">
                                        <Hash className="h-3.5 w-3.5" /> Código
                                    </span>
                                    <span className="font-mono font-medium text-slate-900">
                                        {producto.codigo}
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <Button size="lg" className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-lg gap-2 shadow-lg shadow-teal-900/10" asChild>
                                    <a
                                        href={whatsappUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <MessageCircle className="h-5 w-5" />
                                        Ordenar / Preguntar Detalles
                                    </a>
                                </Button>
                                <p className="text-center text-xs text-slate-400">
                                    Te responderemos vía WhatsApp para confirmar existencias.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
