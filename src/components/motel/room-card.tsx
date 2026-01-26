'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Bed, Car, Sparkles, Wrench, Trash2, Menu, PersonStanding, Users, ArrowRight,
  LogOut, SlidersHorizontal, ArrowRightLeft, TrendingUp, PlusCircle, MinusCircle, UserPlus, UserMinus, Edit, X, DollarSign, Tv, Wind
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Room, Rate, RoomType } from '@/lib/types';
import { formatToMexicanTime, formatToMexicanDate } from '@/lib/datetime';
import { MotorcycleIcon } from '@/components/icons';
import ControlsModal from './controls-modal';
import ReleaseWarningModal from './release-warning-modal';
import ChangeRoomModal from './change-room-modal';
import AdjustPackageModal from './adjust-package-modal';

interface RoomCardProps {
  room: Room;
  allRooms: Room[];
  rates: Rate[];
  roomTypes: RoomType[];
  onOccupy: (room: Room) => void;
  onUpdateControls: (roomId: number, tvControls: number, acControls: number) => void;
  onReleaseRoom: (roomId: number) => void;
  onFinishCleaning: (roomId: number) => void;
  onRoomChange: (fromRoomId: number, toRoomId: number) => void;
  onAdjustPackage: (roomId: number, newRate: Rate, difference: number) => void;
  onExtendStay: (roomId: number) => void;
}

const statusConfig: { [key: string]: { icon: React.ElementType, color: string, labelColor: string, textColor: string } } = {
    Disponible: { icon: Bed, color: 'bg-green-100 border-green-500 text-green-700', labelColor: 'bg-green-500', textColor: 'text-green-700' },
    Ocupada: { icon: Bed, color: 'bg-blue-100 border-blue-500 text-blue-700', labelColor: 'bg-blue-500', textColor: 'text-blue-700' },
    Limpieza: { icon: Sparkles, color: 'bg-cyan-100 border-cyan-500 text-cyan-700', labelColor: 'bg-cyan-500', textColor: 'text-cyan-700' },
    Mantenimiento: { icon: Wrench, color: 'bg-gray-200 border-gray-500 text-gray-600', labelColor: 'bg-gray-500', textColor: 'text-gray-600' },
    Profunda: { icon: Trash2, color: 'bg-purple-100 border-purple-500 text-purple-700', labelColor: 'bg-purple-500', textColor: 'text-purple-700' },
    Vencida: { icon: Bed, color: 'bg-red-500 border-red-600 text-white', labelColor: 'bg-red-600', textColor: 'text-white' },
};

const ActionButton = ({ icon: Icon, label, colorClass = '', className = '', ...props }: { icon: React.ElementType, label: string, colorClass?: string, className?: string, onClick?: () => void, disabled?: boolean }) => (
    <Button variant="outline" className={cn("h-auto flex-col p-2 space-y-1 bg-white/80 dark:bg-black/20 border-white/50 dark:border-black/50 hover:bg-white dark:hover:bg-black/40", className)} {...props}>
        <Icon className={cn("h-6 w-6", colorClass)} />
        <span className={cn("text-xs font-semibold", colorClass)}>{label}</span>
    </Button>
);


