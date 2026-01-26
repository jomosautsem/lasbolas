'use client';

import { useState, useMemo } from 'react';
import type { Transaction, Expense, Shift, Room, TransactionType } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, DollarSign, Bed, ShoppingCart, Users, UserPlus, Clock, Download, RefreshCw, FileText, ChevronDown, History, ArrowRight } from 'lucide-react';
import { getCurrentShiftInfo, getMexicoCityTime, formatToMexicanTime } from '@/lib/datetime';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';

interface ReportsPageProps {
  rooms: Room[];
  transactions: Transaction[];
  expenses: Expense[];
}

const shifts: { value: Shift; label: string }[] = [
  { value: 'Matutino', label: 'Matutino (07:00 - 14:00)' },
  { value: 'Vespertino', label: 'Vespertino (14:00 - 21:00)' },
  { value: 'Nocturno', label: 'Nocturno (21:00 - 07:00)' },
];

const StatCard = ({ title, value, icon: Icon, className }: { title: string; value: string; icon: React.ElementType, className?: string }) => (
    <div className={cn("rounded-xl p-4 flex-1", className)}>
        <div className="flex items-center justify-between mb-1">
            <p className="text-sm font-medium">{title}</p>
            <Icon className="h-5 w-5 opacity-70" />
        </div>
        <p className="text-2xl font-bold">{value}</p>
    </div>
);

