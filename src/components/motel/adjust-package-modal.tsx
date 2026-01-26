'use client';
import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowRight, Package } from 'lucide-react';
import type { Room, Rate, RoomType } from '@/lib/types';
import { cn } from '@/lib/utils';
import { addHours } from 'date-fns';

interface AdjustPackageModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentRoom: Room;
  allRates: Rate[];
  onConfirmAdjust: (roomId: number, newRate: Rate, difference: number) => void;
}

const rateColors = [
  'border-green-500 bg-green-50 text-green-700 hover:bg-green-100',
  'border-orange-500 bg-orange-50 text-orange-700 hover:bg-orange-100',
  'border-yellow-500 bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
  'border-purple-500 bg-purple-50 text-purple-700 hover:bg-purple-100',
  'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100',
  'border-pink-500 bg-pink-50 text-pink-700 hover:bg-pink-100',
];

export default function AdjustPackageModal({ isOpen, onOpenChange, currentRoom, allRates, onConfirmAdjust }: AdjustPackageModalProps) {
  const [selectedNewRate, setSelectedNewRate] = useState<Rate | null>(null);

  const currentRate = useMemo(() => {
    return allRates.find(r => r.id === currentRoom.rate_id);
  }, [currentRoom.rate_id, allRates]);
  
  const availableRates = useMemo(() => {
    return allRates.filter(
      r => r.room_type_id === currentRoom.room_type_id && !r.is_extra_hour && r.price > (currentRate?.price || 0)
    );
  }, [allRates, currentRoom.room_type_id, currentRate]);

  const difference = useMemo(() => {
    if (!selectedNewRate || !currentRate) return 0;
    return selectedNewRate.price - currentRate.price;
  }, [selectedNewRate, currentRate]);

  const handleConfirm = () => {
    if (selectedNewRate && difference > 0) {
      onConfirmAdjust(currentRoom.id, selectedNewRate, difference);
      onOpenChange(false);
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedNewRate(null);
    }
    onOpenChange(open);
  }

  if (!currentRate) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Ajustar Paquete de Estancia</DialogTitle>
          <DialogDescription>
            Habitación: <span className="font-semibold">{currentRoom.name}</span>. Cambie a un paquete superior y pague la diferencia.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-4 py-2">
          <div className="rounded-lg border p-3 flex flex-col items-center justify-center bg-muted/50">
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">PAQUETE ACTUAL</h3>
            <Package className="h-8 w-8 text-primary mb-1"/>
            <p className="font-bold">{currentRate.name}</p>
            <p className="text-xl font-headline font-extrabold">${currentRate.price.toFixed(2)}</p>
          </div>

          <div className="rounded-lg border p-3 flex flex-col items-center justify-center">
            <h3 className="text-sm font-semibold text-muted-foreground mb-1">NUEVO PAQUETE</h3>
            <Package className="h-8 w-8 text-green-500 mb-1"/>
            {selectedNewRate ? (
                <>
                    <p className="font-bold">{selectedNewRate.name}</p>
                    <p className="text-xl font-headline font-extrabold">${selectedNewRate.price.toFixed(2)}</p>
                </>
            ) : (
                <p className="text-muted-foreground">Seleccione un paquete</p>
            )}
          </div>
        </div>

        <div>
            <h4 className="mb-2 text-sm font-medium text-muted-foreground">Paquetes Superiores Disponibles</h4>
            {availableRates.length > 0 ? (
                <ScrollArea className="h-32">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pr-4">
                        {availableRates.map((rate, index) => (
                        <Button
                            key={rate.id}
                            variant={selectedNewRate?.id === rate.id ? 'default' : 'outline'}
                            className={cn("flex-grow h-14 flex-col", selectedNewRate?.id !== rate.id && rateColors[index % rateColors.length])}
                            onClick={() => setSelectedNewRate(rate)}
                        >
                            <span className="text-lg font-bold">{rate.name}</span>
                            <span className="text-xs font-semibold">${rate.price.toFixed(2)}</span>
                        </Button>
                        ))}
                    </div>
                </ScrollArea>
            ) : (
                <div className="text-center text-muted-foreground border rounded-lg p-6">
                    No hay paquetes superiores disponibles.
                </div>
            )}
        </div>
        
        {selectedNewRate && (
            <div className="mt-2 p-3 border-t bg-green-50 border-green-200 rounded-lg">
                <h3 className="font-semibold mb-2 text-green-800">Resumen del Cambio</h3>
                <div className="text-sm text-green-700 space-y-1">
                    <div className="flex justify-between"><span>Paquete Nuevo:</span> <span>{selectedNewRate.name}</span></div>
                    <div className="flex justify-between"><span>Precio Nuevo:</span> <span>${selectedNewRate.price.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span>Pagado Actual:</span> <span>-${currentRate.price.toFixed(2)}</span></div>
                    <div className="flex justify-between font-bold text-green-800 text-lg border-t border-green-300 mt-2 pt-2"><span>Diferencia a Pagar:</span> <span>${difference.toFixed(2)}</span></div>
                </div>
            </div>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>Cancelar</Button>
          <Button type="submit" onClick={handleConfirm} disabled={!selectedNewRate || difference <= 0}>
            Confirmar y Cobrar Diferencia
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
