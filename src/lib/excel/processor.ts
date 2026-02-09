import {
    ProductoExcelRowSchema,
    type ProductoCreate,
} from '@/lib/validations/producto.schema';
import type { ParsedExcelRow } from './parser';

export interface ProcessResult {
    validProducts: ProductoCreate[];
    errors: Array<{ row: number; error: string }>;
    duplicatesRemoved: number;
}

/**
 * Processes parsed Excel rows:
 * 1. Validates each row with Zod
 * 2. Deduplicates by CLAVE (keeps last occurrence — latest price)
 * 3. Maps Excel columns to DB schema
 */
export function processExcelRows(rows: ParsedExcelRow[]): ProcessResult {
    const errors: Array<{ row: number; error: string }> = [];
    const validatedRows: Array<{ index: number; data: ProductoCreate }> = [];

    for (let i = 0; i < rows.length; i++) {
        const result = ProductoExcelRowSchema.safeParse(rows[i]);

        if (!result.success) {
            errors.push({
                row: i + 2, // +2 for header offset and 1-based indexing
                error: result.error.issues.map((e) => e.message).join(', '),
            });
            continue;
        }

        const row = result.data;
        const precio =
            typeof row.PRECIO === 'string' ? parseFloat(row.PRECIO) : row.PRECIO;

        validatedRows.push({
            index: i,
            data: {
                clave: row.CLAVE,
                codigo: row.CLAVE, // Use clave as codigo since they're the same in the Excel
                nombre: row.CODIGO, // Excel's CODIGO column is actually the product name
                precio,
                activo: true,
            },
        });
    }

    // Deduplicate by clave — keep last occurrence (latest price update)
    const deduped = new Map<string, ProductoCreate>();
    for (const { data } of validatedRows) {
        deduped.set(data.clave, data);
    }

    const duplicatesRemoved = validatedRows.length - deduped.size;

    return {
        validProducts: Array.from(deduped.values()),
        errors,
        duplicatesRemoved,
    };
}
