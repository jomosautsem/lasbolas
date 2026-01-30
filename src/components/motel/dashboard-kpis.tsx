'use client';
import type { Room, Transaction, Expense } from '@/lib/types';
import KPICard from './kpi-card';
import { DollarSign, Bed, ArrowDownCircle, Wallet, Clock, AlertTriangle } from 'lucide-react';
import { getCurrentShiftInfo, getMexicoCityTime } from '@/lib/datetime';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DashboardKPIsProps {
  rooms: Room[];
  transactions: Transaction[];
  expenses: Expense[];
}

interface ExpiredRoomInfo {
    name: string;
    time: string;
}

interface KpiData {
    totalIncome: number;
    rentIncome: number;
    consumptionIncome: number;
    employeeSaleIncome: number;
    occupiedRooms: number;
    totalExpenses: number;
    shiftExpensesCount: number;
    netProfit: number;
    expiredRooms: ExpiredRoomInfo[];
}

const ExpiredRoomsCard = ({ rooms }: { rooms: ExpiredRoomInfo[] }) => {
    if (rooms.length === 0) {
        return (
             <KPICard
                title="Habitaciones Vencidas"
                amount="0"
                description="Ninguna habitación vencida"
                icon={Clock}
                isGradient={true}
                gradientClassName="bg-gradient-to-br from-teal-600 to-cyan-800"
              />
        );
    }
    
    return (
        <Card className="rounded-2xl shadow-lg text-white bg-gradient-to-br from-red-600 to-rose-800 animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
                <CardTitle className="text-sm font-medium">Habitaciones Vencidas</CardTitle>
                <AlertTriangle className="h-5 w-5" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="text-3xl font-bold font-headline">{rooms.length}</div>
                <ScrollArea className="h-[4.5rem] mt-1 pr-2">
                    <div className="text-xs space-y-1">
                    {rooms.map(room => (
                        <div key={room.name} className="flex justify-between gap-2">
                            <span className="font-semibold">{room.name}</span>
                            <span className="text-right whitespace-nowrap">{room.time}</span>
                        </div>
                    ))}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    )
}

export default function DashboardKPIs({ rooms, transactions, expenses }: DashboardKPIsProps) {
  const [kpiData, setKpiData] = useState<KpiData | null>(null);
  const [now, setNow] = useState(getMexicoCityTime());

  useEffect(() => {
      const timer = setInterval(() => setNow(getMexicoCityTime()), 30000); // update every 30 seconds
      return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const shiftInfo = getCurrentShiftInfo();

    const occupiedRooms = rooms.filter(r => r.status === 'Ocupada').length;
    
    const shiftTransactions = transactions.filter(t => {
      const tShiftInfo = getCurrentShiftInfo(new Date(t.timestamp));
      return tShiftInfo.shift === shiftInfo.shift && tShiftInfo.operationalDate.getTime() === shiftInfo.operationalDate.getTime();
    });
    
    const shiftExpenses = expenses.filter(e => {
      const eShiftInfo = getCurrentShiftInfo(new Date(e.date));
      return eShiftInfo.shift === shiftInfo.shift && eShiftInfo.operationalDate.getTime() === shiftInfo.operationalDate.getTime();
    });

    const rentIncome = shiftTransactions
      .filter(t => t.type === 'Hospedaje Inicial' || t.type === 'Tiempo Extra' || t.type === 'Ajuste de Paquete' || t.type === 'Persona Extra')
      .reduce((sum, t) => sum + t.amount, 0);

    const consumptionIncome = shiftTransactions
      .filter(t => t.type === 'Consumo')
      .reduce((sum, t) => sum + t.amount, 0);

    const employeeSaleIncome = shiftTransactions
      .filter(t => t.type === 'Venta a Empleado')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = rentIncome + consumptionIncome + employeeSaleIncome;
    const totalExpenses = shiftExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    
    const expiredRoomsData = rooms
        .filter(r => r.status === 'Ocupada' && r.check_out_time && new Date(r.check_out_time) < now)
        .map(r => ({
            name: r.name,
            time: formatDistanceToNow(new Date(r.check_out_time!), { locale: es, addSuffix: true })
        }));

    setKpiData({
        totalIncome,
        rentIncome,
        consumptionIncome,
        employeeSaleIncome,
        occupiedRooms,
        totalExpenses,
        shiftExpensesCount: shiftExpenses.length,
        netProfit,
        expiredRooms: expiredRoomsData,
    });
  }, [rooms, transactions, expenses, now]);

  if (!kpiData) {
    return (
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="rounded-2xl shadow-lg border-l-4 border-primary h-32">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-5 w-5 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-1/2 mb-2" />
              <Skeleton className="h-3 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const occupiedPercentage = rooms.length > 0 ? ((kpiData.occupiedRooms ?? 0) / rooms.length) * 100 : 0;
  const incomeDescription = `Renta: $${kpiData.rentIncome.toFixed(2)} | Consumo: $${kpiData.consumptionIncome.toFixed(2)} | Empleados: $${kpiData.employeeSaleIncome.toFixed(2)}`;

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-5">
      <KPICard
        title="Habitaciones Ocupadas"
        amount={`${kpiData.occupiedRooms} de ${rooms.length}`}
        description={`${occupiedPercentage.toFixed(0)}% de ocupación`}
        icon={Bed}
        isGradient={true}
        gradientClassName="bg-gradient-to-br from-yellow-500 to-orange-600"
      />
      <ExpiredRoomsCard rooms={kpiData.expiredRooms} />
      <KPICard
        title="Ingresos del Turno"
        amount={`$${kpiData.totalIncome.toFixed(2)}`}
        description={incomeDescription}
        icon={DollarSign}
        isGradient={true}
        gradientClassName="bg-gradient-to-br from-green-600 to-emerald-800"
      />
      <KPICard
        title="Gastos del Turno"
        amount={`$${kpiData.totalExpenses.toFixed(2)}`}
        description={`${kpiData.shiftExpensesCount} gastos registrados`}
        icon={ArrowDownCircle}
        isGradient={true}
        gradientClassName="bg-gradient-to-br from-rose-500 to-pink-700"
      />
      <KPICard
        title="Utilidad Neta en Caja"
        amount={`$${kpiData.netProfit.toFixed(2)}`}
        description="Ingresos - Gastos"
        icon={Wallet}
        isGradient={true}
        gradientClassName="bg-gradient-to-br from-blue-600 to-indigo-800"
      />
    </div>
  );
}
