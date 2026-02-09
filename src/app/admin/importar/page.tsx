'use client';

import { useState, useRef } from 'react';
import {
    Upload,
    FileSpreadsheet,
    CheckCircle2,
    AlertCircle,
    X,
    Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ImportResult {
    success: boolean;
    creados: number;
    actualizados: number;
    errores: Array<{ index: number; error: string }>;
    totalFilas: number;
    filasOmitidas: number;
    duplicadosRemovidos: number;
    erroresValidacion: Array<{ row: number; error: string }>;
    duracionMs: number;
}

export default function ImportarPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.name.match(/\.xlsx?$/i)) {
            setFile(droppedFile);
            setResult(null);
        } else {
            toast.error('Solo se aceptan archivos .xlsx o .xls');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setProgress(10);

        try {
            const formData = new FormData();
            formData.append('file', file);

            setProgress(30);

            const res = await fetch('/api/importar', {
                method: 'POST',
                body: formData,
            });

            setProgress(80);

            const data = await res.json();

            setProgress(100);

            if (data.success) {
                setResult(data.data);
                toast.success(data.message);
            } else {
                toast.error(data.error?.message || 'Error durante la importación');
            }
        } catch {
            toast.error('Error al subir archivo');
        } finally {
            setUploading(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className="mx-auto max-w-3xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Importar Excel</h1>
                <p className="mt-1 text-sm text-slate-500">
                    Carga un archivo Excel para importar o actualizar productos masivamente
                </p>
            </div>

            {/* Upload area */}
            <Card className="mb-6 border-slate-200 shadow-sm">
                <CardContent className="p-6">
                    <div
                        className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-colors ${dragActive
                                ? 'border-emerald-400 bg-emerald-50'
                                : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                            }`}
                        onDragOver={(e) => {
                            e.preventDefault();
                            setDragActive(true);
                        }}
                        onDragLeave={() => setDragActive(false)}
                        onDrop={handleDrop}
                    >
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        {!file ? (
                            <div className="space-y-4">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
                                    <Upload className="h-7 w-7 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-base font-medium text-slate-700">
                                        Arrastra tu archivo Excel aquí
                                    </p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        o{' '}
                                        <button
                                            onClick={() => inputRef.current?.click()}
                                            className="font-medium text-emerald-600 hover:text-emerald-700"
                                        >
                                            selecciona un archivo
                                        </button>
                                    </p>
                                    <p className="mt-2 text-xs text-slate-400">
                                        Formatos aceptados: .xlsx, .xls (máximo 10MB)
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50">
                                        <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
                                    </div>
                                    <div className="text-left">
                                        <p className="font-medium text-slate-900">{file.name}</p>
                                        <p className="text-sm text-slate-500">
                                            {formatFileSize(file.size)}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        setFile(null);
                                        setResult(null);
                                    }}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Progress bar */}
                    {uploading && (
                        <div className="mt-4 space-y-2">
                            <Progress value={progress} className="h-2" />
                            <p className="text-sm text-slate-500">
                                {progress < 30
                                    ? 'Subiendo archivo...'
                                    : progress < 80
                                        ? 'Procesando productos...'
                                        : 'Finalizando...'}
                            </p>
                        </div>
                    )}

                    {/* Upload button */}
                    {file && !result && (
                        <div className="mt-4 flex justify-end">
                            <Button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="gap-2 bg-emerald-600 hover:bg-emerald-700"
                            >
                                {uploading ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <Upload className="h-4 w-4" />
                                )}
                                {uploading ? 'Importando...' : 'Iniciar importación'}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Results */}
            {result && (
                <Card className="border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            {result.errores.length === 0 ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                            ) : (
                                <AlertCircle className="h-5 w-5 text-amber-500" />
                            )}
                            Resultado de la importación
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="rounded-lg bg-emerald-50 p-4">
                                <p className="text-2xl font-bold text-emerald-600">
                                    {result.creados}
                                </p>
                                <p className="text-sm text-emerald-700">Productos creados</p>
                            </div>
                            <div className="rounded-lg bg-blue-50 p-4">
                                <p className="text-2xl font-bold text-blue-600">
                                    {result.actualizados}
                                </p>
                                <p className="text-sm text-blue-700">
                                    Productos actualizados
                                </p>
                            </div>
                            <div className="rounded-lg bg-slate-100 p-4">
                                <p className="text-2xl font-bold text-slate-600">
                                    {result.totalFilas}
                                </p>
                                <p className="text-sm text-slate-500">Filas procesadas</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <Badge variant="secondary">
                                {result.duplicadosRemovidos} duplicados removidos
                            </Badge>
                            <Badge variant="secondary">
                                {result.filasOmitidas} filas omitidas
                            </Badge>
                            <Badge variant="secondary">
                                {(result.duracionMs / 1000).toFixed(1)}s duración
                            </Badge>
                        </div>

                        {/* Errors list */}
                        {(result.errores.length > 0 ||
                            result.erroresValidacion.length > 0) && (
                                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                                    <h4 className="mb-2 font-medium text-amber-800">
                                        Errores ({result.errores.length + result.erroresValidacion.length})
                                    </h4>
                                    <div className="max-h-48 space-y-1 overflow-y-auto">
                                        {result.erroresValidacion.map((err, i) => (
                                            <p key={`v-${i}`} className="text-sm text-amber-700">
                                                Fila {err.row}: {err.error}
                                            </p>
                                        ))}
                                        {result.errores.map((err, i) => (
                                            <p key={`e-${i}`} className="text-sm text-amber-700">
                                                Fila {err.index}: {err.error}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}

                        <div className="flex justify-end">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setFile(null);
                                    setResult(null);
                                }}
                            >
                                Importar otro archivo
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Instructions */}
            <Card className="mt-6 border-slate-200 shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg">Formato del archivo Excel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-slate-600">
                    <p>El archivo Excel debe contener las siguientes columnas:</p>
                    <div className="overflow-hidden rounded-lg border">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-4 py-2 font-semibold">Columna</th>
                                    <th className="px-4 py-2 font-semibold">Descripción</th>
                                    <th className="px-4 py-2 font-semibold">Ejemplo</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                <tr>
                                    <td className="px-4 py-2 font-mono">Clave</td>
                                    <td className="px-4 py-2">Identificador único del producto</td>
                                    <td className="px-4 py-2 text-slate-500">007501446000010</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 font-mono">Codigo</td>
                                    <td className="px-4 py-2">Nombre/descripción del producto</td>
                                    <td className="px-4 py-2 text-slate-500">PARACETAMOL 500MG C/10</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-2 font-mono">Precio</td>
                                    <td className="px-4 py-2">Precio unitario</td>
                                    <td className="px-4 py-2 text-slate-500">45.50</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="text-xs text-slate-400">
                        • Los productos existentes se actualizarán automáticamente por su Clave
                        <br />
                        • Los productos nuevos se crearán automáticamente
                        <br />
                        • Las filas duplicadas se deduplicarán
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
