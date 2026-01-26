'use client';

import type { Room, Rate, RoomType } from '@/lib/types';
import { OccupancyMonitorCard } from './occupancy-monitor-card';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LayoutGrid } from 'lucide-react';

interface OccupancyMonitorPageProps {
  rooms: Room[];
  rates: Rate[];
  roomTypes: RoomType[];
}

export default function OccupancyMonitorPage({ rooms, rates, roomTypes }: OccupancyMonitorPageProps) {
  const occupiedRooms = rooms.filter(r => r.status === 'Ocupada');

  return (
    <div className="flex-1 space-y-4 pt-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><LayoutGrid/> Monitor de Ocupación</CardTitle>
          <CardDescription>Vista de solo lectura del estado de las habitaciones ocupadas.</CardDescription>
        </CardHeader>
      </Card>
      {occupiedRooms.length > 0 ? (
        <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {occupiedRooms.map(room => {
            const rate = rates.find(r => r.id === room.rate_id);
            return <OccupancyMonitorCard key={room.id} room={room} rate={rate} />;
          })}
        </div>
      ) : (
         <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
                <p>No hay habitaciones ocupadas en este momento.</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
