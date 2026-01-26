'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/motel/app-layout';
import DashboardKPIs from '@/components/motel/dashboard-kpis';
import RoomGrid from '@/components/motel/room-grid';
import { rooms as initialRooms, products, transactions as initialTransactions, expenses, rates, roomTypes } from '@/lib/data';
import { getCurrentShiftInfo } from '@/lib/datetime';
import type { Room, Transaction } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

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
        />
      </div>
    </AppLayout>
  );
}
