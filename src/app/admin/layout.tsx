'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
    LayoutDashboard,
    Package,
    Upload,
    History,
    LogOut,
    Menu,
    X,
    ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/productos', label: 'Productos', icon: Package },
    { href: '/admin/importar', label: 'Importar Excel', icon: Upload },
    { href: '/admin/historial', label: 'Historial', icon: History },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-white transition-transform lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Logo */}
                <div className="flex h-16 items-center justify-between border-b px-4">
                    <Link href="/admin" className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                            <Package className="h-4 w-4" />
                        </div>
                        <span className="text-lg font-bold text-slate-900">
                            Nova<span className="text-emerald-600">Medix</span>
                        </span>
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                {/* Nav items */}
                <nav className="flex-1 space-y-1 px-3 py-4">
                    {navItems.map((item) => {
                        const isActive =
                            item.href === '/admin'
                                ? pathname === '/admin'
                                : pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                                        ? 'bg-emerald-50 text-emerald-700'
                                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <item.icon className={`h-5 w-5 ${isActive ? 'text-emerald-600' : ''}`} />
                                {item.label}
                                {isActive && <ChevronRight className="ml-auto h-4 w-4" />}
                            </Link>
                        );
                    })}
                </nav>

                {/* User section */}
                <div className="border-t p-4">
                    <div className="mb-3 rounded-lg bg-slate-50 p-3">
                        <p className="text-sm font-medium text-slate-900">
                            {session?.user?.name || 'Admin'}
                        </p>
                        <p className="text-xs text-slate-500">{session?.user?.email}</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/catalogo" className="flex-1">
                            <Button variant="outline" size="sm" className="w-full text-xs">
                                Ver catálogo
                            </Button>
                        </Link>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-400 hover:text-red-500"
                            onClick={() => signOut({ callbackUrl: '/login' })}
                        >
                            <LogOut className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex flex-1 flex-col">
                {/* Top bar (mobile) */}
                <header className="flex h-16 items-center gap-4 border-b bg-white px-4 lg:hidden">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <span className="text-lg font-bold text-slate-900">
                        Nova<span className="text-emerald-600">Medix</span>
                    </span>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
