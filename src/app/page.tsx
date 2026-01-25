'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/motel/app-layout';
import DashboardKPIs from '@/components/motel/dashboard-kpis';
import RoomGrid from '@/components/motel/room-grid';
import { rooms as initialRooms, products, transactions, expenses, rates, roomTypes } from '@/lib/data';
import { getCurrentShiftInfo } from '@/lib/datetime';
import type { Room } from '@/lib/types';

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);

  const handleConfirmCheckIn = (roomToUpdate: Room, checkInData: any) => {
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
        />
      </div>
    </AppLayout>
  );
}
