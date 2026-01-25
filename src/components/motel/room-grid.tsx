'use client';
import { useState } from 'react';
import type { Room, Rate, RoomType } from '@/lib/types';
import { RoomCard } from './room-card';
import CheckInModal from './check-in-modal';

interface RoomGridProps {
  rooms: Room[];
  rates: Rate[];
  roomTypes: RoomType[];
}

export default function RoomGrid({ rooms, rates, roomTypes }: RoomGridProps) {
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
          <RoomCard key={room.id} room={room} onOccupy={handleOccupyClick} />
        ))}
      </div>
      {selectedRoom && (
        <CheckInModal
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          room={selectedRoom}
          rates={rates.filter(r => r.room_type_id === selectedRoom.room_type_id)}
        />
      )}
    </>
  );
}
