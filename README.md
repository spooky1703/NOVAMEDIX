# NovaMedix — Catálogo Farmacéutico Digital

Sistema web full-stack para gestionar el catálogo de una distribuidora farmacéutica. Permite importar productos masivamente desde Excel, administrar el catálogo y ofrecer una interfaz pública de consulta.

## Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Framework** | Next.js 16 (App Router) |
| **Lenguaje** | TypeScript (strict) |
| **Base de datos** | PostgreSQL + Prisma ORM 6 |
| **Autenticación** | NextAuth.js v5 (beta) |
| **Validación** | Zod |
| **Excel** | SheetJS (xlsx) |
| **UI** | Tailwind CSS + shadcn/ui |
| **Iconos** | lucide-react |

### ¿Por qué Supabase PostgreSQL?

Se eligió Supabase sobre Vercel Postgres por:
- **Mayor almacenamiento gratuito** (500MB vs 256MB)
- **Dashboard integrado** con SQL editor para debugging
- **Extensibilidad** si el proyecto evoluciona (Storage, Auth adicional)

> **Nota**: El código usa Prisma estándar sin dependencias de Supabase. Cualquier instancia de PostgreSQL funciona cambiando `DATABASE_URL`.

## Prerequisitos

- Node.js 18+
- PostgreSQL (local, Supabase, o cualquier instancia)
- npm

## Instalación

```bash
# 1. Clonar el repositorio
git clone <tu-repositorio>
cd novamedix

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tu DATABASE_URL y un AUTH_SECRET

# 4. Generar Prisma Client
npx prisma generate

# 5. Ejecutar migraciones
npx prisma migrate dev --name init

# 6. Crear usuario admin por defecto
npx prisma db seed

# 7. Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Credenciales de Admin

| Campo | Valor |
|-------|-------|
| Email | `admin@farmacia.com` |
| Password | `Admin123!` |

## Estructura del Archivo Excel

El sistema acepta archivos `.xlsx` o `.xls` con las siguientes columnas (a partir de cualquier fila):

| Columna | Descripción | Ejemplo |
|---------|-------------|---------|
| `Clave` | Identificador único del producto | `007501446000010` |
| `Codigo` | Nombre/descripción del producto | `PARACETAMOL 500MG C/10` |
| `Precio` | Precio unitario | `45.50` |

### Notas sobre el procesamiento:
- El sistema detecta automáticamente la fila de encabezados
- Las filas vacías y separadores alfabéticos se omiten
- Los productos duplicados (misma clave) se deduplicados (se mantiene el último)
- Los precios con formato `$1,234.56` se sanitizan automáticamente

## Endpoints de API

### Productos
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `GET` | `/api/productos` | Listar con filtros y paginación | No |
| `POST` | `/api/productos` | Crear producto | Sí |
| `GET` | `/api/productos/[id]` | Obtener producto | No |
| `PUT` | `/api/productos/[id]` | Actualizar producto | Sí |
| `DELETE` | `/api/productos/[id]` | Eliminar producto | Sí |

### Importación
| Método | Ruta | Descripción | Auth |
|--------|------|-------------|------|
| `POST` | `/api/importar` | Importar archivo Excel | Sí |

### Parámetros de consulta para `/api/productos`

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `busqueda` | string | Buscar por nombre, clave o código |
| `categoria` | string | Filtrar por categoría |
| `precioMin` | number | Precio mínimo |
| `precioMax` | number | Precio máximo |
| `ordenPor` | string | `nombre_asc`, `nombre_desc`, `precio_asc`, `precio_desc` |
| `pagina` | number | Número de página (default: 1) |
| `porPagina` | number | Productos por página (default: 24, max: 100) |
| `activo` | string | `true`, `false`, o `all` |

## Variables de Entorno

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth
AUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Deployment a Vercel

1. Conectar repositorio en [vercel.com](https://vercel.com)
2. Configurar variables de entorno en el dashboard de Vercel
3. El build se ejecutará automáticamente
4. Después del primer deploy, ejecutar migraciones:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

## Troubleshooting

### "Cannot find module '@prisma/client'"
```bash
npx prisma generate
```

### "Database connection failed"
Verificar que `DATABASE_URL` es correcta y la base de datos está accesible.

### "NEXTAUTH_SECRET is not set"
Generar un secret: `openssl rand -base64 32` y agregarlo como `AUTH_SECRET` en `.env.local`.

### El Excel no se importa correctamente
- Verificar que el archivo tiene las columnas `Clave`, `Codigo`, `Precio`
- El archivo no debe exceder 10MB
- Solo se aceptan formatos `.xlsx` y `.xls`
