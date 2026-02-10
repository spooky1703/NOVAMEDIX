'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface ProductFiltersProps {
    categorias: string[];
    currentCategoria?: string;
    currentOrden?: string;
}

export function ProductFilters({
    categorias,
    currentCategoria,
    currentOrden,
}: ProductFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const updateParam = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value && value !== 'all') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        params.delete('pagina'); // Reset pagination on filter change
        router.push(`/?${params.toString()}`);
    };

    return (
        <div className="flex gap-3">
            {categorias.length > 0 && (
                <Select
                    value={currentCategoria || 'all'}
                    onValueChange={(value) => updateParam('categoria', value)}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Categoría" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todas las categorías</SelectItem>
                        {categorias.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                                {cat}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )}

            <Select
                value={currentOrden || 'nombre_asc'}
                onValueChange={(value) => updateParam('ordenPor', value)}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="nombre_asc">Nombre A-Z</SelectItem>
                    <SelectItem value="nombre_desc">Nombre Z-A</SelectItem>
                    <SelectItem value="precio_asc">Precio menor</SelectItem>
                    <SelectItem value="precio_desc">Precio mayor</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
}
