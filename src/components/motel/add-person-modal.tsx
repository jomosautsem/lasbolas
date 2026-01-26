'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import type { Room } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AddPersonModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentRoom: Room;
  onConfirm: (roomId: number, amount: number) => void;
}

export default function AddPersonModal({ isOpen, onOpenChange, currentRoom, onConfirm }: AddPersonModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);

  const handleConfirm = () => {
    if (selectedAmount !== null) {
      onConfirm(currentRoom.id, selectedAmount);
      onOpenChange(false);
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedAmount(null);
    }
    onOpenChange(open);
  }
  
  const currentPersons = parseInt(currentRoom.persons || '0', 10);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Agregar Persona Extra
          </DialogTitle>
          <DialogDescription>
            Habitación: <span className="font-semibold">{currentRoom.name}</span>. Personas actuales: {currentPersons}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4 space-y-4">
            <p className="text-sm text-muted-foreground">Seleccione el costo para la persona extra. Esto agregará una persona al conteo actual.</p>
            <div className="flex gap-4">
                <Button 
                    variant={selectedAmount === 0 ? 'default' : 'outline'}
                    className="flex-1 h-20 flex-col"
                    onClick={() => setSelectedAmount(0)}
                >
                    <span className="text-2xl font-bold">$0.00</span>
                    <span className="text-xs">Cortesía</span>
                </Button>
                <Button
                    variant={selectedAmount === 150 ? 'default' : 'outline'}
                    className={cn("flex-1 h-20 flex-col", selectedAmount !== 150 && "bg-green-50 border-green-500 text-green-700 hover:bg-green-100")}
                    onClick={() => setSelectedAmount(150)}
                >
                    <span className="text-2xl font-bold">$150.00</span>
                    <span className="text-xs">Costo Normal</span>
                </Button>
            </div>
        </div>

        {selectedAmount !== null && (
             <div className="mt-2 p-4 border bg-blue-50 border-blue-200 rounded-lg">
                <h3 className="font-semibold mb-2 text-blue-800">Resumen</h3>
                <div className="text-sm text-blue-700 space-y-1">
                    <div className="flex justify-between"><span>Total de personas será:</span> <span>{currentPersons + 1}</span></div>
                    <div className="flex justify-between font-bold text-blue-800 text-lg border-t border-blue-300 mt-2 pt-2">
                        <span>Costo Adicional:</span> <span>${selectedAmount.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        )}

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>Cancelar</Button>
          <Button type="submit" onClick={handleConfirm} disabled={selectedAmount === null}>
            Confirmar y Agregar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
