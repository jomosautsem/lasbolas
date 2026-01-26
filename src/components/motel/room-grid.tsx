'use client';
import { useState } from 'react';
import type { Room, Rate, RoomType, Transaction } from '@/lib/types';
import { RoomCard } from './room-card';
import CheckInModal from './check-in-modal';

interface RoomGridProps {
  rooms: Room[];
  rates: Rate[];
  roomTypes: RoomType[];
  transactions: Transaction[];
  onConfirmCheckIn: (room: Room, data: any) => void;
  onUpdateControls: (roomId: number, tvControls: number, acControls: number) => void;
  onReleaseRoom: (roomId: number) => void;
  onFinishCleaning: (roomId: number) => void;
  onRoomChange: (fromRoomId: number, toRoomId: number) => void;
  onAdjustPackage: (roomId: number, newRate: Rate, difference: number) => void;
  onExtendStay: (roomId: number) => void;
  onAddPerson: (roomId: number, amount: number) => void;
  onRemovePerson: (roomId: number) => void;
}

export default function RoomGrid({ rooms, rates, roomTypes, transactions, onConfirmCheckIn, onUpdateControls, onReleaseRoom, onFinishCleaning, onRoomChange, onAdjustPackage, onExtendStay, onAddPerson, onRemovePerson }: RoomGridProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);

  const handleOccupyClick = (room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {rooms.map((room) => (
          <RoomCard 
            key={room.id} 
            room={room}
            allRooms={rooms}
            onOccupy={handleOccupyClick}
            rates={rates}
            roomTypes={roomTypes}
            allTransactions={transactions}
            onUpdateControls={onUpdateControls}
            onReleaseRoom={onReleaseRoom}
            onFinishCleaning={onFinishCleaning}
            onRoomChange={onRoomChange}
            onAdjustPackage={onAdjustPackage}
            onExtendStay={onExtendStay}
            onAddPerson={onAddPerson}
            onRemovePerson={onRemovePerson}
          />
        ))}
      </div>
      {selectedRoom && (
        <CheckInModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          room={selectedRoom}
          rates={rates.filter(r => r.room_type_id === selectedRoom.room_type_id)}
          roomTypes={roomTypes}
          onConfirm={onConfirmCheckIn}
        />
      )}
    </>
  );
}
