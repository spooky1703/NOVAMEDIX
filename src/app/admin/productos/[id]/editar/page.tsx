'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import Link from 'next/link';

interface EditarProductoPageProps {
    params: Promise<{ id: string }>;
}

export default function EditarProductoPage({ params }: EditarProductoPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        clave: '',
        codigo: '',
        nombre: '',
        descripcion: '',
        precio: '',
        categoria: '',
        activo: true,
    });

    useEffect(() => {
        async function fetchProducto() {
            try {
                const res = await fetch(`/api/productos/${id}`);
                const data = await res.json();
                if (data.success) {
                    setForm({
                        clave: data.data.clave,
                        codigo: data.data.codigo,
                        nombre: data.data.nombre,
                        descripcion: data.data.descripcion || '',
                        precio: data.data.precio.toString(),
                        categoria: data.data.categoria || '',
                        activo: data.data.activo,
                    });
                } else {
                    toast.error('Producto no encontrado');
                    router.push('/admin/productos');
                }
            } catch {
                toast.error('Error al cargar producto');
            } finally {
                setLoading(false);
            }
        }
        fetchProducto();
    }, [id, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            const res = await fetch(`/api/productos/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    precio: parseFloat(form.precio),
                    descripcion: form.descripcion || undefined,
                    categoria: form.categoria || undefined,
                }),
            });

            const data = await res.json();

            if (data.success) {
                toast.success('Producto actualizado');
                router.push('/admin/productos');
            } else {
                toast.error(data.error?.message || 'Error al actualizar');
            }
        } catch {
            toast.error('Error al actualizar producto');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="mx-auto max-w-2xl space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-96 w-full rounded-lg" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl">
            <div className="mb-6">
                <Link href="/admin/productos">
                    <Button variant="ghost" size="sm" className="mb-2 gap-1">
                        <ArrowLeft className="h-4 w-4" />
                        Volver a productos
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">Editar Producto</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Modifica la información del producto
                </p>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Información del producto</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="clave">Clave</Label>
                                <Input
                                    id="clave"
                                    value={form.clave}
                                    onChange={(e) => setForm({ ...form, clave: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="codigo">Código</Label>
                                <Input
                                    id="codigo"
                                    value={form.codigo}
                                    onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nombre">Nombre</Label>
                            <Input
                                id="nombre"
                                value={form.nombre}
                                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="descripcion">Descripción</Label>
                            <Textarea
                                id="descripcion"
                                value={form.descripcion}
                                onChange={(e) =>
                                    setForm({ ...form, descripcion: e.target.value })
                                }
                                rows={3}
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="precio">Precio</Label>
                                <Input
                                    id="precio"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={form.precio}
                                    onChange={(e) => setForm({ ...form, precio: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="categoria">Categoría</Label>
                                <Input
                                    id="categoria"
                                    value={form.categoria}
                                    onChange={(e) =>
                                        setForm({ ...form, categoria: e.target.value })
                                    }
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <Link href="/admin/productos">
                                <Button variant="outline" type="button">
                                    Cancelar
                                </Button>
                            </Link>
                            <Button
                                type="submit"
                                disabled={saving}
                                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                            >
                                {saving ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                {saving ? 'Guardando...' : 'Guardar cambios'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
