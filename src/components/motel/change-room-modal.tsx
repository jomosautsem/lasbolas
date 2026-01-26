'use client';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bed } from 'lucide-react';
import type { Room } from '@/lib/types';
import { cn } from '@/lib/utils';

interface ChangeRoomModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentRoom: Room;
  allRooms: Room[];
  onConfirmChange: (fromRoomId: number, toRoomId: number) => void;
}

export default function ChangeRoomModal({ isOpen, onOpenChange, currentRoom, allRooms, onConfirmChange }: ChangeRoomModalProps) {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  const availableRooms = allRooms.filter(
    r => r.status === 'Disponible' && r.room_type_id === currentRoom.room_type_id && r.id !== currentRoom.id
  );

  const handleConfirm = () => {
    if (selectedRoomId) {
      onConfirmChange(currentRoom.id, selectedRoomId);
      onOpenChange(false);
    }
  };
  
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setSelectedRoomId(null);
    }
    onOpenChange(open);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Cambiar de Habitación</DialogTitle>
          <DialogDescription>
            Moviendo desde <span className="font-semibold">{currentRoom.name}</span>. Seleccione una habitación disponible del mismo tipo.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            <h4 className="mb-4 text-sm font-medium text-muted-foreground">Habitaciones Disponibles</h4>
            {availableRooms.length > 0 ? (
                <ScrollArea className="h-64">
                    <div className="grid grid-cols-3 gap-4 pr-4">
                        {availableRooms.map(room => (
                        <Button
                            key={room.id}
                            variant={selectedRoomId === room.id ? 'default' : 'outline'}
                            className="h-20 flex-col gap-1"
                            onClick={() => setSelectedRoomId(room.id)}
                        >
                            <Bed className="h-5 w-5"/>
                            <span className="font-bold">{room.name}</span>
                        </Button>
                        ))}
                    </div>
                </ScrollArea>
            ) : (
                <div className="text-center text-muted-foreground border rounded-lg p-8">
                    No hay habitaciones disponibles del mismo tipo.
                </div>
            )}
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => handleOpenChange(false)}>Cancelar</Button>
          <Button type="submit" onClick={handleConfirm} disabled={!selectedRoomId}>
            Confirmar Cambio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
