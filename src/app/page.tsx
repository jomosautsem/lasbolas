'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/motel/app-layout';
import DashboardKPIs from '@/components/motel/dashboard-kpis';
import RoomGrid from '@/components/motel/room-grid';
import { rooms as initialRooms, products, transactions as initialTransactions, expenses, rates, roomTypes } from '@/lib/data';
import { getCurrentShiftInfo } from '@/lib/datetime';
import type { Room, Transaction, Rate } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { addHours } from 'date-fns';

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const { toast } = useToast();

  const handleConfirmCheckIn = (roomToUpdate: Room, checkInData: any) => {
    if (checkInData.selectedRate?.price > 0) {
      const shiftInfo = getCurrentShiftInfo();
      const newTransaction: Transaction = {
        id: Date.now(),
        room_id: roomToUpdate.id,
        amount: checkInData.selectedRate.price,
        type: 'Hospedaje Inicial',
        timestamp: new Date().toISOString(),
        shift: shiftInfo.shift,
        description: `Renta ${checkInData.selectedRate.name} - Hab ${roomToUpdate.name}`,
        turno_calculado: shiftInfo.shift,
        fecha_operativa: shiftInfo.operationalDate.toISOString().split('T')[0],
      };
      setTransactions(currentTransactions => [...currentTransactions, newTransaction]);
    }
    
    setRooms(currentRooms => 
      currentRooms.map(r => {
        if (r.id === roomToUpdate.id) {
          return {
            ...r,
            status: 'Ocupada',
            check_in_time: checkInData.startTime?.toISOString(),
            check_out_time: checkInData.endTime?.toISOString(),
            customer_name: checkInData.customerName,
            persons: checkInData.persons,
            entry_type: checkInData.entryType,
            vehicle_plate: checkInData.plate,
            vehicle_brand: checkInData.marca,
            vehicle_details: `${checkInData.modelo} ${checkInData.color}`,
            rate_id: checkInData.selectedRate?.id,
            total_debt: checkInData.selectedRate?.price || 0,
            tv_controls: 0,
            ac_controls: 0,
          };
        }
        return r;
      })
    );
  };

  const handleUpdateControls = (roomId: number, tvControls: number, acControls: number) => {
    setRooms(currentRooms =>
      currentRooms.map(r => {
        if (r.id === roomId) {
          return { ...r, tv_controls: tvControls, ac_controls: acControls };
        }
        return r;
      })
    );
  };

  const handleReleaseRoom = (roomId: number) => {
    setRooms(currentRooms =>
      currentRooms.map(r => {
        if (r.id === roomId) {
          return {
            ...r,
            status: 'Limpieza',
            check_in_time: null,
            check_out_time: null,
            customer_name: '',
            persons: '0',
            entry_type: undefined,
            vehicle_plate: '',
            vehicle_brand: '',
            vehicle_details: '',
            rate_id: null,
            total_debt: 0,
            tv_controls: 0,
            ac_controls: 0,
          };
        }
        return r;
      })
    );
    const room = rooms.find(r => r.id === roomId);
    if(room) {
      toast({
        title: 'Habitación Liberada',
        description: `La habitación ${room.name} ha sido puesta en limpieza.`,
      });
    }
  };

  const handleFinishCleaning = (roomId: number) => {
    setRooms(currentRooms =>
      currentRooms.map(r => {
        if (r.id === roomId) {
          return { ...r, status: 'Disponible' };
        }
        return r;
      })
    );
    const room = rooms.find(r => r.id === roomId);
    if(room) {
      toast({
        title: 'Habitación Lista',
        description: `La habitación ${room.name} ahora está disponible.`,
      });
    }
  };

  const handleChangeRoom = (fromRoomId: number, toRoomId: number) => {
    const fromRoom = rooms.find(r => r.id === fromRoomId);
    const toRoom = rooms.find(r => r.id === toRoomId);

    if (!fromRoom || !toRoom) {
      console.error("Could not find rooms for change");
      return;
    }

    const updatedRooms = rooms.map(r => {
      // This is the room we are moving FROM. It becomes 'Limpieza'
      if (r.id === fromRoomId) {
        return {
          ...r,
          status: 'Limpieza' as const,
          check_in_time: null,
          check_out_time: null,
          customer_name: '',
          persons: '0',
          entry_type: undefined,
          vehicle_plate: '',
          vehicle_brand: '',
          vehicle_details: '',
          rate_id: null,
          total_debt: 0,
          tv_controls: 0,
          ac_controls: 0,
        };
      }

      // This is the room we are moving TO. It gets all data from 'fromRoom'.
      if (r.id === toRoomId) {
        return {
          ...r, // Keep toRoom's own properties like id, name, room_type_id
          status: 'Ocupada' as const,
          check_in_time: fromRoom.check_in_time,
          check_out_time: fromRoom.check_out_time,
          customer_name: fromRoom.customer_name,
          persons: fromRoom.persons,
          entry_type: fromRoom.entry_type,
          vehicle_plate: fromRoom.vehicle_plate,
          vehicle_brand: fromRoom.vehicle_brand,
          vehicle_details: fromRoom.vehicle_details,
          rate_id: fromRoom.rate_id,
          total_debt: fromRoom.total_debt,
          tv_controls: fromRoom.tv_controls,
          ac_controls: fromRoom.ac_controls,
        };
      }

      // Any other room remains unchanged
      return r;
    });

    setRooms(updatedRooms);

    toast({
      title: 'Cambio de Habitación Exitoso',
      description: `Cliente movido de ${fromRoom.name} a ${toRoom.name}.`,
    });
  };

  const handleAdjustPackage = (roomId: number, newRate: Rate, difference: number) => {
    const roomToUpdate = rooms.find(r => r.id === roomId);
    if (!roomToUpdate || !roomToUpdate.check_in_time) return;

    // Create a new transaction for the difference
    const shiftInfo = getCurrentShiftInfo();
    const newTransaction: Transaction = {
      id: Date.now(),
      room_id: roomId,
      amount: difference,
      type: 'Ajuste de Paquete',
      timestamp: new Date().toISOString(),
      shift: shiftInfo.shift,
      description: `Ajuste a paquete ${newRate.name} - Hab ${roomToUpdate.name}`,
      turno_calculado: shiftInfo.shift,
      fecha_operativa: shiftInfo.operationalDate.toISOString().split('T')[0],
    };
    setTransactions(currentTransactions => [...currentTransactions, newTransaction]);

    // Update the room
    setRooms(currentRooms => 
      currentRooms.map(r => {
        if (r.id === roomId) {
          const checkInTime = new Date(r.check_in_time!);
          const newCheckOutTime = addHours(checkInTime, newRate.hours);

          return {
            ...r,
            rate_id: newRate.id,
            check_out_time: newCheckOutTime.toISOString(),
            total_debt: (r.total_debt || 0) + difference,
          };
        }
        return r;
      })
    );

    toast({
      title: 'Paquete Ajustado Exitosamente',
      description: `Habitación ${roomToUpdate.name} ahora tiene el paquete ${newRate.name}. Se cobró una diferencia de $${difference.toFixed(2)}.`,
    });
  };

  const handleExtendStay = (roomId: number) => {
    const roomToUpdate = rooms.find(r => r.id === roomId);
    if (!roomToUpdate || !roomToUpdate.check_out_time) return;

    const extensionRate = rates.find(r => r.name === 'Extensión 3 Horas' && r.room_type_id === roomToUpdate.room_type_id);

    if (!extensionRate) {
      toast({
        variant: 'destructive',
        title: 'Configuración Faltante',
        description: "La tarifa de 'Extensión 3 Horas' no está configurada para este tipo de habitación.",
      });
      return;
    }

    // Create a new transaction for the extension
    const shiftInfo = getCurrentShiftInfo();
    const newTransaction: Transaction = {
      id: Date.now(),
      room_id: roomId,
      amount: extensionRate.price,
      type: 'Tiempo Extra',
      timestamp: new Date().toISOString(),
      shift: shiftInfo.shift,
      description: `Extensión 3 Horas - Hab ${roomToUpdate.name}`,
      turno_calculado: shiftInfo.shift,
      fecha_operativa: shiftInfo.operationalDate.toISOString().split('T')[0],
    };
    setTransactions(currentTransactions => [...currentTransactions, newTransaction]);

    // Update the room
    setRooms(currentRooms => 
      currentRooms.map(r => {
        if (r.id === roomId) {
          const currentCheckOutTime = new Date(r.check_out_time!);
          const newCheckOutTime = addHours(currentCheckOutTime, extensionRate.hours);

          return {
            ...r,
            check_out_time: newCheckOutTime.toISOString(),
            total_debt: (r.total_debt || 0) + extensionRate.price,
          };
        }
        return r;
      })
    );

    toast({
      title: 'Estancia Extendida',
      description: `Se agregaron ${extensionRate.hours} horas a la habitación ${roomToUpdate.name} por $${extensionRate.price.toFixed(2)}.`,
    });
  };

  const handleAddPerson = (roomId: number, amount: number) => {
    const roomToUpdate = rooms.find(r => r.id === roomId);
    if (!roomToUpdate) return;

    if (amount > 0) {
      const shiftInfo = getCurrentShiftInfo();
      const newTransaction: Transaction = {
        id: Date.now(),
        room_id: roomId,
        amount: amount,
        type: 'Persona Extra',
        timestamp: new Date().toISOString(),
        shift: shiftInfo.shift,
        description: `Persona Extra - Hab ${roomToUpdate.name}`,
        turno_calculado: shiftInfo.shift,
        fecha_operativa: shiftInfo.operationalDate.toISOString().split('T')[0],
      };
      setTransactions(currentTransactions => [...currentTransactions, newTransaction]);
    }

    setRooms(currentRooms => 
      currentRooms.map(r => {
        if (r.id === roomId) {
          const currentPersons = parseInt(r.persons || '0', 10);
          return {
            ...r,
            persons: (currentPersons + 1).toString(),
            total_debt: (r.total_debt || 0) + amount,
          };
        }
        return r;
      })
    );

    toast({
      title: 'Persona Agregada',
      description: `Se agregó una persona a la habitación ${roomToUpdate.name}. ${amount > 0 ? `Se cobraron $${amount.toFixed(2)}.` : 'Sin costo.'}`,
    });
  };

  const handleRemovePerson = (roomId: number) => {
    const roomToUpdate = rooms.find(r => r.id === roomId);
    if (!roomToUpdate) return;
    
    const currentPersons = parseInt(roomToUpdate.persons || '0', 10);
    if (currentPersons <= 0) {
      toast({
        variant: "destructive",
        title: 'Acción no válida',
        description: `La habitación ${roomToUpdate.name} no tiene personas para reducir.`,
      });
      return;
    }

    setRooms(currentRooms => 
      currentRooms.map(r => {
        if (r.id === roomId) {
          return {
            ...r,
            persons: (currentPersons - 1).toString(),
          };
        }
        return r;
      })
    );

    toast({
      title: 'Persona Removida',
      description: `Se redujo una persona de la habitación ${roomToUpdate.name}.`,
    });
  };


  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <DashboardKPIs
          rooms={rooms}
          transactions={transactions}
          expenses={expenses}
        />
        <RoomGrid 
          rooms={rooms} 
          rates={rates} 
          roomTypes={roomTypes}
          onConfirmCheckIn={handleConfirmCheckIn}
          onUpdateControls={handleUpdateControls}
          onReleaseRoom={handleReleaseRoom}
          onFinishCleaning={handleFinishCleaning}
          onRoomChange={handleChangeRoom}
          onAdjustPackage={handleAdjustPackage}
          onExtendStay={handleExtendStay}
          onAddPerson={handleAddPerson}
          onRemovePerson={handleRemovePerson}
        />
      </div>
    </AppLayout>
  );
}
