export const APP_NAME = 'NovaMedix';
export const APP_DESCRIPTION = 'Catálogo farmacéutico digital';

export const PRODUCTS_PER_PAGE = 24;
export const ADMIN_PRODUCTS_PER_PAGE = 20;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_PRODUCTS_PER_IMPORT = 5000;
export const ACCEPTED_FILE_TYPES = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
];

export const SORT_OPTIONS = [
    { label: 'Nombre A-Z', value: 'nombre_asc' },
    { label: 'Nombre Z-A', value: 'nombre_desc' },
    { label: 'Precio menor', value: 'precio_asc' },
    { label: 'Precio mayor', value: 'precio_desc' },
] as const;

export const ERROR_CODES = {
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    FILE_ERROR: 'FILE_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
