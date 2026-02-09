import { Producto, ImportacionLog } from '@prisma/client';

/** Product with serialized Decimal for client use */
export interface ProductoSerializado {
    id: string;
    clave: string;
    codigo: string;
    nombre: string;
    descripcion: string | null;
    precio: number;
    categoria: string | null;
    activo: boolean;
    createdAt: string;
    updatedAt: string;
}

/** Pagination info returned by list endpoints */
export interface Paginacion {
    total: number;
    pagina: number;
    porPagina: number;
    totalPaginas: number;
}

/** Standard API success response */
export interface ApiResponse<T = unknown> {
    success: true;
    data: T;
    message?: string;
}

/** Standard API error response */
export interface ApiError {
    success: false;
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
}

/** Import result returned after Excel processing */
export interface ImportResult {
    success: boolean;
    creados: number;
    actualizados: number;
    errores: Array<{ index: number; error: string }>;
    duracionMs: number;
    duplicatesRemoved?: number;
}

/** Dashboard stats */
export interface DashboardStats {
    totalActivos: number;
    totalInactivos: number;
    precioPromedio: number;
    ultimaImportacion: ImportacionLog | null;
}

/** Serializes a Prisma Producto to a plain object safe for JSON */
export function serializarProducto(producto: Producto): ProductoSerializado {
    return {
        ...producto,
        precio: Number(producto.precio),
        createdAt: producto.createdAt.toISOString(),
        updatedAt: producto.updatedAt.toISOString(),
    };
}
