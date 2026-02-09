import { ImportacionLog } from '@prisma/client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { obtenerHistorialImportaciones } from '@/lib/db/productos.queries';
import { CheckCircle2, AlertCircle, XCircle, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

const estadoConfig = {
    EXITOSO: {
        label: 'Exitoso',
        icon: CheckCircle2,
        color: 'bg-emerald-100 text-emerald-700',
    },
    PARCIAL: {
        label: 'Parcial',
        icon: AlertCircle,
        color: 'bg-amber-100 text-amber-700',
    },
    FALLIDO: {
        label: 'Fallido',
        icon: XCircle,
        color: 'bg-red-100 text-red-700',
    },
};

export default async function HistorialPage() {
    const result = await obtenerHistorialImportaciones();

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">
                    Historial de Importaciones
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Registro de todas las importaciones de archivos Excel
                </p>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardContent className="p-0">
                    {result.importaciones.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <Clock className="mb-4 h-12 w-12 text-slate-300" />
                            <h3 className="text-lg font-semibold text-slate-900">
                                Sin importaciones
                            </h3>
                            <p className="mt-1 text-sm text-slate-500">
                                Aún no se han realizado importaciones de archivos Excel
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50">
                                    <TableHead className="font-semibold">Archivo</TableHead>
                                    <TableHead className="font-semibold">Fecha</TableHead>
                                    <TableHead className="font-semibold">Estado</TableHead>
                                    <TableHead className="font-semibold text-center">
                                        Creados
                                    </TableHead>
                                    <TableHead className="font-semibold text-center">
                                        Actualizados
                                    </TableHead>
                                    <TableHead className="font-semibold text-center">
                                        Errores
                                    </TableHead>
                                    <TableHead className="font-semibold">Duración</TableHead>
                                    <TableHead className="font-semibold">Usuario</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {result.importaciones.map((imp) => {
                                    const estado =
                                        estadoConfig[imp.estado as keyof typeof estadoConfig];
                                    const Icon = estado.icon;
                                    return (
                                        <TableRow key={imp.id} className="hover:bg-slate-50/50">
                                            <TableCell className="max-w-[200px] truncate font-medium">
                                                {imp.nombreArchivo}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-600">
                                                {new Date(imp.createdAt).toLocaleDateString('es-MX', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`gap-1 ${estado.color}`}>
                                                    <Icon className="h-3 w-3" />
                                                    {estado.label}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-center font-semibold text-emerald-600">
                                                {imp.productosCreados}
                                            </TableCell>
                                            <TableCell className="text-center font-semibold text-blue-600">
                                                {imp.productosActualizados}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {imp.erroresCount > 0 ? (
                                                    <span className="font-semibold text-amber-600">
                                                        {imp.erroresCount}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-400">0</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-500">
                                                {imp.duracionMs
                                                    ? `${(imp.duracionMs / 1000).toFixed(1)}s`
                                                    : '—'}
                                            </TableCell>
                                            <TableCell className="text-sm text-slate-500">
                                                {imp.importadoPor}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
