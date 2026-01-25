'use client';
import type { Room, Transaction, Expense } from '@/lib/types';
import KPICard from './kpi-card';
import { DollarSign, Bed, ShoppingCart, ArrowDownCircle } from 'lucide-react';
import { getCurrentShiftInfo } from '@/lib/datetime';

interface DashboardKPIsProps {
  rooms: Room[];
  transactions: Transaction[];
  expenses: Expense[];
}

export default function DashboardKPIs({ rooms, transactions, expenses }: DashboardKPIsProps) {
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

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      <KPICard
        title="Ingresos del Turno"
        amount={`$${totalIncome.toFixed(2)}`}
        description={`Renta: $${rentIncome.toFixed(2)} | Consumo: $${consumptionIncome.toFixed(2)}`}
        icon={DollarSign}
        color="text-green-500"
      />
      <KPICard
        title="Habitaciones Ocupadas"
        amount={`${occupiedRooms} de ${rooms.length}`}
        description={`${((occupiedRooms / rooms.length) * 100).toFixed(0)}% de ocupación`}
        icon={Bed}
        color="text-blue-500"
      />
      <KPICard
        title="Gastos del Turno"
        amount={`$${totalExpenses.toFixed(2)}`}
        description={`${shiftExpenses.length} gastos registrados`}
        icon={ArrowDownCircle}
        color="text-red-500"
      />
      <KPICard
        title="Utilidad Neta en Caja"
        amount={`$${netProfit.toFixed(2)}`}
        description="Ingresos - Gastos"
        icon={DollarSign}
        color="text-violet-500"
      />
    </div>
  );
}