export function RoomCard({ room, allRooms, rates, roomTypes, onOccupy, onUpdateControls, onReleaseRoom, onFinishCleaning, onRoomChange, onAdjustPackage, onExtendStay }: RoomCardProps) {
  const [isClient, setIsClient] = useState(false);
  const [isExpiredClient, setIsExpiredClient] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isControlsModalOpen, setIsControlsModalOpen] = useState(false);
  const [isReleaseWarningOpen, setIsReleaseWarningOpen] = useState(false);
  const [isChangeRoomModalOpen, setIsChangeRoomModalOpen] = useState(false);
  const [isAdjustPackageModalOpen, setIsAdjustPackageModalOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (room.status === 'Ocupada' && room.check_out_time) {
      const checkExpired = () => {
        const expired = new Date(room.check_out_time!) < new Date();
        setIsExpiredClient(expired);
      };
      checkExpired();
      const timerId = setInterval(checkExpired, 60000); // Check every minute
      return () => clearInterval(timerId);
    }
  }, [room.status, room.check_out_time]);

  const handleReleaseClick = () => {
    if (room.tv_controls > 0 || room.ac_controls > 0) {
      setIsReleaseWarningOpen(true);
    } else {
      onReleaseRoom(room.id);
      setIsMenuOpen(false);
    }
  };

  const roomType = roomTypes.find(rt => rt.id === room.room_type_id);
  const rate = useMemo(() => room.rate_id ? rates.find(r => r.id === room.rate_id) : null, [room.rate_id, rates]);
  
  const isOccupied = room.status === 'Ocupada';
  const isExpired = isClient && isExpiredClient;
  const effectiveStatus = isExpired ? 'Vencida' : room.status;
  
  const baseConfig = statusConfig[effectiveStatus] || statusConfig['Disponible'];

  const { cardColorClass, textColor } = useMemo(() => {
    // Centralize rate color logic here to ensure Tailwind includes the classes
    const rateColorMap: { [key: number]: string } = {
      1: 'bg-green-500 border-green-600', // 2h
      2: 'bg-orange-500 border-orange-600', // 4h
      3: 'bg-yellow-500 border-yellow-600', // 5h
      4: 'bg-purple-500 border-purple-600', // 8h
      5: 'bg-blue-500 border-blue-600', // 12h
      7: 'bg-green-500 border-green-600',
      8: 'bg-orange-500 border-orange-600',
      9: 'bg-yellow-500 border-yellow-600',
      10: 'bg-purple-500 border-purple-600',
      11: 'bg-blue-500 border-blue-600',
    };
    
    // Define which backgrounds should have dark text for better contrast
    const darkTextBgs = ['bg-yellow-500'];

    if (isOccupied && !isExpired && rate) {
        const colorClass = rateColorMap[rate.id];
        if (colorClass) {
            const useDarkText = darkTextBgs.some(bg => colorClass.includes(bg));
            return { cardColorClass: colorClass, textColor: useDarkText ? 'text-black' : 'text-white' };
        }
    }
    return { cardColorClass: baseConfig.color, textColor: baseConfig.textColor };
  }, [isOccupied, isExpired, rate, baseConfig]);


  const separatorClass = textColor === 'text-black' ? 'bg-black/20' : 'bg-white/20';
  const contentBgClass = textColor === 'text-black' ? 'bg-white/70 text-black' : 'bg-black/20 text-white';

  const VehicleIcon = room.entry_type === 'Auto' ? Car : MotorcycleIcon;

  const canExtendStay = useMemo(() => {
    if (!rate) return false;
    return rate.hours >= 8;
  }, [rate]);

  return (
    <>
    <Card className={cn('rounded-2xl shadow-lg transition-all hover:shadow-xl flex flex-col', cardColorClass, textColor)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-3">
        <div>
          <CardTitle className="text-xl font-bold font-headline">{room.name.replace('Habitación ', 'Hab ')}</CardTitle>
          {roomType && <span className="text-xs font-semibold">{roomType.name.toUpperCase()}</span>}
        </div>
        <Badge className={cn('text-white', baseConfig.labelColor)}>{effectiveStatus}</Badge>
      </CardHeader>

      <CardContent className="p-3 flex-grow flex flex-col justify-center items-center gap-2">
        {isOccupied ? (
          isMenuOpen ? (
            <div className="w-full text-sm">
                <div className={cn("rounded-lg p-2 mb-3", contentBgClass)}>
                    <div className="flex justify-between items-center text-xs opacity-80 mb-1">
                        <span className="flex items-center gap-1 font-semibold"><DollarSign className="h-4 w-4" /> CUENTA</span>
                        <span>{isClient && room.check_in_time ? formatToMexicanDate(room.check_in_time) : ''}</span>
                    </div>
                    <div className="flex justify-between items-center font-medium py-1">
                        <span><Bed className="inline-block mr-2 h-4 w-4" />Hospedaje Inicial</span>
                        <span>${rate?.price.toFixed(2)}</span>
                    </div>
                    <Separator className={cn("my-2", separatorClass)} />
                    <div className="flex justify-between items-center font-bold text-lg">
                        <span>TOTAL</span>
                        <span className="rounded-md bg-green-200 text-green-800 px-2 py-1">${room.total_debt?.toFixed(2)}</span>
                    </div>
                </div>

                <div className={cn("grid grid-cols-3 gap-2 text-center", textColor === 'text-black' ? 'text-black' : 'text-card-foreground' )}>
                    <ActionButton icon={LogOut} label="Liberar" colorClass="text-red-500" onClick={handleReleaseClick} />
                    <ActionButton icon={SlidersHorizontal} label="Controles" onClick={() => setIsControlsModalOpen(true)}/>
                    <ActionButton icon={ArrowRightLeft} label="Cambiar Hab." onClick={() => setIsChangeRoomModalOpen(true)}/>
                    <ActionButton icon={TrendingUp} label="Ajustar Paq." onClick={() => setIsAdjustPackageModalOpen(true)} />
                    <ActionButton icon={PlusCircle} label="Aumentar" colorClass="text-green-600" onClick={() => onExtendStay(room.id)} disabled={!canExtendStay} />
                    <ActionButton icon={MinusCircle} label="Reducir" colorClass="text-red-500" />
                    <ActionButton icon={UserPlus} label="+ Persona" />
                    <ActionButton icon={UserMinus} label="- Persona" />
                    <ActionButton icon={Edit} label="Editar E/S" />
                </div>
            </div>
          ) : (
           <div className="w-full rounded-lg p-3 space-y-2 text-sm bg-black/10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 font-semibold">
                <PersonStanding className="h-5 w-5" />
                <span>{room.customer_name}</span>
              </div>
              <Badge variant="outline" className="flex items-center gap-1 border-current/50 bg-transparent">
                <Users className="h-4 w-4" />
                {room.persons}
              </Badge>
            </div>

            <div className="text-center rounded-md bg-black/10 p-2">
              <div className="text-xs font-semibold opacity-80">HORARIO</div>
              <div className="flex items-center justify-center gap-2 font-mono text-base">
                {isClient && room.check_in_time && room.check_out_time ? (
                  <>
                    <span>{formatToMexicanTime(room.check_in_time)}</span>
                    <ArrowRight className="h-4 w-4" />
                    <span>{formatToMexicanTime(room.check_out_time)}</span>
                  </>
                ) : (
                  <span>--:-- → --:--</span>
                )}
              </div>
            </div>
            
            <Separator className={cn("my-1", separatorClass)} />

            {room.entry_type && room.entry_type !== 'Pie' && (
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <VehicleIcon className="h-5 w-5" />
                  <div>
                    <div className="font-semibold">{room.entry_type}</div>
                    <div className="text-xs opacity-80">{room.vehicle_brand} {room.vehicle_details}</div>
                  </div>
                </div>
                <Badge variant="outline" className="border-current/50 bg-transparent">{room.vehicle_plate || 'SIN PLACA'}</Badge>
              </div>
            )}
            
            <div className="flex justify-between items-center text-xs opacity-80 pt-1">
                <span className="flex items-center gap-1"><Tv className="h-4 w-4"/> {room.tv_controls}</span>
                <span className="flex items-center gap-1"><Wind className="h-4 w-4"/> {room.ac_controls}</span>
            </div>

            <Separator className={cn("my-1", separatorClass)} />

            <div className="flex justify-between items-center text-base font-bold">
              <span>HOSPEDAJE</span>
              <span>${rate?.price.toFixed(2)}</span>
            </div>
           </div>
          )
        ) : (
          <div className={cn("text-center text-sm py-8", baseConfig.textColor, "opacity-70")}>
            {room.status === 'Disponible' ? 'Lista para rentar' : `En ${room.status}`}
          </div>
        )}
      </CardContent>

      <CardFooter className={cn("p-2 rounded-b-2xl bg-black/5", textColor === 'text-black' ? 'border-t border-black/10' : '')}>
          {room.status === 'Disponible' ? (
            <Button className="w-full" onClick={() => onOccupy(room)}>Ocupar</Button>
          ) : isOccupied || effectiveStatus === 'Vencida' ? (
             isMenuOpen ? (
                <Button className="w-full bg-white text-black hover:bg-gray-200 font-semibold border border-slate-300" onClick={() => setIsMenuOpen(false)}><X className="mr-2 h-4 w-4"/> Cerrar Menú</Button>
             ) : (
                <Button className="w-full bg-white text-black hover:bg-gray-200 font-semibold border border-slate-300" onClick={() => setIsMenuOpen(true)}><Menu className="mr-2 h-4 w-4"/> Gestionar Habitación</Button>
             )
          ) : room.status === 'Limpieza' ? (
            <Button className="w-full" variant="outline" onClick={() => onFinishCleaning(room.id)}>
              <Sparkles className="mr-2 h-4 w-4 text-cyan-500" /> Poner Disponible
            </Button>
          ) : (
            <div className="h-10"></div>
          )}
        </CardFooter>
    </Card>
    {isOccupied && (
      <ControlsModal 
        isOpen={isControlsModalOpen}
        onOpenChange={setIsControlsModalOpen}
        room={room}
        onSave={onUpdateControls}
      />
    )}
    <ReleaseWarningModal 
      isOpen={isReleaseWarningOpen}
      onOpenChange={setIsReleaseWarningOpen}
    />
    {isOccupied && (
        <ChangeRoomModal
            isOpen={isChangeRoomModalOpen}
            onOpenChange={setIsChangeRoomModalOpen}
            currentRoom={room}
            allRooms={allRooms}
            onConfirmChange={onRoomChange}
        />
    )}
    {isOccupied && (
      <AdjustPackageModal
        isOpen={isAdjustPackageModalOpen}
        onOpenChange={setIsAdjustPackageModalOpen}
        currentRoom={room}
        allRates={rates}
        onConfirmAdjust={onAdjustPackage}
      />
    )}
    </>
  );
}
