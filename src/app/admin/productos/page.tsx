'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Producto {
    id: string;
    clave: string;
    codigo: string;
    nombre: string;
    precio: number;
    categoria: string | null;
    activo: boolean;
    updatedAt: string;
}

interface Paginacion {
    total: number;
    pagina: number;
    porPagina: number;
    totalPaginas: number;
}

export default function AdminProductosPage() {
    const router = useRouter();
    const [productos, setProductos] = useState<Producto[]>([]);
    const [paginacion, setPaginacion] = useState<Paginacion>({
        total: 0,
        pagina: 1,
        porPagina: 20,
        totalPaginas: 0,
    });
    const [busqueda, setBusqueda] = useState('');
    const [loading, setLoading] = useState(true);
    const [deleteDialog, setDeleteDialog] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchProductos = useCallback(async (pagina = 1, search = '') => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                pagina: pagina.toString(),
                porPagina: '20',
                activo: 'all',
            });
            if (search) params.set('busqueda', search);

            const res = await fetch(`/api/productos?${params}`);
            const data = await res.json();

            if (data.success) {
                setProductos(data.data.productos);
                setPaginacion(data.data.paginacion);
            }
        } catch {
            toast.error('Error al cargar productos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProductos();
    }, [fetchProductos]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProductos(1, busqueda);
        }, 300);
        return () => clearTimeout(timer);
    }, [busqueda, fetchProductos]);

    const handleDelete = async () => {
        if (!deleteDialog) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/productos/${deleteDialog}`, {
                method: 'DELETE',
            });
            if (res.ok) {
                toast.success('Producto eliminado');
                fetchProductos(paginacion.pagina, busqueda);
            } else {
                toast.error('Error al eliminar');
            }
        } catch {
            toast.error('Error al eliminar');
        } finally {
            setDeleting(false);
            setDeleteDialog(null);
        }
    };

    const handleToggle = async (id: string, currentActive: boolean) => {
        try {
            const res = await fetch(`/api/productos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ activo: !currentActive }),
            });
            if (res.ok) {
                toast.success(currentActive ? 'Producto desactivado' : 'Producto activado');
                fetchProductos(paginacion.pagina, busqueda);
            }
        } catch {
            toast.error('Error al actualizar');
        }
    };

    return (
        <div>
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Productos</h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {paginacion.total} producto{paginacion.total !== 1 ? 's' : ''} en total
                    </p>
                </div>
                <Link href="/admin/productos/nuevo">
                    <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="h-4 w-4" />
                        Nuevo producto
                    </Button>
                </Link>
            </div>

            {/* Search */}
            <div className="mb-4">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        placeholder="Buscar por nombre, clave o código..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50">
                            <TableHead className="font-semibold">Clave</TableHead>
                            <TableHead className="font-semibold">Nombre</TableHead>
                            <TableHead className="font-semibold">Precio</TableHead>
                            <TableHead className="font-semibold">Estado</TableHead>
                            <TableHead className="text-right font-semibold">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={5}>
                                        <div className="h-6 animate-pulse rounded bg-slate-100" />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : productos.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={5}
                                    className="py-12 text-center text-slate-500"
                                >
                                    No se encontraron productos
                                </TableCell>
                            </TableRow>
                        ) : (
                            productos.map((producto) => (
                                <TableRow key={producto.id} className="hover:bg-slate-50/50">
                                    <TableCell className="font-mono text-xs text-slate-600">
                                        {producto.clave}
                                    </TableCell>
                                    <TableCell className="max-w-xs truncate font-medium">
                                        {producto.nombre || 'Sin nombre'}
                                    </TableCell>
                                    <TableCell className="font-semibold text-emerald-600">
                                        ${producto.precio.toLocaleString('es-MX', {
                                            minimumFractionDigits: 2,
                                        })}
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant={producto.activo ? 'default' : 'secondary'}
                                            className={
                                                producto.activo
                                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'
                                                    : ''
                                            }
                                        >
                                            {producto.activo ? 'Activo' : 'Inactivo'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() =>
                                                    router.push(`/admin/productos/${producto.id}/editar`)
                                                }
                                            >
                                                <Edit className="h-4 w-4 text-slate-500" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() =>
                                                    handleToggle(producto.id, producto.activo)
                                                }
                                            >
                                                {producto.activo ? (
                                                    <EyeOff className="h-4 w-4 text-slate-500" />
                                                ) : (
                                                    <Eye className="h-4 w-4 text-slate-500" />
                                                )}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => setDeleteDialog(producto.id)}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-400" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {paginacion.totalPaginas > 1 && (
                <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Mostrando {(paginacion.pagina - 1) * paginacion.porPagina + 1} -{' '}
                        {Math.min(
                            paginacion.pagina * paginacion.porPagina,
                            paginacion.total
                        )}{' '}
                        de {paginacion.total}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={paginacion.pagina <= 1}
                            onClick={() => fetchProductos(paginacion.pagina - 1, busqueda)}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={paginacion.pagina >= paginacion.totalPaginas}
                            onClick={() => fetchProductos(paginacion.pagina + 1, busqueda)}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Delete dialog */}
            <Dialog open={!!deleteDialog} onOpenChange={() => setDeleteDialog(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>¿Eliminar producto?</DialogTitle>
                        <DialogDescription>
                            Esta acción no se puede deshacer. El producto será eliminado
                            permanentemente del catálogo.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialog(null)}>
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleting}
                        >
                            {deleting ? 'Eliminando...' : 'Eliminar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
