'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserMinus, AlertTriangle } from 'lucide-react';
import type { Room } from '@/lib/types';

interface RemovePersonModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentRoom: Room;
  onConfirm: (roomId: number) => void;
}

export default function RemovePersonModal({ isOpen, onOpenChange, currentRoom, onConfirm }: RemovePersonModalProps) {

  const handleConfirm = () => {
    onConfirm(currentRoom.id);
    onOpenChange(false);
  };
  
  const currentPersons = parseInt(currentRoom.persons || '0', 10);
  const canRemove = currentPersons > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            <UserMinus className="h-6 w-6 text-primary" />
            Reducir Persona
          </DialogTitle>
          <DialogDescription>
            Habitación: <span className="font-semibold">{currentRoom.name}</span>. Personas actuales: {currentPersons}.
          </DialogDescription>
        </DialogHeader>
        
        {canRemove ? (
            <div className="py-4 space-y-4">
                <p>
                    ¿Está seguro que desea reducir una persona del conteo actual? El nuevo total será de{' '}
                    <span className="font-bold">{currentPersons - 1}</span> personas.
                </p>
                <div className="mt-2 p-4 border bg-yellow-50 border-yellow-200 rounded-lg text-yellow-800 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 mt-1 shrink-0"/>
                    <div className="text-sm">
                        Esta acción solo modifica el número de personas registradas y no afecta el total de la cuenta.
                    </div>
                </div>
            </div>
        ) : (
             <div className="py-4 space-y-4 text-center">
                <p>No se pueden reducir más personas.</p>
             </div>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="submit" onClick={handleConfirm} disabled={!canRemove}>
            Confirmar y Reducir
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
