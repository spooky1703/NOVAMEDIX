import { Package, PackageX, DollarSign, Clock, TrendingUp, Upload } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { obtenerEstadisticas } from '@/lib/db/productos.queries';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const stats = await obtenerEstadisticas();

    const cards = [
        {
            title: 'Productos activos',
            value: stats.totalActivos.toLocaleString(),
            icon: Package,
            color: 'text-emerald-600 bg-emerald-50',
        },
        {
            title: 'Productos inactivos',
            value: stats.totalInactivos.toLocaleString(),
            icon: PackageX,
            color: 'text-slate-500 bg-slate-100',
        },
        {
            title: 'Precio promedio',
            value: `$${stats.precioPromedio.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            icon: DollarSign,
            color: 'text-blue-600 bg-blue-50',
        },
        {
            title: 'Última importación',
            value: stats.ultimaImportacion
                ? new Date(stats.ultimaImportacion.createdAt).toLocaleDateString('es-MX', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                })
                : 'Nunca',
            icon: Clock,
            color: 'text-amber-600 bg-amber-50',
        },
    ];

    return (
        <div>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Resumen general del catálogo farmacéutico
                    </p>
                </div>
                <Link href="/admin/importar">
                    <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                        <Upload className="h-4 w-4" />
                        Importar Excel
                    </Button>
                </Link>
            </div>

            {/* Stats grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card) => (
                    <Card key={card.title} className="border-slate-200 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">
                                {card.title}
                            </CardTitle>
                            <div className={`rounded-lg p-2 ${card.color}`}>
                                <card.icon className="h-4 w-4" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-slate-900">{card.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick actions */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Link href="/admin/productos">
                    <Card className="cursor-pointer border-slate-200 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-xl bg-emerald-50 p-3">
                                <Package className="h-6 w-6 text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Gestionar productos</h3>
                                <p className="text-sm text-slate-500">Ver, editar y eliminar productos</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/importar">
                    <Card className="cursor-pointer border-slate-200 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-xl bg-blue-50 p-3">
                                <Upload className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Actualizar precios</h3>
                                <p className="text-sm text-slate-500">Cargar archivo Excel actualizado</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href="/admin/historial">
                    <Card className="cursor-pointer border-slate-200 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md">
                        <CardContent className="flex items-center gap-4 p-6">
                            <div className="rounded-xl bg-amber-50 p-3">
                                <TrendingUp className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-slate-900">Ver historial</h3>
                                <p className="text-sm text-slate-500">Historial de importaciones</p>
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}
