'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bed } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { RoomType } from '@/lib/types';

interface RoomTypeFormModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (data: Omit<RoomType, 'id'> | RoomType) => void;
  roomTypeToEdit?: RoomType | null;
}

export default function RoomTypeFormModal({ isOpen, onOpenChange, onConfirm, roomTypeToEdit }: RoomTypeFormModalProps) {
  const [name, setName] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (roomTypeToEdit) {
        setName(roomTypeToEdit.name);
      } else {
        setName('');
      }
    }
  }, [isOpen, roomTypeToEdit]);

  const handleConfirmClick = () => {
    if (!name.trim()) {
      toast({
        variant: 'destructive',
        title: 'Datos Incompletos',
        description: 'Por favor, ingrese un nombre para el tipo de habitación.',
      });
      return;
    }

    const roomTypeData = {
      name,
    };
    
    if (roomTypeToEdit) {
      onConfirm({ ...roomTypeData, id: roomTypeToEdit.id });
    } else {
      onConfirm(roomTypeData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            <Bed className="h-6 w-6 text-primary" />
            {roomTypeToEdit ? 'Editar Tipo de Habitación' : 'Nuevo Tipo de Habitación'}
          </DialogTitle>
          <DialogDescription>
            {roomTypeToEdit ? 'Modifique el nombre del tipo.' : 'Ingrese el nombre del nuevo tipo.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Tipo de Habitación</Label>
            <Input id="name" placeholder="Ej. Sencilla con Jacuzzi" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="button" onClick={handleConfirmClick}>Guardar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
