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
 * Bulk smart import of products.
 * 1. Checks if product exists by (clave + codigo).
 * 2. If exists -> Update (preserves image, updates price/name).
 * 3. If not -> Create.
 * 
 * This avoids duplicate "garbage" records while allowing updates to catalog.
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
        // Process in small concurrent batches
        const BATCH_SIZE = 25;

        for (let i = 0; i < productos.length; i += BATCH_SIZE) {
            const batch = productos.slice(i, i + BATCH_SIZE);

            // Run each batch concurrently
            const results = await Promise.allSettled(
                batch.map(async (producto, batchIndex) => {
                    const globalIdx = i + batchIndex;

                    // SMART CHECK: Does this product exist?
                    // We match by CLAVE and CODIGO to identify it.
                    const existente = await prisma.producto.findFirst({
                        where: {
                            clave: producto.clave,
                            codigo: producto.codigo
                        },
                        select: { id: true }
                    });

                    if (existente) {
                        // UPDATE existing
                        await prisma.producto.update({
                            where: { id: existente.id },
                            data: {
                                nombre: producto.nombre,
                                precio: producto.precio,
                                categoria: producto.categoria,
                                // Don't update 'activo' or 'imagen' to preserve manual changes
                                updatedAt: new Date()
                            }
                        });
                        return { globalIdx, isNew: false };
                    } else {
                        // CREATE new
                        await prisma.producto.create({
                            data: producto
                        });
                        return { globalIdx, isNew: true };
                    }
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
        // Log import failure
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
