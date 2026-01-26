'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { DollarSign, Tag, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Rate, RoomType } from '@/lib/types';

interface RateFormModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (data: Omit<Rate, 'id'> | Rate) => void;
  rateToEdit?: Rate | null;
  roomTypes: RoomType[];
}

export default function RateFormModal({ isOpen, onOpenChange, onConfirm, rateToEdit, roomTypes }: RateFormModalProps) {
  const [name, setName] = useState('');
  const [hours, setHours] = useState<number | ''>('');
  const [price, setPrice] = useState<number | ''>('');
  const [roomTypeId, setRoomTypeId] = useState<string>('');
  const [isExtraHour, setIsExtraHour] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (rateToEdit) {
        setName(rateToEdit.name);
        setHours(rateToEdit.hours);
        setPrice(rateToEdit.price);
        setRoomTypeId(rateToEdit.room_type_id.toString());
        setIsExtraHour(rateToEdit.is_extra_hour);
      } else {
        setName('');
        setHours('');
        setPrice('');
        setRoomTypeId('');
        setIsExtraHour(false);
      }
    }
  }, [isOpen, rateToEdit]);

  const handleConfirmClick = () => {
    if (!name.trim() || !roomTypeId || hours === '' || hours <= 0 || price === '' || price < 0) {
      toast({
        variant: 'destructive',
        title: 'Datos Incompletos',
        description: 'Por favor, complete todos los campos correctamente.',
      });
      return;
    }

    const rateData = {
      name,
      hours: +hours,
      price: +price,
      room_type_id: parseInt(roomTypeId, 10),
      is_extra_hour: isExtraHour,
    };
    
    if (rateToEdit) {
      onConfirm({ ...rateData, id: rateToEdit.id });
    } else {
      onConfirm(rateData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            <Tag className="h-6 w-6 text-primary" />
            {rateToEdit ? 'Editar Tarifa' : 'Nueva Tarifa'}
          </DialogTitle>
          <DialogDescription>
            {rateToEdit ? 'Modifique los detalles de la tarifa.' : 'Ingrese los detalles de la nueva tarifa.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la Tarifa</Label>
            <Input id="name" placeholder="Ej. 8 Horas" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hours">Horas</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="hours"
                  type="number"
                  placeholder="8"
                  className="pl-9"
                  value={hours}
                  onChange={(e) => setHours(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                />
              </div>
            </div>
             <div className="space-y-2">
              <Label htmlFor="price">Precio</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="price"
                  type="number"
                  placeholder="0.00"
                  className="pl-9"
                  value={price}
                  onChange={(e) => setPrice(e.target.value === '' ? '' : parseFloat(e.target.value))}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="roomType">Tipo de Habitación</Label>
            <Select value={roomTypeId} onValueChange={setRoomTypeId}>
              <SelectTrigger id="roomType">
                <SelectValue placeholder="Seleccione un tipo" />
              </SelectTrigger>
              <SelectContent>
                {roomTypes.map((rt) => (
                  <SelectItem key={rt.id} value={rt.id.toString()}>
                    {rt.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Switch id="is-extra-hour" checked={isExtraHour} onCheckedChange={setIsExtraHour} />
            <Label htmlFor="is-extra-hour">Es una tarifa de tiempo extra</Label>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="button" onClick={handleConfirmClick}>Guardar Tarifa</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
