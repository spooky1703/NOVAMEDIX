import * as XLSX from 'xlsx';

export interface ParsedExcelRow {
    CLAVE: string;
    CODIGO: string;
    PRECIO: number | string;
}

export interface ParseResult {
    rows: ParsedExcelRow[];
    totalRows: number;
    skippedRows: number;
    sheetName: string;
}

/**
 * Parses an Excel file buffer and extracts product rows.
 * Handles:
 * - Header detection (finds row with CLAVE/Clave, CODIGO/Codigo, PRECIO/Precio)
 * - Skips empty rows and alphabetical section dividers
 * - Sanitizes price values from currency format
 */
export function parseExcelBuffer(buffer: ArrayBuffer): ParseResult {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to array of arrays
    const rawData: (string | number | null | undefined)[][] = XLSX.utils.sheet_to_json(
        worksheet,
        {
            header: 1,
            defval: null,
            blankrows: true,
        }
    );

    // Find header row (look for Clave/CLAVE in first column)
    let headerRowIndex = -1;
    for (let i = 0; i < Math.min(rawData.length, 20); i++) {
        const row = rawData[i];
        if (row && row[0]) {
            const firstCell = String(row[0]).trim().toUpperCase();
            if (firstCell === 'CLAVE') {
                headerRowIndex = i;
                break;
            }
        }
    }

    if (headerRowIndex === -1) {
        throw new Error(
            'No se encontró la fila de encabezados. Se esperan columnas: Clave, Codigo, Precio'
        );
    }

    const rows: ParsedExcelRow[] = [];
    let skippedRows = 0;

    // Process data rows after header
    for (let i = headerRowIndex + 1; i < rawData.length; i++) {
        const row = rawData[i];
        if (!row) {
            skippedRows++;
            continue;
        }

        const clave = row[0];
        const codigo = row[1];
        const precio = row[2];

        // Skip empty rows
        if (clave === null && codigo === null && precio === null) {
            skippedRows++;
            continue;
        }

        // Skip alphabetical section dividers (single letter in first column, nothing else)
        if (
            clave &&
            !codigo &&
            (precio === null || precio === undefined) &&
            String(clave).trim().length <= 2
        ) {
            skippedRows++;
            continue;
        }

        // Skip rows without both clave and codigo
        if (!clave || !codigo) {
            skippedRows++;
            continue;
        }

        // Parse price
        let parsedPrecio: number | string = 0;
        if (typeof precio === 'number') {
            parsedPrecio = precio;
        } else if (typeof precio === 'string') {
            parsedPrecio = precio;
        }

        rows.push({
            CLAVE: String(clave).trim(),
            CODIGO: String(codigo).trim(),
            PRECIO: parsedPrecio,
        });
    }

    return {
        rows,
        totalRows: rawData.length - headerRowIndex - 1,
        skippedRows,
        sheetName,
    };
}
