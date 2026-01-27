'use client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Room, Rate, RoomType, EntryType } from '@/lib/types';
import { vehicleReports } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { Car, PersonStanding, AlertTriangle, User, Users, Calendar, Clock, Edit } from 'lucide-react';
import { MotorcycleIcon } from '@/components/icons';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { addHours } from 'date-fns';
import { formatToMexicanTime } from '@/lib/datetime';
import { cn } from '@/lib/utils';

interface CheckInModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  room: Room;
  rates: Rate[];
  roomTypes: RoomType[];
  onConfirm: (room: Room, data: any) => void;
}

const rateColors = [
  'border-green-500 bg-green-50 text-green-700 hover:bg-green-100',
  'border-orange-500 bg-orange-50 text-orange-700 hover:bg-orange-100',
  'border-yellow-500 bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
  'border-purple-500 bg-purple-50 text-purple-700 hover:bg-purple-100',
  'border-blue-500 bg-blue-50 text-blue-700 hover:bg-blue-100',
  'border-pink-500 bg-pink-50 text-pink-700 hover:bg-pink-100',
];


export default function CheckInModal({ isOpen, onOpenChange, room, rates, roomTypes, onConfirm }: CheckInModalProps) {
  const { toast } = useToast();
  const [plate, setPlate] = useState('');
  const [isBlacklisted, setIsBlacklisted] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [persons, setPersons] = useState('2');
  const [entryType, setEntryType] = useState<EntryType | null>(null);
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null);
  const [isManual, setIsManual] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [color, setColor] = useState('');
  const [step, setStep] = useState<'form' | 'confirm'>('form');

  const roomType = roomTypes.find(rt => rt.id === room.room_type_id);

  useEffect(() => {
    if (isOpen) {
      setStartTime(new Date());
      setCustomerName(room.name);
      setPersons('2');
      setEntryType(null);
      setSelectedRate(null);
      setEndTime(null);
      setPlate('');
      setMarca('');
      setModelo('');
      setColor('');
      setIsBlacklisted(false);
      setIsManual(false);
      setStep('form');
    }
  }, [isOpen, room.name]);

  useEffect(() => {
    if (startTime && selectedRate && !isManual) {
      setEndTime(addHours(startTime, selectedRate.hours));
    } else {
      setEndTime(null);
    }
  }, [startTime, selectedRate, isManual]);


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

  const handleReview = () => {
    if (!entryType) {
        toast({
            variant: "destructive",
            title: "Error de validación",
            description: "Por favor, seleccione un tipo de entrada.",
        });
        return;
    }
    if (!selectedRate && !isManual) {
        toast({
            variant: "destructive",
            title: "Error de validación",
            description: "Por favor, seleccione una tarifa o active el tiempo manual.",
        });
        return;
    }
    
    setStep('confirm');
  };

  const handleConfirmAction = () => {
    onConfirm(room, {
        customerName,
        persons,
        entryType,
        plate,
        marca,
        modelo,
        color,
        selectedRate,
        startTime,
        endTime
    });
    
    onOpenChange(false);
  };
  

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-xl flex items-center">
            Ocupar Habitación: {room.name}
            {roomType && <span className="text-sm font-light text-muted-foreground ml-2">({roomType.name})</span>}
          </DialogTitle>
          {step === 'form' && <DialogDescription>Complete los datos para realizar el check-in.</DialogDescription>}
        </DialogHeader>

        {step === 'form' ? (
            <>
              <div className="grid md:grid-cols-2 gap-3 py-2">
                {/* Columna Izquierda */}
                <div className="grid gap-2 content-start">
                  <div className="space-y-1">
                    <Label htmlFor="name">Nombre del Cliente <span className="text-destructive">*</span></Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="name" 
                        placeholder="Nombre (opcional)" 
                        className="pl-9"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="persons">Personas</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="persons" 
                        className="pl-9"
                        value={persons}
                        onChange={(e) => setPersons(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label>Tipo de Entrada <span className="text-destructive">*</span></Label>
                    <div className="flex gap-2">
                      <Button variant={entryType === 'Auto' ? 'default' : 'outline'} onClick={() => setEntryType('Auto')} className="flex-1 gap-2 text-xs h-9 px-2"><Car/> Auto</Button>
                      <Button variant={entryType === 'Moto' ? 'default' : 'outline'} onClick={() => setEntryType('Moto')} className="flex-1 gap-2 text-xs h-9 px-2"><MotorcycleIcon/> Moto</Button>
                      <Button variant={entryType === 'Pie' ? 'default' : 'outline'} onClick={() => setEntryType('Pie')} className="flex-1 gap-2 text-xs h-9 px-2"><PersonStanding/> Pie</Button>
                    </div>
                  </div>
                  
                  { (entryType === 'Auto' || entryType === 'Moto') && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="plate">Placa</Label>
                        <div className="relative">
                            <Input 
                                id="plate" 
                                placeholder="ABC-123" 
                                className={`uppercase ${isBlacklisted ? 'border-destructive ring-2 ring-destructive' : ''}`}
                                value={plate}
                                onChange={handlePlateChange} 
                            />
                            {isBlacklisted && <AlertTriangle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="color">Color</Label>
                        <Input id="color" placeholder="Ej. Rojo" value={color} onChange={(e) => setColor(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="brand">Marca</Label>
                        <Input id="brand" placeholder="Ej. Toyota" value={marca} onChange={(e) => setMarca(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="model">Modelo</Label>
                        <Input id="model" placeholder="Ej. Yaris" value={modelo} onChange={(e) => setModelo(e.target.value)} />
                      </div>
                    </div>
                  )}
                </div>

                {/* Columna Derecha */}
                <div className="grid gap-2 rounded-lg border bg-muted/50 p-3 content-start">
                    <h3 className="font-semibold flex items-center gap-2 text-base"><Calendar className="h-5 w-5"/> Tiempo de Estancia</h3>
                    
                    <div className="flex items-center justify-between rounded-lg border bg-background p-2">
                        <Label htmlFor="manual-time">Activar Tiempo Manual</Label>
                        <Switch id="manual-time" checked={isManual} onCheckedChange={setIsManual} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="rounded-lg border bg-background p-2 text-center">
                            <Label className="text-xs text-muted-foreground">INICIO</Label>
                            <div className="font-semibold text-base">{startTime ? formatToMexicanTime(startTime) : '--:--'}</div>
                        </div>
                        <div className="rounded-lg border bg-background p-2 text-center">
                            <Label className="text-xs text-muted-foreground">FIN</Label>
                            <div className="font-semibold text-base">{endTime ? formatToMexicanTime(endTime) : '--:--'}</div>
                        </div>
                    </div>
                    <div>
                      <Label className="mb-2 block text-sm">Seleccionar Tarifa <span className="text-destructive">*</span></Label>
                      <div className="grid grid-cols-3 gap-1">
                        {rates
                          .filter(r => !r.is_extra_hour)
                          .sort((a, b) => a.hours - b.hours)
                          .map((rate, index) => (
                            <Button 
                              key={rate.id}
                              variant={selectedRate?.id === rate.id ? 'default' : 'outline'}
                              className={cn("h-auto flex-col p-1 text-xs", selectedRate?.id !== rate.id && rateColors[index % rateColors.length])}
                              onClick={() => setSelectedRate(rate)}
                              disabled={isManual}
                            >
                              <span className="text-sm font-bold">{rate.hours}</span>
                              <span className="text-xs">Hr</span>
                            </Button>
                        ))}
                      </div>
                    </div>
                </div>
              </div>

              <div className="p-4 border-t">
                  <h3 className="font-semibold mb-1">Resumen</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex justify-between"><span>Tarifa:</span> <span>{selectedRate ? `${selectedRate.name} - $${selectedRate.price}` : 'N/A'}</span></div>
                      <div className="flex justify-between font-bold text-foreground"><span>Total:</span> <span>${selectedRate ? selectedRate.price.toFixed(2) : '0.00'}</span></div>
                  </div>
              </div>
            </>
        ) : (
            <div className="py-4 space-y-4">
                <h3 className="text-center font-headline text-lg">Confirmar Check-in</h3>
                <Card>
                    <CardContent className="p-6 space-y-4 text-center">
                        <div>
                            <Label className="text-muted-foreground">Habitación</Label>
                            <p className="text-3xl font-bold">{room.name}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-muted-foreground">Precio</Label>
                                <p className="text-3xl font-bold">${selectedRate?.price.toFixed(2) || '0.00'}</p>
                            </div>
                            <div>
                                <Label className="text-muted-foreground">Horas</Label>
                                <p className="text-3xl font-bold">{selectedRate?.hours || 'N/A'}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )}

        <DialogFooter>
          {step === 'form' ? (
             <>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="button" onClick={handleReview} disabled={!entryType || (!selectedRate && !isManual)}>Revisar y Confirmar</Button>
            </>
          ) : (
            <>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
              <Button type="button" variant="outline" onClick={() => setStep('form')}>
                <Edit className="mr-2 h-4 w-4"/>
                Editar
              </Button>
              <Button type="button" onClick={handleConfirmAction}>Confirmar</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
