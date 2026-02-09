-- CreateEnum
CREATE TYPE "EstadoImportacion" AS ENUM ('EXITOSO', 'PARCIAL', 'FALLIDO');

-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('ADMIN', 'SUPERADMIN');

-- CreateTable
CREATE TABLE "productos" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL DEFAULT '',
    "descripcion" TEXT,
    "precio" DECIMAL(10,2) NOT NULL,
    "categoria" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "importaciones_log" (
    "id" TEXT NOT NULL,
    "nombreArchivo" TEXT NOT NULL,
    "totalFilas" INTEGER NOT NULL,
    "productosCreados" INTEGER NOT NULL,
    "productosActualizados" INTEGER NOT NULL,
    "erroresCount" INTEGER NOT NULL DEFAULT 0,
    "erroresDetalle" JSONB,
    "estado" "EstadoImportacion" NOT NULL,
    "duracionMs" INTEGER,
    "importadoPor" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "importaciones_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'ADMIN',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "productos_clave_key" ON "productos"("clave");

-- CreateIndex
CREATE INDEX "productos_nombre_idx" ON "productos"("nombre");

-- CreateIndex
CREATE INDEX "productos_clave_idx" ON "productos"("clave");

-- CreateIndex
CREATE INDEX "productos_codigo_idx" ON "productos"("codigo");

-- CreateIndex
CREATE INDEX "productos_categoria_idx" ON "productos"("categoria");

-- CreateIndex
CREATE INDEX "productos_activo_idx" ON "productos"("activo");

-- CreateIndex
CREATE INDEX "importaciones_log_createdAt_idx" ON "importaciones_log"("createdAt");

-- CreateIndex
CREATE INDEX "importaciones_log_estado_idx" ON "importaciones_log"("estado");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");
