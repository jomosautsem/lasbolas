'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Wrench } from 'lucide-react';
import type { Room } from '@/lib/types';
import { Label } from '../ui/label';

interface SetMaintenanceModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (roomId: number, note: string) => void;
  room: Room;
}

export default function SetMaintenanceModal({ isOpen, onOpenChange, onConfirm, room }: SetMaintenanceModalProps) {
  const [note, setNote] = useState('');

  const handleConfirmClick = () => {
    onConfirm(room.id, note);
    onOpenChange(false);
    setNote('');
  };
  
  const handleOpenChange = (open: boolean) => {
      if (!open) {
          setNote('');
      }
      onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
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

        <div className="py-4 space-y-2">
          <Label htmlFor="maintenance-note">Nota de Mantenimiento (Opcional)</Label>
          <Textarea
            id="maintenance-note"
            placeholder="Ej. Fuga en el lavabo, TV no enciende..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="button" onClick={handleConfirmClick}>Confirmar Mantenimiento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
