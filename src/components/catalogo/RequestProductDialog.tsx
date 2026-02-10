'use client';

import { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function RequestProductDialog() {
    const [open, setOpen] = useState(false);
    const [nombre, setNombre] = useState('');
    const [dosis, setDosis] = useState('');

    const handleSend = () => {
        if (!nombre.trim()) return;

        const phone = '527737360058';
        const text = `Hola, estoy buscando el siguiente producto que no encontré en el catálogo:\n\nProducto: *${nombre}*\nDosis/Presentación: ${dosis || 'N/A'}\n\n¿Me podrían informar si lo tienen disponible?`;

        const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
        setOpen(false);
        setNombre('');
        setDosis('');
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <Button
                        size="lg"
                        className="h-14 gap-2 rounded-full bg-teal-600 px-6 text-base font-semibold shadow-lg hover:bg-teal-700 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                    >
                        <MessageCircle className="h-5 w-5" />
                        ¿No encuentras tu producto?
                    </Button>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-teal-600" />
                        Solicitar Producto
                    </DialogTitle>
                    <DialogDescription>
                        Envíanos un mensaje por WhatsApp con el producto que buscas y te confirmaremos disponibilidad.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Nombre del producto *</Label>
                        <Input
                            id="name"
                            placeholder="Ej. Paracetamol, Aspirina..."
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            className="col-span-3"
                            autoFocus
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="dosis">Dosis / Presentación (Opcional)</Label>
                        <Input
                            id="dosis"
                            placeholder="Ej. 500mg, Caja con 20..."
                            value={dosis}
                            onChange={(e) => setDosis(e.target.value)}
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSend} disabled={!nombre.trim()} className="w-full bg-teal-600 hover:bg-teal-700 gap-2">
                        <Send className="h-4 w-4" />
                        Enviar WhatsApp
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
