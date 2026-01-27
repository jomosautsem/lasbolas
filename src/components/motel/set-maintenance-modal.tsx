'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Wrench } from 'lucide-react';
import type { Room } from '@/lib/types';

interface SetMaintenanceModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (roomId: number) => void;
  room: Room;
}

export default function SetMaintenanceModal({ isOpen, onOpenChange, onConfirm, room }: SetMaintenanceModalProps) {

  const handleConfirmClick = () => {
    onConfirm(room.id);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            <Wrench className="h-6 w-6 text-primary" />
            Poner en Mantenimiento
          </DialogTitle>
          <DialogDescription>
            Habitación: <span className="font-semibold">{room.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <p>¿Está seguro que desea poner esta habitación en estado de mantenimiento?</p>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="button" onClick={handleConfirmClick}>Confirmar Mantenimiento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
