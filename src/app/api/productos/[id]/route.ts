import { NextRequest, NextResponse } from 'next/server';
import { obtenerProductoPorId } from '@/lib/db/productos.queries';
import {
    actualizarProducto,
    eliminarProducto,
} from '@/lib/db/productos.mutations';
import { ProductoUpdateSchema } from '@/lib/validations/producto.schema';
import { serializarProducto } from '@/types';
import { ERROR_CODES } from '@/lib/constants';

interface RouteParams {
    params: Promise<{ id: string }>;
}

/** GET /api/productos/[id] */
export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const producto = await obtenerProductoPorId(id);

        if (!producto) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.NOT_FOUND,
                        message: 'Producto no encontrado',
                    },
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: serializarProducto(producto),
        });
    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: ERROR_CODES.INTERNAL_ERROR,
                    message: 'Error al obtener producto',
                },
            },
            { status: 500 }
        );
    }
}

/** PUT /api/productos/[id] */
export async function PUT(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const body = await request.json();
        const data = ProductoUpdateSchema.parse(body);
        const producto = await actualizarProducto(id, data);

        return NextResponse.json({
            success: true,
            data: serializarProducto(producto),
            message: 'Producto actualizado exitosamente',
        });
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: ERROR_CODES.INTERNAL_ERROR,
                    message: 'Error al actualizar producto',
                },
            },
            { status: 500 }
        );
    }
}

/** DELETE /api/productos/[id] */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        await eliminarProducto(id);

        return NextResponse.json({
            success: true,
            message: 'Producto eliminado exitosamente',
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: ERROR_CODES.INTERNAL_ERROR,
                    message: 'Error al eliminar producto',
                },
            },
            { status: 500 }
        );
    }
}
