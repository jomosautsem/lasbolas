'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Room, Rate } from '@/lib/types';
import { cn } from '@/lib/utils';
import { differenceInMinutes, formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, PersonStanding, Tv, Wind, Clock, AlertTriangle } from 'lucide-react';
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

  const { status, timeLeft, progress } = useMemo(() => {
    if (!room.check_in_time || !room.check_out_time) {
      return { status: 'Error', timeLeft: null, progress: 0 };
    }

    const checkIn = new Date(room.check_in_time);
    const checkOut = new Date(room.check_out_time);
    const minutesLeft = differenceInMinutes(checkOut, now);
    
    const totalDuration = differenceInMinutes(checkOut, checkIn);
    const timePassed = totalDuration - minutesLeft;
    const progressValue = totalDuration > 0 ? (timePassed / totalDuration) * 100 : 0;

    if (minutesLeft <= 0) {
      return { status: 'Vencida', timeLeft: `Venció ${formatDistanceToNow(checkOut, { locale: es, addSuffix: true })}`, progress: 100 };
    }
    if (minutesLeft <= 15) {
      return { status: 'Por Vencer', timeLeft: `Vence en ${minutesLeft} min`, progress: progressValue };
    }
    return { status: 'Ocupada', timeLeft: `Faltan ${formatDistanceToNow(checkOut, { locale: es, addSuffix: false })}`, progress: progressValue };
  }, [room.check_in_time, room.check_out_time, now]);

  const isVencida = status === 'Vencida';

  const { cardColorClass, textColor, isVibrant } = useMemo(() => {
    const rateColorMap: { [key: number]: string } = {
      1: 'bg-green-500 border-green-600',
      2: 'bg-orange-500 border-orange-600',
      3: 'bg-yellow-500 border-yellow-600',
      4: 'bg-purple-500 border-purple-600',
      5: 'bg-blue-500 border-blue-600',
      7: 'bg-green-500 border-green-600',
      8: 'bg-orange-500 border-orange-600',
      9: 'bg-yellow-500 border-yellow-600',
      10: 'bg-purple-500 border-purple-600',
      11: 'bg-blue-500 border-blue-600',
    };
    const blackTextRates = [3, 9];

    if (isVencida) {
        return { cardColorClass: 'bg-gradient-to-br from-red-600 to-rose-800 animate-pulse', textColor: 'text-white', isVibrant: true };
    }
    if (status === 'Por Vencer') {
        return { cardColorClass: 'bg-yellow-500 border-yellow-600 animate-pulse', textColor: 'text-black', isVibrant: true };
    }
    
    if (status === 'Ocupada' && rate && rate.id in rateColorMap) {
      const cardClass = rateColorMap[rate.id];
      const textClass = blackTextRates.includes(rate.id) ? 'text-black' : 'text-white';
      return { cardColorClass: cardClass, textColor: textClass, isVibrant: true };
    }
    
    if (status === 'Error') {
        return { cardColorClass: 'border-gray-500 bg-gray-50', textColor: 'text-gray-700', isVibrant: false };
    }
    
    return { cardColorClass: 'border-blue-500 bg-blue-50', textColor: 'text-blue-700', isVibrant: false };
  }, [status, rate, isVencida]);

  const VehicleIcon = room.entry_type === 'Auto' ? Car : room.entry_type === 'Moto' ? MotorcycleIcon : PersonStanding;
  const contentBgClass = isVibrant ? 'bg-black/10' : 'bg-background/70';

  return (
    <Card className={cn("rounded-2xl shadow-md", cardColorClass, textColor)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
        <CardTitle className="text-2xl font-bold font-headline">{room.name}</CardTitle>
        <div className="flex items-center gap-2">
          {isVencida && <AlertTriangle className="h-6 w-6" />}
          <VehicleIcon className="h-6 w-6" />
          <div className="text-right">
            <p className="font-semibold text-sm">{rate?.name}</p>
            <p className="text-xs opacity-80">{rate?.hours} horas</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className={cn("text-center rounded-lg p-3 mb-3", contentBgClass)}>
          <p className="text-xs font-semibold opacity-80">{isVencida ? 'HABITACIÓN VENCIDA' : 'HORA DE SALIDA'}</p>
          <p className="text-3xl font-bold font-mono tracking-tight">{formatToMexicanTime(room.check_out_time!)}</p>
          <p className="text-sm font-semibold">
            {timeLeft}
          </p>
        </div>
        
        <Progress value={progress} className={cn("h-2 mb-3", {'[&>div]:bg-white': isVibrant && textColor === 'text-white'}, {'[&>div]:bg-black': isVibrant && textColor === 'text-black'})} />

        <div className="flex justify-around items-center text-sm font-semibold opacity-80">
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
