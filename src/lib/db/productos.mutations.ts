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
 * Uses a transaction to ensure atomicity.
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
        // Process in batches to avoid transaction timeout
        const BATCH_SIZE = 100;
        const batches = [];
        for (let i = 0; i < productos.length; i += BATCH_SIZE) {
            batches.push(productos.slice(i, i + BATCH_SIZE));
        }

        for (let batchIdx = 0; batchIdx < batches.length; batchIdx++) {
            const batch = batches[batchIdx];
            await prisma.$transaction(async (tx) => {
                for (let i = 0; i < batch.length; i++) {
                    const globalIdx = batchIdx * BATCH_SIZE + i;
                    try {
                        const producto = batch[i];
                        const existe = await tx.producto.findUnique({
                            where: { clave: producto.clave },
                        });

                        if (existe) {
                            await tx.producto.update({
                                where: { clave: producto.clave },
                                data: {
                                    codigo: producto.codigo,
                                    nombre: producto.nombre,
                                    precio: producto.precio,
                                    categoria: producto.categoria,
                                },
                            });
                            actualizados++;
                        } else {
                            await tx.producto.create({ data: producto });
                            creados++;
                        }
                    } catch (error) {
                        errores.push({
                            index: globalIdx + 2, // +2 accounts for header row and 0-index
                            error:
                                error instanceof Error ? error.message : 'Error desconocido',
                        });
                    }
                }
            });
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
