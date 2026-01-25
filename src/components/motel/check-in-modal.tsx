'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { Room, Rate, EntryType } from '@/lib/types';
import { vehicleReports } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Car, PersonStanding, AlertTriangle } from 'lucide-react';
import { MotorcycleIcon } from '@/components/icons';

interface CheckInModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  room: Room;
  rates: Rate[];
}

export default function CheckInModal({ isOpen, onOpenChange, room, rates }: CheckInModalProps) {
  const { toast } = useToast();
  const [plate, setPlate] = useState('');
  const [isBlacklisted, setIsBlacklisted] = useState(false);

  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPlate = e.target.value.toUpperCase();
    setPlate(newPlate);
    const report = vehicleReports.find(r => r.plate === newPlate);
    if (report) {
      setIsBlacklisted(true);
      toast({
        variant: "destructive",
        title: "Vehículo en Lista Negra",
        description: `Placa ${newPlate}: ${report.description}`,
      });
    } else {
      setIsBlacklisted(false);
    }
  };

  const handleConfirm = () => {
    // Here you would handle the form submission, update DB, etc.
    toast({
      title: 'Check-in Exitoso',
      description: `Habitación ${room.name} ocupada.`,
    });
    onOpenChange(false);
  };
  

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Ocupar Habitación {room.name}</DialogTitle>
          <DialogDescription>
            Complete los datos para el check-in.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Cliente
            </Label>
            <Input id="name" placeholder="Nombre (opcional)" className="col-span-3" />
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label className="text-right pt-2">
              Entrada
            </Label>
            <RadioGroup defaultValue="Auto" className="col-span-3 flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Auto" id="r1" />
                <Label htmlFor="r1" className="flex items-center gap-2"><Car className="h-4 w-4" /> Auto</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Moto" id="r2" />
                <Label htmlFor="r2" className="flex items-center gap-2"><MotorcycleIcon className="h-4 w-4"/> Moto</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="Pie" id="r3" />
                <Label htmlFor="r3" className="flex items-center gap-2"><PersonStanding className="h-4 w-4"/> Pie</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="plate" className="text-right">
              Placa
            </Label>
            <div className="col-span-3 relative">
                <Input 
                    id="plate" 
                    placeholder="ABC-123" 
                    className={`col-span-3 ${isBlacklisted ? 'border-destructive ring-2 ring-destructive' : ''}`}
                    value={plate}
                    onChange={handlePlateChange} 
                />
                {isBlacklisted && <AlertTriangle className="absolute right-2 top-2.5 h-4 w-4 text-destructive" />}
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="brand" className="text-right">
              Vehículo
            </Label>
            <Input id="brand" placeholder="Marca, color, detalles" className="col-span-3" />
          </div>

          <div className="grid grid-cols-1 gap-2">
            <Label className="text-left font-semibold">Seleccionar Tarifa</Label>
            <div className="flex flex-wrap gap-2">
              {rates.filter(r => !r.is_extra_hour).map(rate => (
                 <Button key={rate.id} variant="outline" className="flex-grow">{rate.name} - ${rate.price}</Button>
              ))}
              <Button variant="secondary" className="flex-grow">Tiempo Manual</Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="submit" onClick={handleConfirm} className="bg-primary hover:bg-primary/90">Confirmar Check-in</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
