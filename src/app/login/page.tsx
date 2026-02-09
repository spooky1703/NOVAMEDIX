'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Package, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const result = await signIn('credentials', {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError('Credenciales incorrectas. Por favor intenta de nuevo.');
            } else {
                router.push('/admin');
                router.refresh();
            }
        } catch {
            setError('Error al iniciar sesión. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-emerald-50/30 to-teal-50/20 p-4">
            <div className="absolute inset-0 -z-10">
                <div className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-emerald-100/40 blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-teal-100/40 blur-3xl" />
            </div>

            <Card className="w-full max-w-md border-slate-200 shadow-xl">
                <CardHeader className="space-y-3 text-center">
                    <Link href="/" className="mx-auto flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
                            <Package className="h-5 w-5" />
                        </div>
                        <span className="text-xl font-bold text-slate-900">
                            Nova<span className="text-emerald-600">Medix</span>
                        </span>
                    </Link>
                    <CardTitle className="text-2xl font-bold">Panel de Administración</CardTitle>
                    <CardDescription>
                        Ingresa tus credenciales para acceder al panel
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@farmacia.com"
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                disabled={loading}
                            />
                        </div>
                        <Button
                            type="submit"
                            className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            ) : (
                                <LogIn className="h-4 w-4" />
                            )}
                            {loading ? 'Ingresando...' : 'Ingresar'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
