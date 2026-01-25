'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bed, Car, Clock, Sparkles, Wrench, Trash2, PlusCircle, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Room } from '@/lib/types';
import { formatToMexicanTime } from '@/lib/datetime';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from 'lucide-react';


interface RoomCardProps {
  room: Room;
  onOccupy: (room: Room) => void;
}

const statusConfig = {
  Disponible: { icon: Bed, color: 'bg-green-100 border-green-500 text-green-700', labelColor: 'bg-green-500' },
  Ocupada: { icon: Bed, color: 'bg-blue-100 border-blue-500 text-blue-700', labelColor: 'bg-blue-500' },
  Limpieza: { icon: Sparkles, color: 'bg-cyan-100 border-cyan-500 text-cyan-700', labelColor: 'bg-cyan-500' },
  Mantenimiento: { icon: Wrench, color: 'bg-gray-200 border-gray-500 text-gray-600', labelColor: 'bg-gray-500' },
  Profunda: { icon: Trash2, color: 'bg-purple-100 border-purple-500 text-purple-700', labelColor: 'bg-purple-500' },
  Vencida: { icon: Bed, color: 'bg-red-100 border-red-500 text-red-700', labelColor: 'bg-red-500' },
};

const Timer = ({ checkInTime, checkOutTime }: { checkInTime: string, checkOutTime: string }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  const checkIn = new Date(checkInTime);
  const checkOut = new Date(checkOutTime);
  const isExpired = now > checkOut;
  
  const totalDuration = checkOut.getTime() - checkIn.getTime();
  const elapsedTime = now.getTime() - checkIn.getTime();
  const progress = Math.min((elapsedTime / totalDuration) * 100, 100);

  const diff = Math.abs(now.getTime() - checkOut.getTime());
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);

  const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  let timerColor = 'bg-blue-500';
  if (isExpired) timerColor = 'bg-red-500';
  else if (progress > 85) timerColor = 'bg-yellow-500';
  else if (progress > 60) timerColor = 'bg-orange-500';

  return (
    <div className='w-full'>
      <div className="text-center font-mono text-lg font-semibold">{timeStr}</div>
      <div className="text-center text-xs text-muted-foreground">{isExpired ? 'Vencido' : 'Restante'}</div>
      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
        <div className={cn("h-1.5 rounded-full transition-all", timerColor)} style={{ width: `${isExpired ? 100 : progress}%` }}></div>
      </div>
    </div>
  );
};

export function RoomCard({ room, onOccupy }: RoomCardProps) {
  const isOccupied = room.status === 'Ocupada';
  const now = new Date();
  const isExpired = isOccupied && room.check_out_time && new Date(room.check_out_time) < now;
  const effectiveStatus = isExpired ? 'Vencida' : room.status;

  const config = statusConfig[effectiveStatus];
  const isActionable = room.status === 'Disponible' || room.status === 'Ocupada';

  return (
    <Card className={cn('rounded-2xl shadow-lg transition-all hover:shadow-xl flex flex-col', config.color)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3">
        <CardTitle className="text-xl font-bold font-headline">{room.name}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge className={cn('text-white', config.labelColor)}>{effectiveStatus}</Badge>
          <config.icon className="h-5 w-5" />
        </div>
      </CardHeader>
      <CardContent className="p-3 flex-grow flex flex-col justify-center items-center gap-2">
        {isOccupied && room.check_in_time && room.check_out_time ? (
          <>
            <div className="flex justify-between w-full text-xs">
              <span><Clock className="inline h-3 w-3 mr-1"/>{formatToMexicanTime(room.check_in_time)} - {formatToMexicanTime(room.check_out_time)}</span>
            </div>
            <Timer checkInTime={room.check_in_time} checkOutTime={room.check_out_time} />
             {room.vehicle_plate && (
              <div className="text-sm flex items-center gap-2 mt-2">
                <Car className="h-4 w-4"/>
                <strong>{room.vehicle_plate}</strong>
              </div>
            )}
            <div className='text-sm text-muted-foreground'>{room.customer_name}</div>
          </>
        ) : (
          <div className="text-center text-muted-foreground text-sm py-8">
            {room.status === 'Disponible' ? 'Lista para rentar' : `En ${room.status}`}
          </div>
        )}
      </CardContent>
      {isActionable && (
        <CardFooter className="p-2 bg-white/50 rounded-b-2xl">
          {room.status === 'Disponible' ? (
            <Button className="w-full" onClick={() => onOccupy(room)}>Ocupar</Button>
          ) : (
            <div className="flex w-full gap-1">
              <Button variant="outline" className="flex-grow text-xs" size="sm"><PlusCircle className="h-4 w-4 mr-1"/>Consumo</Button>
              <Button variant="outline" className="flex-grow text-xs" size="sm"><LogOut className="h-4 w-4 mr-1"/>Liberar</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Añadir Tiempo Extra</DropdownMenuItem>
                  <DropdownMenuItem>Añadir Persona Extra</DropdownMenuItem>
                  <DropdownMenuItem>Ver Detalles</DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">Cancelar Habitación</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}
