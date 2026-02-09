import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

export interface ProductoFiltros {
    busqueda?: string;
    categoria?: string;
    precioMin?: number;
    precioMax?: number;
    activo?: boolean;
    ordenPor?: 'nombre_asc' | 'nombre_desc' | 'precio_asc' | 'precio_desc' | 'clave_asc' | 'clave_desc';
    pagina?: number;
    porPagina?: number;
}

/**
 * Obtains a paginated list of products for the public catalog.
 * Supports search across nombre, codigo, and clave fields.
 */
export async function obtenerProductosCatalogo(filtros: ProductoFiltros) {
    const {
        busqueda,
        categoria,
        precioMin,
        precioMax,
        activo,
        ordenPor = 'nombre_asc',
        pagina = 1,
        porPagina = 24,
    } = filtros;

    const where: Prisma.ProductoWhereInput = {
        ...(activo !== undefined ? { activo } : { activo: true }),
        ...(busqueda && {
            OR: [
                { nombre: { contains: busqueda, mode: 'insensitive' as const } },
                { codigo: { contains: busqueda, mode: 'insensitive' as const } },
                { clave: { contains: busqueda, mode: 'insensitive' as const } },
            ],
        }),
        ...(categoria && { categoria }),
        ...((precioMin !== undefined || precioMax !== undefined) && {
            precio: {
                ...(precioMin !== undefined && { gte: precioMin }),
                ...(precioMax !== undefined && { lte: precioMax }),
            },
        }),
    };

    const orderBy = (): Prisma.ProductoOrderByWithRelationInput => {
        switch (ordenPor) {
            case 'nombre_desc':
                return { nombre: 'desc' };
            case 'precio_asc':
                return { precio: 'asc' };
            case 'precio_desc':
                return { precio: 'desc' };
            case 'clave_asc':
                return { clave: 'asc' };
            case 'clave_desc':
                return { clave: 'desc' };
            default:
                return { nombre: 'asc' };
        }
    };

    const [productos, total] = await Promise.all([
        prisma.producto.findMany({
            where,
            orderBy: orderBy(),
            skip: (pagina - 1) * porPagina,
            take: porPagina,
        }),
        prisma.producto.count({ where }),
    ]);

    return {
        productos,
        paginacion: {
            total,
            pagina,
            porPagina,
            totalPaginas: Math.ceil(total / porPagina),
        },
    };
}

/** Obtains a single product by its ID */
export async function obtenerProductoPorId(id: string) {
    return prisma.producto.findUnique({ where: { id } });
}

/** Obtains all distinct categories */
export async function obtenerCategorias() {
    const categorias = await prisma.producto.findMany({
        where: { activo: true, categoria: { not: null } },
        select: { categoria: true },
        distinct: ['categoria'],
        orderBy: { categoria: 'asc' },
    });
    return categorias.map((c) => c.categoria).filter(Boolean) as string[];
}

/** Dashboard statistics */
export async function obtenerEstadisticas() {
    const [totalActivos, totalInactivos, precioPromedio, ultimaImportacion] =
        await Promise.all([
            prisma.producto.count({ where: { activo: true } }),
            prisma.producto.count({ where: { activo: false } }),
            prisma.producto.aggregate({
                _avg: { precio: true },
                where: { activo: true },
            }),
            prisma.importacionLog.findFirst({
                orderBy: { createdAt: 'desc' },
            }),
        ]);

    return {
        totalActivos,
        totalInactivos,
        precioPromedio: precioPromedio._avg.precio
            ? Number(precioPromedio._avg.precio)
            : 0,
        ultimaImportacion,
    };
}

/** Obtains the import history log */
export async function obtenerHistorialImportaciones(
    pagina: number = 1,
    porPagina: number = 20
) {
    const [importaciones, total] = await Promise.all([
        prisma.importacionLog.findMany({
            orderBy: { createdAt: 'desc' },
            skip: (pagina - 1) * porPagina,
            take: porPagina,
        }),
        prisma.importacionLog.count(),
    ]);

    return {
        importaciones,
        paginacion: {
            total,
            pagina,
            porPagina,
            totalPaginas: Math.ceil(total / porPagina),
        },
    };
}
