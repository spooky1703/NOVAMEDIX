import { NextRequest, NextResponse } from 'next/server';
import { obtenerProductosCatalogo } from '@/lib/db/productos.queries';
import { crearProducto } from '@/lib/db/productos.mutations';
import {
    ProductoCreateSchema,
    ProductoFiltrosSchema,
} from '@/lib/validations/producto.schema';
import { serializarProducto } from '@/types';
import { ERROR_CODES } from '@/lib/constants';

/** GET /api/productos — List products with filters */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const filtrosRaw = Object.fromEntries(searchParams.entries());
        const filtros = ProductoFiltrosSchema.parse(filtrosRaw);

        const result = await obtenerProductosCatalogo(filtros);

        return NextResponse.json({
            success: true,
            data: {
                productos: result.productos,
                paginacion: result.paginacion,
            },
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: ERROR_CODES.INTERNAL_ERROR,
                    message: 'Error al obtener productos',
                },
            },
            { status: 500 }
        );
    }
}

/** POST /api/productos — Create a new product */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const data = ProductoCreateSchema.parse(body);
        const producto = await crearProducto(data);

        return NextResponse.json(
            {
                success: true,
                data: serializarProducto(producto),
                message: 'Producto creado exitosamente',
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof Error && error.message.includes('Unique constraint')) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.VALIDATION_ERROR,
                        message: 'Ya existe un producto con esa clave',
                    },
                },
                { status: 409 }
            );
        }

        console.error('Error creating product:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: ERROR_CODES.INTERNAL_ERROR,
                    message: 'Error al crear producto',
                },
            },
            { status: 500 }
        );
    }
}
