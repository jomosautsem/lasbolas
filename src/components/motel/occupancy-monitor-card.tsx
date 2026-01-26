'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Room, Rate } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format, differenceInMinutes, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bed, Car, PersonStanding, Tv, Wind, Clock } from 'lucide-react';
import { MotorcycleIcon } from '@/components/icons';
import { formatToMexicanTime } from '@/lib/datetime';
import { Progress } from '@/components/ui/progress';

interface OccupancyMonitorCardProps {
  room: Room;
  rate: Rate | null | undefined;
}

export function OccupancyMonitorCard({ room, rate }: OccupancyMonitorCardProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000 * 30); // update every 30 seconds
    return () => clearInterval(timer);
  }, []);

  const { status, timeLeft, timePassed, totalDuration, progress } = useMemo(() => {
    if (!room.check_in_time || !room.check_out_time) {
      return { status: 'Error', timeLeft: null, timePassed: null, totalDuration: null, progress: 0 };
    }

    const checkIn = new Date(room.check_in_time);
    const checkOut = new Date(room.check_out_time);
    const minutesLeft = differenceInMinutes(checkOut, now);
    
    const totalDuration = differenceInMinutes(checkOut, checkIn);
    const timePassed = totalDuration - minutesLeft;
    const progress = totalDuration > 0 ? (timePassed / totalDuration) * 100 : 0;

    if (minutesLeft <= 0) {
      return { status: 'Vencida', timeLeft: `Venció hace ${formatDistanceToNow(checkOut, { locale: es, addSuffix: true })}`, timePassed, totalDuration, progress: 100 };
    }
    if (minutesLeft <= 15) {
      return { status: 'Por Vencer', timeLeft: `Vence en ${minutesLeft} min`, timePassed, totalDuration, progress };
    }
    return { status: 'Ocupada', timeLeft: `Vence en ${formatDistanceToNow(checkOut, { locale: es, addSuffix: true })}`, timePassed, totalDuration, progress };
  }, [room.check_in_time, room.check_out_time, now]);

  const statusConfig = {
    Ocupada: 'border-blue-500 bg-blue-50',
    'Por Vencer': 'border-yellow-500 bg-yellow-50 animate-pulse',
    Vencida: 'border-red-500 bg-red-50',
    Error: 'border-gray-500 bg-gray-50',
  };

  const VehicleIcon = room.entry_type === 'Auto' ? Car : room.entry_type === 'Moto' ? MotorcycleIcon : PersonStanding;

  return (
    <Card className={cn("rounded-2xl shadow-md", statusConfig[status])}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
        <CardTitle className="text-2xl font-bold font-headline">{room.name}</CardTitle>
        <div className="flex items-center gap-4">
          <VehicleIcon className="h-6 w-6 text-muted-foreground" />
          <div className="text-right">
            <p className="font-semibold text-sm">{rate?.name}</p>
            <p className="text-xs text-muted-foreground">{rate?.hours} horas</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-center rounded-lg bg-background/70 p-3 mb-3">
          <p className="text-xs font-semibold text-muted-foreground">HORA DE SALIDA</p>
          <p className="text-3xl font-bold font-mono tracking-tight">{formatToMexicanTime(room.check_out_time!)}</p>
          <p className={cn("text-sm font-semibold", status === 'Vencida' ? 'text-red-600' : status === 'Por Vencer' ? 'text-yellow-600' : 'text-blue-600')}>
            {timeLeft}
          </p>
        </div>
        
        <Progress value={progress} className="h-2 mb-3" />

        <div className="flex justify-around items-center text-sm text-muted-foreground font-semibold">
           <div className="flex items-center gap-1.5">
            <Tv className="h-4 w-4" />
            <span>{room.tv_controls}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Wind className="h-4 w-4" />
            <span>{room.ac_controls}</span>
          </div>
           <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            <span>{formatDistanceToNow(new Date(room.check_in_time!), { locale: es })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
