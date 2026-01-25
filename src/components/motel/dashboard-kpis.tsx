'use client';
import type { Room, Transaction, Expense } from '@/lib/types';
import KPICard from './kpi-card';
import { DollarSign, Bed, ArrowDownCircle } from 'lucide-react';
import { getCurrentShiftInfo } from '@/lib/datetime';
import { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface DashboardKPIsProps {
  rooms: Room[];
  transactions: Transaction[];
  expenses: Expense[];
}

interface KpiData {
    totalIncome: number;
    rentIncome: number;
    consumptionIncome: number;
    occupiedRooms: number;
    totalExpenses: number;
    shiftExpensesCount: number;
    netProfit: number;
}

export default function DashboardKPIs({ rooms, transactions, expenses }: DashboardKPIsProps) {
  const [kpiData, setKpiData] = useState<KpiData | null>(null);

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
      .filter(t => t.type === 'Hospedaje Inicial' || t.type === 'Tiempo Extra')
      .reduce((sum, t) => sum + t.amount, 0);

    const consumptionIncome = shiftTransactions
      .filter(t => t.type === 'Consumo')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = rentIncome + consumptionIncome;
    const totalExpenses = shiftExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalIncome - totalExpenses;
    
    setKpiData({
        totalIncome,
        rentIncome,
        consumptionIncome,
        occupiedRooms,
        totalExpenses,
        shiftExpensesCount: shiftExpenses.length,
        netProfit,
    });
  }, [rooms, transactions, expenses]);

  if (!kpiData) {
    return (
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="rounded-2xl shadow-lg border-l-4 border-primary">
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

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      <KPICard
        title="Ingresos del Turno"
        amount={`$${kpiData.totalIncome.toFixed(2)}`}
        description={`Renta: $${kpiData.rentIncome.toFixed(2)} | Consumo: $${kpiData.consumptionIncome.toFixed(2)}`}
        icon={DollarSign}
        color="text-green-500"
      />
      <KPICard
        title="Habitaciones Ocupadas"
        amount={`${kpiData.occupiedRooms} de ${rooms.length}`}
        description={`${occupiedPercentage.toFixed(0)}% de ocupación`}
        icon={Bed}
        color="text-blue-500"
      />
      <KPICard
        title="Gastos del Turno"
        amount={`$${kpiData.totalExpenses.toFixed(2)}`}
        description={`${kpiData.shiftExpensesCount} gastos registrados`}
        icon={ArrowDownCircle}
        color="text-red-500"
      />
      <KPICard
        title="Utilidad Neta en Caja"
        amount={`$${kpiData.netProfit.toFixed(2)}`}
        description="Ingresos - Gastos"
        icon={DollarSign}
        color="text-violet-500"
      />
    </div>
  );
}
