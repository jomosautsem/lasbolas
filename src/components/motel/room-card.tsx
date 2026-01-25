'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Bed, Car, Clock, Sparkles, Wrench, Trash2, PlusCircle, LogOut, MoreVertical, Menu, PersonStanding, Users, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Room, Rate, RoomType } from '@/lib/types';
import { formatToMexicanTime } from '@/lib/datetime';
import { MotorcycleIcon } from '@/components/icons';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


interface RoomCardProps {
  room: Room;
  rates: Rate[];
  roomTypes: RoomType[];
  onOccupy: (room: Room) => void;
}

const statusConfig: { [key: string]: { icon: React.ElementType, color: string, labelColor: string } } = {
  Disponible: { icon: Bed, color: 'bg-green-100 border-green-500 text-green-700', labelColor: 'bg-green-500' },
  Ocupada: { icon: Bed, color: 'bg-blue-100 border-blue-500 text-blue-700', labelColor: 'bg-blue-500' },
  Limpieza: { icon: Sparkles, color: 'bg-cyan-100 border-cyan-500 text-cyan-700', labelColor: 'bg-cyan-500' },
  Mantenimiento: { icon: Wrench, color: 'bg-gray-200 border-gray-500 text-gray-600', labelColor: 'bg-gray-500' },
  Profunda: { icon: Trash2, color: 'bg-purple-100 border-purple-500 text-purple-700', labelColor: 'bg-purple-500' },
  Vencida: { icon: Bed, color: 'bg-red-100 border-red-500 text-red-700', labelColor: 'bg-red-500' },
};

export function RoomCard({ room, rates, roomTypes, onOccupy }: RoomCardProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    // Only run the timer if the room is occupied
    if (room.status === 'Ocupada') {
      const timerId = setInterval(() => setNow(new Date()), 1000);
      setNow(new Date()); // Set initial time
      return () => clearInterval(timerId);
    }
  }, [room.status]);

  const isOccupied = room.status === 'Ocupada';
  const isExpired = isOccupied && room.check_out_time && now && new Date(room.check_out_time) < now;
  const effectiveStatus = isExpired ? 'Vencida' : room.status;

  const roomType = roomTypes.find(rt => rt.id === room.room_type_id);
  const rate = room.rate_id ? rates.find(r => r.id === room.rate_id) : null;
  
  const baseConfig = statusConfig[effectiveStatus];
  const cardColorClass = (isOccupied || isExpired) && rate?.color_class ? rate.color_class : baseConfig.color;
  const isActionable = room.status === 'Disponible' || room.status === 'Ocupada';
  
  const VehicleIcon = room.entry_type === 'Auto' ? Car : MotorcycleIcon;

  return (
    <Card className={cn('rounded-2xl shadow-lg transition-all hover:shadow-xl flex flex-col', cardColorClass)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-3">
        <div>
          <CardTitle className="text-xl font-bold font-headline">{room.name.replace('Habitación ', 'Hab ')}</CardTitle>
          {roomType && <span className="text-xs font-semibold">{roomType.name.toUpperCase()}</span>}
        </div>
        <Badge className={cn('text-white', baseConfig.labelColor)}>{effectiveStatus}</Badge>
      </CardHeader>
      <CardContent className="p-3 flex-grow flex flex-col justify-center items-center gap-2">
        {isOccupied && room.check_in_time && room.check_out_time && rate ? (
           <div className="w-full bg-white/60 rounded-lg p-3 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 font-semibold">
                <PersonStanding className="h-5 w-5" />
                <span>{room.customer_name}</span>
              </div>
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {room.persons}
              </Badge>
            </div>

            <div className="text-center rounded-md bg-white/70 p-2">
              <div className="text-xs text-muted-foreground font-semibold">HORARIO</div>
              <div className="flex items-center justify-center gap-2 font-mono text-base">
                <span>{formatToMexicanTime(room.check_in_time)}</span>
                <ArrowRight className="h-4 w-4" />
                <span>{formatToMexicanTime(room.check_out_time)}</span>
              </div>
            </div>

            {room.entry_type && room.entry_type !== 'Pie' && (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <VehicleIcon className="h-5 w-5" />
                  <div>
                    <div className="font-semibold">{room.entry_type}</div>
                    <div className="text-xs text-muted-foreground">{room.vehicle_brand} {room.vehicle_details}</div>
                  </div>
                </div>
                <Badge variant="outline">{room.vehicle_plate || 'SIN PLACA'}</Badge>
              </div>
            )}
            
            <Separator className="my-1 bg-black/10" />

            <div className="flex justify-between items-center text-base font-bold">
              <span>HOSPEDAJE</span>
              <span>${rate.price.toFixed(2)}</span>
            </div>
           </div>
        ) : (
          <div className="text-center text-muted-foreground text-sm py-8">
            {room.status === 'Disponible' ? 'Lista para rentar' : `En ${room.status}`}
          </div>
        )}
      </CardContent>
      <CardFooter className="p-2 bg-white/50 rounded-b-2xl">
          {room.status === 'Disponible' ? (
            <Button className="w-full" onClick={() => onOccupy(room)}>Ocupar</Button>
          ) : room.status === 'Ocupada' || effectiveStatus === 'Vencida' ? (
             <Button variant="outline" className="w-full bg-white font-semibold"><Menu className="mr-2 h-4 w-4"/> Gestionar Habitación</Button>
          ) : (
            <div className="h-10"></div> // Placeholder for consistent height
          )}
        </CardFooter>
    </Card>
  );
}
