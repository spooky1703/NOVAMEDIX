import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { parseExcelBuffer } from '@/lib/excel/parser';
import { processExcelRows } from '@/lib/excel/processor';
import { importarProductosMasivo } from '@/lib/db/productos.mutations';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE, ERROR_CODES } from '@/lib/constants';

/** POST /api/importar — Upload and process an Excel file */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json(
                {
                    success: false,
                    error: { code: ERROR_CODES.UNAUTHORIZED, message: 'No autenticado' },
                },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.FILE_ERROR,
                        message: 'No se proporcionó archivo',
                    },
                },
                { status: 400 }
            );
        }

        // Validate file type
        if (!ACCEPTED_FILE_TYPES.includes(file.type) && !file.name.match(/\.xlsx?$/i)) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.FILE_ERROR,
                        message: 'Formato de archivo no válido. Se aceptan .xlsx y .xls',
                    },
                },
                { status: 400 }
            );
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.FILE_ERROR,
                        message: `El archivo excede el tamaño máximo de ${MAX_FILE_SIZE / 1024 / 1024}MB`,
                    },
                },
                { status: 400 }
            );
        }

        // Parse Excel
        const buffer = await file.arrayBuffer();
        const parseResult = parseExcelBuffer(buffer);

        // Process and validate rows
        const processResult = processExcelRows(parseResult.rows);

        if (processResult.validProducts.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: {
                        code: ERROR_CODES.VALIDATION_ERROR,
                        message: 'No se encontraron productos válidos en el archivo',
                        details: processResult.errors,
                    },
                },
                { status: 400 }
            );
        }

        // Import to database
        const importResult = await importarProductosMasivo(
            processResult.validProducts,
            {
                nombreArchivo: file.name,
                importadoPor: session.user.email,
            }
        );

        return NextResponse.json({
            success: true,
            data: {
                ...importResult,
                totalFilas: parseResult.rows.length,
                filasOmitidas: parseResult.skippedRows,
                duplicadosRemovidos: processResult.duplicatesRemoved,
                erroresValidacion: processResult.errors,
            },
            message: `Importación completada: ${importResult.creados} creados, ${importResult.actualizados} actualizados`,
        });
    } catch (error) {
        console.error('Import error:', error);
        return NextResponse.json(
            {
                success: false,
                error: {
                    code: ERROR_CODES.INTERNAL_ERROR,
                    message:
                        error instanceof Error
                            ? error.message
                            : 'Error durante la importación',
                },
            },
            { status: 500 }
        );
    }
}
