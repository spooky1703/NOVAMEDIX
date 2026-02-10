import { PrismaClient } from '@prisma/client';
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
 * Bulk smart import of products (Optimized).
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
    let erroresCount = 0;
    const errores: Array<{ index: number; error: string }> = [];

    try {
        // 1. Fetch all existing products (lightweight)
        const existentes = await prisma.producto.findMany({
            select: { id: true, clave: true, codigo: true }
        });

        // Map: "CLAVE|CODIGO" -> [ID1, ID2, ...] (List of IDs to handle duplicates)
        const mapaExistentes = new Map<string, string[]>();
        existentes.forEach(p => {
            const key = `${p.clave.trim()}|${p.codigo.trim()}`;
            const list = mapaExistentes.get(key) || [];
            list.push(p.id);
            mapaExistentes.set(key, list);
        });

        const toCreate: ProductoCreate[] = [];
        const toUpdate: { id: string; data: ProductoCreate }[] = [];

        // 2. Classify
        productos.forEach((p, index) => {
            const key = `${p.clave.toString().trim()}|${p.codigo.toString().trim()}`;

            if (mapaExistentes.has(key)) {
                // If found, queue update for ALL matching IDs
                const ids = mapaExistentes.get(key)!;
                ids.forEach(id => {
                    toUpdate.push({ id, data: p });
                });
            } else {
                toCreate.push(p);
            }
        });

        // 3. Bulk Create (Fast)
        if (toCreate.length > 0) {
            // Processing in chunks of 1000 just to be safe with query size limits
            const CHUNK_SIZE = 1000;
            for (let i = 0; i < toCreate.length; i += CHUNK_SIZE) {
                const chunk = toCreate.slice(i, i + CHUNK_SIZE);
                await prisma.producto.createMany({
                    data: chunk,
                    skipDuplicates: true
                });
                creados += chunk.length;
            }
        }

        // 4. Concurrent Updates
        if (toUpdate.length > 0) {
            const BATCH_SIZE = 50; // Parallelism limit

            // Process updates in batches
            for (let i = 0; i < toUpdate.length; i += BATCH_SIZE) {
                const batch = toUpdate.slice(i, i + BATCH_SIZE);

                const results = await Promise.allSettled(
                    batch.map(item =>
                        prisma.producto.update({
                            where: { id: item.id },
                            data: {
                                nombre: item.data.nombre,
                                precio: item.data.precio,
                                categoria: item.data.categoria,
                                // Trigger updatedAt
                                updatedAt: new Date()
                            }
                        })
                    )
                );

                results.forEach((res) => {
                    if (res.status === 'fulfilled') {
                        actualizados++;
                    } else {
                        erroresCount++;
                        // We push a generic error to avoid flooding DB with 3000 error messages if something goes wrong
                        if (errores.length < 50) {
                            errores.push({
                                index: -1,
                                error: `Update failed: ${res.reason}`
                            });
                        }
                    }
                });
            }
        }

        // Log the import
        await prisma.importacionLog.create({
            data: {
                nombreArchivo: metadata.nombreArchivo,
                totalFilas: productos.length,
                productosCreados: creados,
                productosActualizados: actualizados,
                erroresCount: erroresCount,
                erroresDetalle: errores.length > 0 ? errores : undefined,
                estado: erroresCount === 0 ? 'EXITOSO' : 'PARCIAL',
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
        // Log failure
        await prisma.importacionLog.create({
            data: {
                nombreArchivo: metadata.nombreArchivo,
                totalFilas: productos.length,
                productosCreados: creados,
                productosActualizados: actualizados,
                erroresCount: productos.length, // Assume all failed
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
