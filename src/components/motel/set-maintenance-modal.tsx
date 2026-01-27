'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Wrench, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Room } from '@/lib/types';

interface SetMaintenanceModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (roomId: number, note: string) => void;
  room: Room;
}

export default function SetMaintenanceModal({ isOpen, onOpenChange, onConfirm, room }: SetMaintenanceModalProps) {
  const [note, setNote] = useState('');
  const { toast } = useToast();

  const handleConfirmClick = () => {
    if (!note.trim()) {
      toast({
        variant: 'destructive',
        title: 'Nota Requerida',
        description: 'Por favor, ingrese una nota para el mantenimiento.',
      });
      return;
    }
    onConfirm(room.id, note);
    onOpenChange(false);
    setNote('');
  };

  const handleOpenChange = (open: boolean) => {
    if(!open) {
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
            Habitación: <span className="font-semibold">{room.name}</span>. Ingrese una nota sobre la falla.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <label htmlFor="note" className="flex items-center gap-2 text-sm font-medium">
              <Pencil className="h-4 w-4"/>
              Nota de Mantenimiento
            </label>
            <Textarea
              id="note"
              placeholder="Ej. Fuga de agua en el lavabo, la TV no enciende, etc."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>Cancelar</Button>
          <Button type="button" onClick={handleConfirmClick}>Confirmar Mantenimiento</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
