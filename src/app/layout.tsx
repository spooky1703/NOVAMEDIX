import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/components/providers/SessionProvider';
import { Toaster } from '@/components/ui/sonner';
import { RequestProductDialog } from '@/components/catalogo/RequestProductDialog';
import { Analytics } from '@vercel/analytics/next';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'NovaMedix — Catálogo Farmacéutico Digital',
  description:
    'Catálogo digital de productos farmacéuticos. Consulta precios, busca medicamentos y más.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased`}>
        <SessionProvider>
          {children}
          <Toaster richColors position="top-right" />
          <div className="fixed bottom-6 right-6 z-50">
            <RequestProductDialog />
          </div>
          <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center bg-slate-900/90 py-1.5 backdrop-blur-sm">
            <p className="text-center text-[10px] font-medium text-slate-200 sm:text-xs">
              ⚠️ Imágenes ilustrativas. Por favor consulta disponibilidad del modelo exacto antes de ordenar.
            </p>
          </div>
          <Analytics />
        </SessionProvider>
      </body>
    </html>
  );
}
