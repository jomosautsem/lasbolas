import { AppLayout } from '@/components/motel/app-layout';
import DashboardKPIs from '@/components/motel/dashboard-kpis';
import RoomGrid from '@/components/motel/room-grid';
import { rooms, products, transactions, expenses } from '@/lib/data';
import { getCurrentShiftInfo } from '@/lib/datetime';

export default function Home() {
  const shiftInfo = getCurrentShiftInfo();

  return (
    <AppLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <DashboardKPIs
          rooms={rooms}
          transactions={transactions}
          expenses={expenses}
        />
        <RoomGrid rooms={rooms} rates={[]} roomTypes={[]} />
      </div>
    </AppLayout>
  );
}
