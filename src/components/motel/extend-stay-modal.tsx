'use client';
import { useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign, ArrowRight, CalendarClock } from 'lucide-react';
import type { Room, Rate } from '@/lib/types';
import { formatToMexicanTime } from '@/lib/datetime';
import { addHours } from 'date-fns';

interface ExtendStayModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentRoom: Room;
  extensionRate: Rate;
  onConfirm: (roomId: number) => void;
}

export default function ExtendStayModal({ isOpen, onOpenChange, currentRoom, extensionRate, onConfirm }: ExtendStayModalProps) {
  
  const currentCheckOutTime = useMemo(() => {
    return currentRoom.check_out_time ? new Date(currentRoom.check_out_time) : null;
  }, [currentRoom.check_out_time]);

  const newCheckOutTime = useMemo(() => {
    if (!currentCheckOutTime) return null;
    return addHours(currentCheckOutTime, extensionRate.hours);
  }, [currentCheckOutTime, extensionRate.hours]);
  
  const newTotalDebt = useMemo(() => {
    return (currentRoom.total_debt || 0) + extensionRate.price;
  }, [currentRoom.total_debt, extensionRate.price]);

  const handleConfirm = () => {
    onConfirm(currentRoom.id);
    onOpenChange(false);
  };

  if (!currentCheckOutTime || !newCheckOutTime) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            <Clock className="h-6 w-6 text-primary" />
            Confirmar Extensión de Estancia
          </DialogTitle>
          <DialogDescription>
            Habitación: <span className="font-semibold">{currentRoom.name}</span>
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-6">
            <div className="flex justify-around items-center text-center">
                <div>
                    <p className="text-sm text-muted-foreground">Salida Actual</p>
                    <p className="font-bold text-lg">{formatToMexicanTime(currentCheckOutTime)}</p>
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground"/>
                 <div>
                    <p className="text-sm text-primary font-semibold">Nueva Salida</p>
                    <p className="font-bold text-lg text-primary">{formatToMexicanTime(newCheckOutTime)}</p>
                </div>
            </div>
          <div className="mt-4 p-4 border bg-blue-50 border-blue-200 rounded-lg">
                <h3 className="font-semibold mb-2 text-blue-800 flex items-center gap-2"><CalendarClock className="h-5 w-5"/>Resumen de la Extensión</h3>
                <div className="text-sm text-blue-700 space-y-2">
                    <div className="flex justify-between">
                        <span>Extensión de tiempo:</span> 
                        <span className="font-semibold">{extensionRate.hours} horas</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Costo de extensión:</span> 
                        <span className="font-semibold">${extensionRate.price.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between items-center font-bold text-blue-800 text-lg border-t border-blue-300 mt-2 pt-2">
                        <span>Nueva Cuenta Total:</span> 
                        <span>${newTotalDebt.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="submit" onClick={handleConfirm}>
            Confirmar y Cobrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
