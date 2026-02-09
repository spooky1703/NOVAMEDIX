import { prisma } from '@/lib/db/prisma';
import type { ProductoCreate, ProductoUpdate } from '@/lib/validations/producto.schema';

/** Creates a new product */
export async function crearProducto(data: ProductoCreate) {
    return prisma.producto.create({ data });
}

/** Updates an existing product by ID */
export async function actualizarProducto(id: string, data: ProductoUpdate) {
    return prisma.producto.update({ where: { id }, data });
}

/** Deletes a product by ID */
export async function eliminarProducto(id: string) {
    return prisma.producto.delete({ where: { id } });
}

/** Toggles a product's active state */
export async function toggleProductoActivo(id: string) {
    const producto = await prisma.producto.findUnique({ where: { id } });
    if (!producto) throw new Error('Producto no encontrado');

    return prisma.producto.update({
        where: { id },
        data: { activo: !producto.activo },
    });
}

/**
 * Bulk upsert of products from Excel import.
 * Uses parallel batches of upserts (no interactive transactions)
 * to avoid timeout issues with remote databases like Supabase.
 */
export async function importarProductosMasivo(
    productos: ProductoCreate[],
    metadata: {
        nombreArchivo: string;
        importadoPor: string;
    }
) {
    const startTime = Date.now();
    let creados = 0;
    let actualizados = 0;
    const errores: Array<{ index: number; error: string }> = [];

    try {
        // Process in small concurrent batches to maximize speed
        // without overwhelming the connection pool
        const BATCH_SIZE = 25;

        for (let i = 0; i < productos.length; i += BATCH_SIZE) {
            const batch = productos.slice(i, i + BATCH_SIZE);

            // Run each batch concurrently with Promise.allSettled
            const results = await Promise.allSettled(
                batch.map(async (producto, batchIndex) => {
                    const globalIdx = i + batchIndex;
                    const result = await prisma.producto.upsert({
                        where: { clave: producto.clave },
                        update: {
                            codigo: producto.codigo,
                            nombre: producto.nombre,
                            precio: producto.precio,
                            categoria: producto.categoria,
                        },
                        create: producto,
                    });

                    // Check if it was created or updated by comparing createdAt vs updatedAt
                    const isNew =
                        result.createdAt.getTime() === result.updatedAt.getTime() ||
                        Date.now() - result.createdAt.getTime() < 5000;

                    return { globalIdx, isNew };
                })
            );

            // Process results
            for (const result of results) {
                if (result.status === 'fulfilled') {
                    if (result.value.isNew) {
                        creados++;
                    } else {
                        actualizados++;
                    }
                } else {
                    errores.push({
                        index: i + 2,
                        error:
                            result.reason instanceof Error
                                ? result.reason.message
                                : 'Error desconocido',
                    });
                }
            }
        }

        // Log the import
        await prisma.importacionLog.create({
            data: {
                nombreArchivo: metadata.nombreArchivo,
                totalFilas: productos.length,
                productosCreados: creados,
                productosActualizados: actualizados,
                erroresCount: errores.length,
                erroresDetalle: errores.length > 0 ? errores : undefined,
                estado:
                    errores.length === 0
                        ? 'EXITOSO'
                        : errores.length === productos.length
                            ? 'FALLIDO'
                            : 'PARCIAL',
                duracionMs: Date.now() - startTime,
                importadoPor: metadata.importadoPor,
            },
        });

        return {
            success: true,
            creados,
            actualizados,
            errores,
            duracionMs: Date.now() - startTime,
        };
    } catch (error) {
        // Log the failed import
        await prisma.importacionLog.create({
            data: {
                nombreArchivo: metadata.nombreArchivo,
                totalFilas: productos.length,
                productosCreados: creados,
                productosActualizados: actualizados,
                erroresCount: productos.length,
                erroresDetalle: [
                    { index: 0, error: error instanceof Error ? error.message : 'Error desconocido' },
                ],
                estado: 'FALLIDO',
                duracionMs: Date.now() - startTime,
                importadoPor: metadata.importadoPor,
            },
        });

        throw new Error(
            `Error en importación masiva: ${error instanceof Error ? error.message : error}`
        );
    }
}
