import { z } from 'zod';

/** Validates a single row from the Excel file */
export const ProductoExcelRowSchema = z.object({
    CLAVE: z
        .string()
        .min(1, 'CLAVE es requerida')
        .max(50, 'CLAVE no puede exceder 50 caracteres')
        .trim(),

    CODIGO: z
        .string()
        .min(1, 'CODIGO es requerido')
        .max(255, 'CODIGO no puede exceder 255 caracteres')
        .trim(),

    PRECIO: z.union([
        z.number().positive('El precio debe ser mayor a 0'),
        z.string().transform((val) => {
            const cleaned = val.replace(/[$,\s]/g, '');
            const parsed = parseFloat(cleaned);
            if (isNaN(parsed) || parsed <= 0) {
                throw new Error('Precio inválido');
            }
            return parsed;
        }),
    ]),
});

/** Schema for creating a product */
export const ProductoCreateSchema = z.object({
    clave: z.string().min(1, 'Clave es requerida').max(50),
    codigo: z.string().max(255).default(''),
    nombre: z.string().max(255).default(''),
    descripcion: z.string().max(1000).optional(),
    precio: z.number().positive('El precio debe ser mayor a 0'),
    categoria: z.string().max(100).optional(),
    imagen: z.string().url('Debe ser una URL válida').max(1000).optional().or(z.literal('')),
    activo: z.boolean().default(true),
});

/** Schema for updating a product (all fields optional) */
export const ProductoUpdateSchema = ProductoCreateSchema.partial();

/** Schema for product search/filter query params */
export const ProductoFiltrosSchema = z.object({
    busqueda: z.string().optional(),
    categoria: z.string().optional(),
    precioMin: z.coerce.number().optional(),
    precioMax: z.coerce.number().optional(),
    activo: z
        .enum(['true', 'false', 'all'])
        .optional()
        .transform((val) => {
            if (val === 'all') return undefined;
            if (val === 'true') return true;
            if (val === 'false') return false;
            return undefined;
        }),
    ordenPor: z
        .enum([
            'nombre_asc',
            'nombre_desc',
            'precio_asc',
            'precio_desc',
            'clave_asc',
            'clave_desc',
        ])
        .optional()
        .default('nombre_asc'),
    pagina: z.coerce.number().int().positive().optional().default(1),
    porPagina: z.coerce.number().int().positive().max(100).optional().default(24),
});

export type ProductoExcelRow = z.infer<typeof ProductoExcelRowSchema>;
export type ProductoCreate = z.infer<typeof ProductoCreateSchema>;
export type ProductoUpdate = z.infer<typeof ProductoUpdateSchema>;
export type ProductoFiltros = z.infer<typeof ProductoFiltrosSchema>;
