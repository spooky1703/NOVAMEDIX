import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

/**
 * GET /api/productos/sugerencias?q=parace
 * Returns up to 8 distinct product names matching the query.
 * Lightweight endpoint for autocomplete — no prices, no images.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();

    if (!q || q.length < 2) {
        return NextResponse.json([]);
    }

    try {
        const productos = await prisma.producto.findMany({
            where: {
                activo: true,
                OR: [
                    { nombre: { contains: q, mode: 'insensitive' } },
                    { codigo: { contains: q, mode: 'insensitive' } },
                    { clave: { contains: q, mode: 'insensitive' } },
                ],
            },
            select: {
                id: true,
                nombre: true,
                clave: true,
            },
            orderBy: { nombre: 'asc' },
            take: 10,
        });

        // Deduplicate by name (some products share names with different claves)
        const seen = new Set<string>();
        const suggestions = productos
            .filter((p) => {
                const key = p.nombre.toLowerCase();
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            })
            .map((p) => ({
                id: p.id,
                nombre: p.nombre,
                clave: p.clave,
            }));

        return NextResponse.json(suggestions);
    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return NextResponse.json([]);
    }
}
