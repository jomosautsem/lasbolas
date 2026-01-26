'use client';

import { useState, useMemo } from 'react';
import type { Transaction, Expense, Shift } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, DollarSign, Bed, ShoppingCart, Users, UserPlus, Clock, Download, RefreshCw, FileText, ChevronDown } from 'lucide-react';
import { getCurrentShiftInfo, getMexicoCityTime } from '@/lib/datetime';
import { cn } from '@/lib/utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ReportsPageProps {
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

export default function ReportsPage({ transactions, expenses }: ReportsPageProps) {
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
    </div>
  );
}
