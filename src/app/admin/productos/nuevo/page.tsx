'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';

export default function NuevoProductoPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        clave: '',
        codigo: '',
        nombre: '',
        descripcion: '',
        precio: '',
        categoria: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/productos', {
                method: 'POST',
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
                toast.success('Producto creado exitosamente');
                router.push('/admin/productos');
            } else {
                toast.error(data.error?.message || 'Error al crear producto');
            }
        } catch {
            toast.error('Error al crear producto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-2xl">
            <div className="mb-6">
                <Link href="/admin/productos">
                    <Button variant="ghost" size="sm" className="mb-2 gap-1">
                        <ArrowLeft className="h-4 w-4" />
                        Volver a productos
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">Nuevo Producto</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Agrega un nuevo producto al catálogo
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
                                <Label htmlFor="clave">Clave *</Label>
                                <Input
                                    id="clave"
                                    value={form.clave}
                                    onChange={(e) => setForm({ ...form, clave: e.target.value })}
                                    placeholder="007501446000010"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="codigo">Código</Label>
                                <Input
                                    id="codigo"
                                    value={form.codigo}
                                    onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                                    placeholder="Código de barras"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="nombre">Nombre *</Label>
                            <Input
                                id="nombre"
                                value={form.nombre}
                                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                                placeholder="Nombre del producto"
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
                                placeholder="Descripción opcional del producto"
                                rows={3}
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="precio">Precio *</Label>
                                <Input
                                    id="precio"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={form.precio}
                                    onChange={(e) => setForm({ ...form, precio: e.target.value })}
                                    placeholder="0.00"
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
                                    placeholder="Categoría del producto"
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
                                disabled={loading}
                                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                            >
                                {loading ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                {loading ? 'Creando...' : 'Crear producto'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