export default function ReportsPage({ rooms, transactions, expenses }: ReportsPageProps) {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(getMexicoCityTime());
    const [selectedShift, setSelectedShift] = useState<Shift>(getCurrentShiftInfo().shift);

    const filteredData = useMemo(() => {
        if (!selectedDate) {
            return { filteredTransactions: [], filteredExpenses: [] };
        }
        const operationalDateStr = format(selectedDate, 'yyyy-MM-dd');

        const filteredTransactions = transactions.filter(t => 
            t.fecha_operativa === operationalDateStr && t.turno_calculado === selectedShift
        );

        const filteredExpenses = expenses.filter(e => {
            const eShiftInfo = getCurrentShiftInfo(new Date(e.date));
            const eOpDateStr = format(eShiftInfo.operationalDate, 'yyyy-MM-dd');
            return eOpDateStr === operationalDateStr && eShiftInfo.shift === selectedShift;
        });

        return { filteredTransactions, filteredExpenses };
    }, [selectedDate, selectedShift, transactions, expenses]);

    const summary = useMemo(() => {
        const { filteredTransactions, filteredExpenses } = filteredData;
        
        const rentIncome = filteredTransactions
            .filter(t => t.type === 'Hospedaje Inicial' || t.type === 'Ajuste de Paquete')
            .reduce((sum, t) => sum + t.amount, 0);
        
        const extraTimeIncome = filteredTransactions
            .filter(t => t.type === 'Tiempo Extra')
            .reduce((sum, t) => sum + t.amount, 0);

        const extraPersonIncome = filteredTransactions
            .filter(t => t.type === 'Persona Extra')
            .reduce((sum, t) => sum + t.amount, 0);
            
        const roomProductsIncome = filteredTransactions
            .filter(t => t.type === 'Consumo')
            .reduce((sum, t) => sum + t.amount, 0);

        const employeeConsumptionIncome = filteredTransactions
            .filter(t => t.type === 'Venta a Empleado')
            .reduce((sum, t) => sum + t.amount, 0);

        const totalIncome = rentIncome + extraTimeIncome + extraPersonIncome + roomProductsIncome + employeeConsumptionIncome;

        const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

        const netProfit = totalIncome - totalExpenses;

        return {
            rentIncome,
            extraTimeIncome,
            extraPersonIncome,
            roomProductsIncome,
            employeeConsumptionIncome,
            totalIncome,
            totalExpenses,
            netProfit,
            expensesList: filteredExpenses
        };
    }, [filteredData]);
    
    const roomLogData = useMemo(() => {
    if (!selectedDate) return [];
    const operationalDateStr = format(selectedDate, 'yyyy-MM-dd');

    const activeRooms = rooms.filter(r => r.status === 'Ocupada');

    const checkedOutRoomsInShift = rooms.filter(r => {
      if (r.status === 'Ocupada' || !r.check_out_time) return false;
      const checkoutShiftInfo = getCurrentShiftInfo(new Date(r.check_out_time));
      const checkoutOpDateStr = format(checkoutShiftInfo.operationalDate, 'yyyy-MM-dd');
      return checkoutShiftInfo.shift === selectedShift && checkoutOpDateStr === operationalDateStr;
    });

    const combinedRooms = [...activeRooms, ...checkedOutRoomsInShift];
    const uniqueRoomIds = Array.from(new Set(combinedRooms.map(r => r.id)));

    const log = uniqueRoomIds.map(roomId => {
      const room = rooms.find(r => r.id === roomId)!;
      if (!room.check_in_time) return null;

      const checkinShiftInfo = getCurrentShiftInfo(new Date(room.check_in_time));
      const checkinOpDateStr = format(checkinShiftInfo.operationalDate, 'yyyy-MM-dd');
      const isFromPreviousShift = (checkinShiftInfo.shift !== selectedShift || checkinOpDateStr !== operationalDateStr);

      const allStayTransactions = transactions.filter(t => {
        if (t.room_id !== roomId) return false;
        const transactionTime = new Date(t.timestamp).getTime();
        const checkInTime = new Date(room.check_in_time!).getTime();
        const endTime = room.status !== 'Ocupada' && room.check_out_time
          ? new Date(room.check_out_time).getTime()
          : Date.now();
        return transactionTime >= checkInTime && transactionTime <= endTime;
      });

      const initialOccupancyTransaction = allStayTransactions.find(t => t.type === 'Hospedaje Inicial');
      const initialOccupancyAmount = initialOccupancyTransaction?.amount || 0;

      const productTransactions = allStayTransactions.filter(t => t.type === 'Consumo');
      const productsAmount = productTransactions.reduce((sum, t) => sum + t.amount, 0);

      const otherChargeTransactions = allStayTransactions.filter(t =>
        t.type !== 'Hospedaje Inicial' && t.type !== 'Consumo'
      );

      let totalStayAmount: number;
      if (room.status !== 'Ocupada') {
        totalStayAmount = allStayTransactions.reduce((sum, t) => sum + t.amount, 0);
      } else {
        totalStayAmount = room.total_debt || 0;
      }

      return {
        ...room,
        isFromPreviousShift: room.status === 'Ocupada' && isFromPreviousShift,
        initialOccupancyAmount,
        productsAmount,
        otherChargeTransactions,
        totalStayAmount,
      };
    }).filter((r): r is NonNullable<typeof r> => r !== null);

    return log.sort((a, b) => new Date(b.check_in_time!).getTime() - new Date(a.check_in_time!).getTime());
  }, [selectedDate, selectedShift, rooms, transactions]);


  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <Card>
        <CardHeader>
            <CardTitle>Centro de Reportes</CardTitle>
            <CardDescription>Consulte movimientos y descargue reportes detallados.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
            <Popover>
                <PopoverTrigger asChild>
                <Button
                    variant={"outline"}
                    className={cn(
                    "w-full sm:w-[240px] justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                    )}
                >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP", { locale: es }) : <span>Seleccionar Fecha</span>}
                </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                />
                </PopoverContent>
            </Popover>

            <Select value={selectedShift} onValueChange={(v: Shift) => setSelectedShift(v)}>
                <SelectTrigger className="w-full sm:w-[240px]">
                    <SelectValue placeholder="Seleccionar Turno" />
                </SelectTrigger>
                <SelectContent>
                    {shifts.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <div className="flex-1 flex justify-start sm:justify-end gap-2">
                 <Button variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Ver Balance General
                </Button>
                 <Button className="bg-red-600 hover:bg-red-700">
                    <Download className="mr-2 h-4 w-4" />
                    Descargar PDF
                </Button>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><FileText />Resumen Financiero del Turno</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-900 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">TOTAL INGRESOS</p>
                      <DollarSign className="h-5 w-5 text-blue-500" />
                    </div>
                    <p className="text-3xl font-bold">${summary.totalIncome.toFixed(2)}</p>
                    <p className="text-xs">Todas las entradas (Caja)</p>
                </div>
                
                <Collapsible>
                    <CollapsibleTrigger className="bg-red-50 border-l-4 border-red-500 text-red-900 rounded-xl p-4 w-full text-left group">
                       <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">GASTOS TOTALES</p>
                          <ChevronDown className="h-5 w-5 text-red-500 group-data-[state=open]:rotate-180 transition-transform" />
                        </div>
                        <p className="text-3xl font-bold">-${summary.totalExpenses.toFixed(2)}</p>
                        <p className="text-xs">Clic para ver detalle</p>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="px-2 pt-2">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead className="text-right">Monto</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {summary.expensesList.length > 0 ? summary.expensesList.map(expense => (
                                    <TableRow key={expense.id}>
                                        <TableCell>{expense.description}</TableCell>
                                        <TableCell className="text-right">-${expense.amount.toFixed(2)}</TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={2} className="text-center">No hay gastos en este turno.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CollapsibleContent>
                </Collapsible>
                
                <div className="bg-gray-800 text-white rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-semibold">UTILIDAD NETA</p>
                      <p className="text-3xl font-bold">${summary.netProfit.toFixed(2)}</p>
                    </div>
                </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                 <StatCard title="RENTAS (HOSPEDAJE)" value={`$${summary.rentIncome.toFixed(2)}`} icon={Bed} className="bg-gray-100" />
                 <StatCard title="PRODUCTOS (HAB.)" value={`$${summary.roomProductsIncome.toFixed(2)}`} icon={ShoppingCart} className="bg-gray-100" />
                 <StatCard title="CONSUMO EMPLEADOS" value={`$${summary.employeeConsumptionIncome.toFixed(2)}`} icon={Users} className="bg-gray-100" />
                 <StatCard title="PERSONAS EXTRA" value={`$${summary.extraPersonIncome.toFixed(2)}`} icon={UserPlus} className="bg-gray-100" />
                 <StatCard title="TIEMPOS EXTRA" value={`$${summary.extraTimeIncome.toFixed(2)}`} icon={Clock} className="bg-gray-100" />
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><History />Bitácora de Habitaciones del Turno</CardTitle>
            <CardDescription>Muestra habitaciones activas y las que salieron durante el turno seleccionado.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
            {roomLogData.length > 0 ? (
                roomLogData.map(logItem => (
                    <Collapsible key={logItem.id} className="border rounded-lg">
                        <CollapsibleTrigger className="w-full text-left p-4 hover:bg-muted/50 rounded-lg transition-colors">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <span className={`px-3 py-1 rounded-md font-bold ${logItem.status === 'Ocupada' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-800'}`}>{logItem.name}</span>
                                    {logItem.isFromPreviousShift && <Badge variant="outline" className="border-yellow-500 text-yellow-600">Turno Anterior</Badge>}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <span className={`font-semibold ${logItem.status === 'Ocupada' ? 'text-green-600' : 'text-red-600'}`}>{logItem.status === 'Ocupada' ? 'ACTIVA' : 'SALIDA'}</span>
                                    <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-sm">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                    <span>Entrada: {formatToMexicanTime(logItem.check_in_time!)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                                    <span>Salida: {logItem.check_out_time ? formatToMexicanTime(logItem.check_out_time) : '...'}</span>
                                </div>
                                <div className="flex items-center gap-2 font-bold">
                                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    <span>Total: ${logItem.totalStayAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-4 pb-4">
                            <div className="pt-4 border-t space-y-2">
                                <h4 className="font-semibold mb-2">Desglose de la Cuenta:</h4>
                                <div className="flex justify-between text-sm">
                                    <span>Hospedaje Inicial:</span>
                                    <span className="font-medium">${logItem.initialOccupancyAmount.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span>Total en Productos:</span>
                                    <span className="font-medium">${logItem.productsAmount.toFixed(2)}</span>
                                </div>
                                {logItem.otherChargeTransactions.length > 0 && (
                                    <div className="pl-4 mt-1 border-l-2 border-muted">
                                    {logItem.otherChargeTransactions.map(c => (
                                        <div key={c.id} className="flex justify-between text-sm text-muted-foreground">
                                            <span>{c.description}</span>
                                            <span className="font-medium">${c.amount.toFixed(2)}</span>
                                        </div>
                                    ))}
                                    </div>
                                )}
                                <Separator className="my-2 !mt-4" />
                                <div className="flex justify-between font-bold text-base">
                                    <span>Total Habitación:</span>
                                    <span>${logItem.totalStayAmount.toFixed(2)}</span>
                                </div>
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                ))
            ) : (
                <div className="text-center text-muted-foreground py-8">
                    <p>No hay actividad de habitaciones para mostrar en este turno.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
