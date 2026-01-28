'use client';

import { useState, useMemo } from 'react';
import type {
  Transaction,
  Expense,
  Shift,
  Room,
  Product,
  Employee,
} from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format, isAfter, formatDistance } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  DollarSign,
  Bed,
  ShoppingCart,
  Users,
  UserPlus,
  Clock,
  Download,
  RefreshCw,
  FileText,
  ChevronDown,
  History,
  ArrowRight,
  AlertTriangle,
  X,
} from 'lucide-react';
import {
  getCurrentShiftInfo,
  getMexicoCityTime,
  formatToMexicanTime,
  formatToMexicanDate,
} from '@/lib/datetime';
import { cn } from '@/lib/utils';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ReportsPageProps {
  rooms: Room[];
  transactions: Transaction[];
  expenses: Expense[];
  products: Product[];
  employees: Employee[];
}

const shifts: { value: Shift; label: string }[] = [
  { value: 'Matutino', label: 'Matutino (07:00 - 14:00)' },
  { value: 'Vespertino', label: 'Vespertino (14:00 - 21:00)' },
  { value: 'Nocturno', label: 'Nocturno (21:00 - 07:00)' },
];

const TransactionTable = ({
  transactions,
  rooms,
  employees,
}: {
  transactions: Transaction[];
  rooms: Room[];
  employees: Employee[];
}) => {
  if (transactions.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        No hay transacciones en esta categoría.
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Hora</TableHead>
            <TableHead>Hab./Emp.</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead className="text-right">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((t) => {
            const room = t.room_id ? rooms.find((r) => r.id === t.room_id) : null;
            const employee = t.employee_id
              ? employees.find((e) => e.id === t.employee_id)
              : null;

            return (
              <TableRow key={t.id}>
                <TableCell>{formatToMexicanTime(t.timestamp)}</TableCell>
                <TableCell>{room?.name || employee?.name || 'N/A'}</TableCell>
                <TableCell>{t.description}</TableCell>
                <TableCell className="text-right">${t.amount.toFixed(2)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default function ReportsPage({
  rooms,
  transactions,
  expenses,
  products,
  employees,
}: ReportsPageProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    getMexicoCityTime()
  );
  const [selectedShift, setSelectedShift] = useState<Shift>(
    getCurrentShiftInfo().shift
  );
  const [activeDetail, setActiveDetail] = useState<{
    title: string;
    transactions: Transaction[];
  } | null>(null);

  const filteredData = useMemo(() => {
    if (!selectedDate) {
      return { filteredTransactions: [], filteredExpenses: [] };
    }
    const operationalDateStr = format(selectedDate, 'yyyy-MM-dd');

    const filteredTransactions = transactions.filter(
      (t) =>
        t.fecha_operativa === operationalDateStr &&
        t.turno_calculado === selectedShift
    );

    const filteredExpenses = expenses.filter((e) => {
      const eShiftInfo = getCurrentShiftInfo(new Date(e.date));
      const eOpDateStr = format(eShiftInfo.operationalDate, 'yyyy-MM-dd');
      return (
        eOpDateStr === operationalDateStr && eShiftInfo.shift === selectedShift
      );
    });

    return { filteredTransactions, filteredExpenses };
  }, [selectedDate, selectedShift, transactions, expenses]);

  const summary = useMemo(() => {
    const { filteredTransactions, filteredExpenses } = filteredData;

    const rentIncomeTransactions = filteredTransactions.filter(
      (t) => t.type === 'Hospedaje Inicial' || t.type === 'Ajuste de Paquete'
    );
    const rentIncome = rentIncomeTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    const extraTimeIncomeTransactions = filteredTransactions.filter(
      (t) => t.type === 'Tiempo Extra'
    );
    const extraTimeIncome = extraTimeIncomeTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    const extraPersonIncomeTransactions = filteredTransactions.filter(
      (t) => t.type === 'Persona Extra'
    );
    const extraPersonIncome = extraPersonIncomeTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    const roomProductsIncomeTransactions = filteredTransactions.filter(
      (t) => t.type === 'Consumo'
    );
    const roomProductsIncome = roomProductsIncomeTransactions.reduce(
      (sum, t) => sum + t.amount,
      0
    );

    const employeeConsumptionIncomeTransactions = filteredTransactions.filter(
      (t) => t.type === 'Venta a Empleado'
    );
    const employeeConsumptionIncome =
      employeeConsumptionIncomeTransactions.reduce(
        (sum, t) => sum + t.amount,
        0
      );

    const totalIncome =
      rentIncome +
      extraTimeIncome +
      extraPersonIncome +
      roomProductsIncome +
      employeeConsumptionIncome;

    const totalExpenses = filteredExpenses.reduce(
      (sum, e) => sum + e.amount,
      0
    );

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
      expensesList: filteredExpenses,
      rentIncomeTransactions,
      extraTimeIncomeTransactions,
      extraPersonIncomeTransactions,
      roomProductsIncomeTransactions,
      employeeConsumptionIncomeTransactions,
    };
  }, [filteredData]);

  const handleDetailClick = (title: string, transactions: Transaction[]) => {
    if (transactions.length === 0) {
      setActiveDetail(null);
      return;
    }
    if (activeDetail?.title === title) {
      setActiveDetail(null);
    } else {
      setActiveDetail({ title, transactions });
    }
  };

  const roomLogData = useMemo(() => {
    if (!selectedDate) return [];
    const operationalDateStr = format(selectedDate, 'yyyy-MM-dd');

    const shiftTransactions = transactions.filter(
      (t) =>
        t.fecha_operativa === operationalDateStr &&
        t.turno_calculado === selectedShift
    );

    const uniqueRoomIdsInShift = Array.from(
      new Set(
        shiftTransactions.map((t) => t.room_id).filter((id): id is number => id !== null)
      )
    );

    const log = uniqueRoomIdsInShift
      .map((roomId) => {
        const room = rooms.find((r) => r.id === roomId);
        if (!room) return null;

        const allTransactionsForRoom = transactions
          .filter((t) => t.room_id === roomId)
          .sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
          );

        const initialTransactionForThisStay = allTransactionsForRoom
          .filter((t) => t.type === 'Hospedaje Inicial')
          .sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )[0];

        if (!initialTransactionForThisStay) return null;

        const checkInTime = new Date(initialTransactionForThisStay.timestamp);

        const allTransactionsThisStay = allTransactionsForRoom.filter(
          (t) => new Date(t.timestamp) >= checkInTime
        );
        const transactionIdsThisStay = new Set(
          allTransactionsThisStay.map((t) => t.id)
        );

        const wasActiveInShift = shiftTransactions.some((t) =>
          transactionIdsThisStay.has(t.id)
        );
        if (!wasActiveInShift) return null;

        const latestRoomState = allTransactionsThisStay
          .map((t) => rooms.find((r) => r.id === t.room_id))
          .filter((r) => r && r.check_in_time)
          .sort(
            (a, b) =>
              new Date(b!.check_in_time!).getTime() -
              new Date(a!.check_in_time!).getTime()
          )[0];

        const checkinShiftInfo = getCurrentShiftInfo(checkInTime);
        const checkinOpDateStr = format(
          checkinShiftInfo.operationalDate,
          'yyyy-MM-dd'
        );
        const isFromPreviousShift =
          checkinShiftInfo.shift !== selectedShift ||
          checkinOpDateStr !== operationalDateStr;

        const initialOccupancyAmount =
          initialTransactionForThisStay?.amount || 0;

        const productTransactions = allTransactionsThisStay.filter(
          (t) => t.type === 'Consumo'
        );
        const productsAmount = productTransactions.reduce(
          (sum, t) => sum + t.amount,
          0
        );

        const parsedProducts = productTransactions.flatMap((t) => {
          return t.description
            .split(', ')
            .map((desc) => {
              const match = desc.match(/(\d+)x\s(.+)/);
              if (!match) return null;

              const quantity = parseInt(match[1], 10);
              const name = match[2].trim();
              const product = products.find((p) => p.name === name);
              const price = product ? product.price : 0; // price per item

              return {
                id: `${t.id}-${name}`,
                quantity,
                name,
                price,
                total: quantity * price,
              };
            })
            .filter((p): p is NonNullable<typeof p> => p !== null);
        });

        const otherChargeTransactions = allTransactionsThisStay.filter(
          (t) =>
            t.type !== 'Hospedaje Inicial' && t.type !== 'Consumo'
        );

        let totalStayAmount = allTransactionsThisStay.reduce(
          (sum, t) => sum + t.amount,
          0
        );

        const isCurrentlyOccupied =
          room.status === 'Ocupada' &&
          room.check_in_time === initialTransactionForThisStay.timestamp;

        return {
          id: room.id,
          name: room.name,
          status: isCurrentlyOccupied ? 'Ocupada' : 'Salida',
          check_in_time: initialTransactionForThisStay.timestamp,
          check_out_time: isCurrentlyOccupied
            ? room?.check_out_time
            : allTransactionsThisStay.sort(
                (a, b) =>
                  new Date(b.timestamp).getTime() -
                  new Date(a.timestamp).getTime()
              )[0]?.timestamp || null,
          is_manual_time: room?.is_manual_time || false,
          isFromPreviousShift: isCurrentlyOccupied && isFromPreviousShift,
          initialOccupancyAmount,
          productsAmount,
          productTransactions,
          parsedProducts,
          otherChargeTransactions,
          totalStayAmount,
        };
      })
      .filter((r): r is NonNullable<typeof r> => r !== null);

    return log.sort(
      (a, b) =>
        new Date(b.check_in_time!).getTime() -
        new Date(a.check_in_time!).getTime()
    );
  }, [selectedDate, selectedShift, rooms, transactions, products]);

  const expiredRoomsReport = useMemo(() => {
    if (!selectedDate) return [];

    const shiftEndDate = getMexicoCityTime(new Date(selectedDate));
    if (selectedShift === 'Matutino') {
      shiftEndDate.setHours(14, 0, 0, 0);
    } else if (selectedShift === 'Vespertino') {
      shiftEndDate.setHours(21, 0, 0, 0);
    } else {
      // Nocturno
      shiftEndDate.setDate(shiftEndDate.getDate() + 1);
      shiftEndDate.setHours(7, 0, 0, 0);
    }

    return roomLogData
      .filter((log) => {
        if (!log.check_out_time) return false;
        return isAfter(shiftEndDate, new Date(log.check_out_time));
      })
      .map((log) => ({
        name: log.name,
        time: `Vencida por ${formatDistance(
          new Date(log.check_out_time!),
          shiftEndDate,
          { locale: es }
        )}`,
      }));
  }, [roomLogData, selectedDate, selectedShift]);
  
  const handleDownloadPDF = () => {
    if (!selectedDate) return;

    const doc = new jsPDF();
    const title = "Reporte de Turno - Motel Las Bolas";
    const dateStr = format(selectedDate, 'dd/MM/yyyy', { locale: es });
    const subtitle = `Fecha: ${dateStr} - Turno: ${selectedShift}`;

    // Header
    doc.setFontSize(18);
    doc.text(title, 14, 22);
    doc.setFontSize(11);
    doc.text(subtitle, 14, 29);
    doc.setFontSize(10);
    const generatedTime = `Generado: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`;
    doc.text(generatedTime, 14, 34);

    let finalY = 40;

    // Resumen Financiero
    doc.setFontSize(14);
    doc.text("Resumen Financiero", 14, finalY);
    finalY += 5;
    autoTable(doc, {
        startY: finalY,
        head: [['Concepto', 'Monto']],
        body: [
            ['Total Ingresos', `$${summary.totalIncome.toFixed(2)}`],
            ['Gastos Totales', `-$${summary.totalExpenses.toFixed(2)}`],
        ],
        theme: 'grid',
        headStyles: { fillColor: [22, 163, 74] },
    });
     finalY = (doc as any).lastAutoTable.finalY;
     autoTable(doc, {
        startY: finalY,
        body: [['Utilidad Neta', `$${summary.netProfit.toFixed(2)}`]],
        theme: 'grid',
        bodyStyles: { fontStyle: 'bold', fillColor: [243, 244, 246] },
    });
    finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Desglose de Ingresos
    doc.setFontSize(14);
    doc.text("Desglose de Ingresos", 14, finalY);
    finalY += 5;
    const incomeBody = [
      ['Rentas (Hospedaje)', `$${summary.rentIncome.toFixed(2)}`],
      ['Productos (Hab.)', `$${summary.roomProductsIncome.toFixed(2)}`],
      ['Consumo Empleados', `$${summary.employeeConsumptionIncome.toFixed(2)}`],
      ['Personas Extra', `$${summary.extraPersonIncome.toFixed(2)}`],
      ['Tiempos Extra', `$${summary.extraTimeIncome.toFixed(2)}`],
    ];
    autoTable(doc, {
        startY: finalY,
        head: [['Categoría', 'Monto']],
        body: incomeBody,
        theme: 'striped',
        headStyles: { fillColor: [37, 99, 235] }, 
    });
    finalY = (doc as any).lastAutoTable.finalY + 10;

    // Desglose de Gastos
    if(summary.expensesList.length > 0) {
      doc.setFontSize(14);
      doc.text("Desglose de Gastos", 14, finalY);
      finalY += 5;
      autoTable(doc, {
          startY: finalY,
          head: [['Descripción', 'Monto']],
          body: summary.expensesList.map(e => [e.description, `-$${e.amount.toFixed(2)}`]),
          theme: 'striped',
          headStyles: { fillColor: [220, 38, 38] },
      });
      finalY = (doc as any).lastAutoTable.finalY + 10;
    }

    // Bitácora de Habitaciones
    if (roomLogData.length > 0) {
        doc.addPage();
        finalY = 20;
        doc.setFontSize(14);
        doc.text("Bitácora de Habitaciones del Turno", 14, finalY);
        finalY += 7;

        roomLogData.forEach((logItem) => {
            const pageHeight = doc.internal.pageSize.height;
            if (finalY > pageHeight - 60) {
                doc.addPage();
                finalY = 20;
            }

            doc.setFontSize(12);
            doc.setFillColor(243, 244, 246);
            doc.rect(14, finalY, doc.internal.pageSize.width - 28, 10, 'F');
            doc.setTextColor(0);
            doc.setFont('helvetica', 'bold');
            doc.text(`Habitación: ${logItem.name}`, 20, finalY + 7);
            doc.setFont('helvetica', 'normal');
            doc.text(`Total Cobrado: $${logItem.totalStayAmount.toFixed(2)}`, doc.internal.pageSize.width - 20, finalY + 7, { align: 'right' });
            finalY += 12;

            const roomDetails = [
                ['Check-in', logItem.check_in_time ? `${formatToMexicanDate(logItem.check_in_time)} ${formatToMexicanTime(logItem.check_in_time)}` : 'N/A'],
                ['Check-out', logItem.check_out_time ? `${formatToMexicanDate(logItem.check_out_time)} ${formatToMexicanTime(logItem.check_out_time)}` : (logItem.status === 'Ocupada' ? 'En estancia' : 'N/A')],
                ['Estado', logItem.status + (logItem.isFromPreviousShift ? ' (Turno Anterior)' : '') + (logItem.is_manual_time ? ' - MANUAL' : '')],
            ];

            autoTable(doc, {
                startY: finalY,
                body: roomDetails,
                theme: 'plain',
                styles: { fontSize: 9, cellPadding: 1 },
                columnStyles: { 0: { fontStyle: 'bold' } },
            });
            finalY = (doc as any).lastAutoTable.finalY + 2;

            const accountBreakdownBody: (string | number)[][] = [];
            accountBreakdownBody.push(['Hospedaje Inicial', `$${logItem.initialOccupancyAmount.toFixed(2)}`]);
            
            logItem.otherChargeTransactions.forEach(c => {
                accountBreakdownBody.push([c.description, `$${c.amount.toFixed(2)}`]);
            });
            
            if (logItem.parsedProducts.length > 0) {
                accountBreakdownBody.push([{ content: '--- Consumo de Productos ---', colSpan: 2, styles: { fontStyle: 'italic', textColor: 80 } }]);
                logItem.parsedProducts.forEach(p => {
                    accountBreakdownBody.push([`  ${p.quantity}x ${p.name}`, `$${p.total.toFixed(2)}`]);
                });
            }
            
            autoTable(doc, {
                startY: finalY,
                head: [['Desglose de Cuenta', 'Monto']],
                body: accountBreakdownBody,
                theme: 'striped',
                headStyles: { fillColor: [107, 114, 128] }, // gray-500
                styles: { fontSize: 9, cellPadding: 2 },
                didDrawPage: (data) => {
                    finalY = data.cursor?.y || 0;
                }
            });
            finalY = (doc as any).lastAutoTable.finalY + 8;
        });
    }

    doc.save(`Reporte_Turno_${dateStr}_${selectedShift}.pdf`);
  };

  const DetailCard = ({
    title,
    value,
    icon: Icon,
    category,
  }: {
    title: string;
    value: string;
    icon: React.ElementType;
    category: string;
  }) => {
    const transactions =
      (summary[`${category}Transactions` as keyof typeof summary] as
        | Transaction[]
        | undefined) || [];
    const isSelected = activeDetail?.title === title;

    return (
      <div
        onClick={() => handleDetailClick(title, transactions)}
        className={cn(
          'p-4 rounded-xl transition-all',
          transactions.length > 0
            ? 'cursor-pointer hover:shadow-md'
            : 'cursor-not-allowed opacity-60',
          isSelected ? 'bg-blue-100 ring-2 ring-blue-500' : 'bg-muted/50'
        )}
      >
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-medium">{title}</p>
          <Icon className="h-5 w-5 opacity-70" />
        </div>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    );
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <Card>
        <CardHeader>
          <CardTitle>Centro de Reportes</CardTitle>
          <CardDescription>
            Consulte movimientos y descargue reportes detallados.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-full sm:w-[240px] justify-start text-left font-normal',
                  !selectedDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, 'PPP', { locale: es })
                ) : (
                  <span>Seleccionar Fecha</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                disabled={(date) =>
                  date > new Date() || date < new Date('1900-01-01')
                }
              />
            </PopoverContent>
          </Popover>

          <Select
            value={selectedShift}
            onValueChange={(v: Shift) => setSelectedShift(v)}
          >
            <SelectTrigger className="w-full sm:w-[240px]">
              <SelectValue placeholder="Seleccionar Turno" />
            </SelectTrigger>
            <SelectContent>
              {shifts.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="w-full flex-1 flex flex-col sm:flex-row sm:justify-end gap-2">
            <Button variant="outline" className="w-full sm:w-auto">
              <RefreshCw className="mr-2 h-4 w-4" />
              Ver Balance General
            </Button>
            <Button
              onClick={handleDownloadPDF}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              <Download className="mr-2 h-4 w-4" />
              Descargar PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText />
            Resumen Financiero del Turno
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-900 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">TOTAL INGRESOS</p>
                <DollarSign className="h-5 w-5 text-blue-500" />
              </div>
              <p className="text-3xl font-bold">
                ${summary.totalIncome.toFixed(2)}
              </p>
              <p className="text-xs">Todas las entradas (Caja)</p>
            </div>

            <Collapsible>
              <CollapsibleTrigger className="bg-red-50 border-l-4 border-red-500 text-red-900 rounded-xl p-4 w-full text-left group">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">GASTOS TOTALES</p>
                  <ChevronDown className="h-5 w-5 text-red-500 group-data-[state=open]:rotate-180 transition-transform" />
                </div>
                <p className="text-3xl font-bold">
                  -${summary.totalExpenses.toFixed(2)}
                </p>
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
                    {summary.expensesList.length > 0 ? (
                      summary.expensesList.map((expense) => (
                        <TableRow key={expense.id}>
                          <TableCell>{expense.description}</TableCell>
                          <TableCell className="text-right">
                            -${expense.amount.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center">
                          No hay gastos en este turno.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CollapsibleContent>
            </Collapsible>

            <div className="bg-gray-800 text-white rounded-xl p-4 flex flex-col justify-between">
              <div>
                <p className="text-sm font-semibold">UTILIDAD NETA</p>
                <p className="text-3xl font-bold">
                  ${summary.netProfit.toFixed(2)}
                </p>
              </div>
            </div>

            {expiredRoomsReport.length === 0 ? (
              <div className="bg-teal-50 border-l-4 border-teal-500 text-teal-900 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">HABITACIONES VENCIDAS</p>
                  <Clock className="h-5 w-5 text-teal-500" />
                </div>
                <p className="text-3xl font-bold">0</p>
                <p className="text-xs">
                  Ninguna habitación vencida en el turno
                </p>
              </div>
            ) : (
              <Collapsible>
                <CollapsibleTrigger className="rounded-xl p-4 w-full text-left group text-white bg-gradient-to-br from-red-600 to-rose-800">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">
                      HABITACIONES VENCIDAS
                    </p>
                    <ChevronDown className="h-5 w-5 transition-transform group-data-[state=open]:rotate-180" />
                  </div>
                  <p className="text-3xl font-bold">
                    {expiredRoomsReport.length}
                  </p>
                  <p className="text-xs">Clic para ver detalle</p>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-2 pt-2">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Habitación</TableHead>
                        <TableHead className="text-right">
                          Tiempo Vencida
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expiredRoomsReport.map((room) => (
                        <TableRow key={room.name}>
                          <TableCell className="font-medium">
                            {room.name}
                          </TableCell>
                          <TableCell className="text-right">
                            {room.time}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <DetailCard
              title="RENTAS (HOSPEDAJE)"
              value={`$${summary.rentIncome.toFixed(2)}`}
              icon={Bed}
              category="rentIncome"
            />
            <DetailCard
              title="PRODUCTOS (HAB.)"
              value={`$${summary.roomProductsIncome.toFixed(2)}`}
              icon={ShoppingCart}
              category="roomProductsIncome"
            />
            <DetailCard
              title="CONSUMO EMPLEADOS"
              value={`$${summary.employeeConsumptionIncome.toFixed(2)}`}
              icon={Users}
              category="employeeConsumptionIncome"
            />
            <DetailCard
              title="PERSONAS EXTRA"
              value={`$${summary.extraPersonIncome.toFixed(2)}`}
              icon={UserPlus}
              category="extraPersonIncome"
            />
            <DetailCard
              title="TIEMPOS EXTRA"
              value={`$${summary.extraTimeIncome.toFixed(2)}`}
              icon={Clock}
              category="extraTimeIncome"
            />
          </div>
        </CardContent>
      </Card>

      {activeDetail && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2 text-lg">
                Detalle: {activeDetail.title}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setActiveDetail(null)}
              >
                <X className="h-5 w-5" />
                <span className="sr-only">Cerrar detalle</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <TransactionTable
              transactions={activeDetail.transactions}
              rooms={rooms}
              employees={employees}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History />
            Bitácora de Habitaciones del Turno
          </CardTitle>
          <CardDescription>
            Muestra habitaciones activas y las que salieron durante el turno
            seleccionado.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {roomLogData.length > 0 ? (
            roomLogData.map((logItem) => (
              <Collapsible key={logItem.id} className="border rounded-lg">
                <CollapsibleTrigger className="w-full text-left p-4 hover:bg-muted/50 rounded-lg transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-md font-bold ${
                          logItem.status === 'Ocupada'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        {logItem.name}
                      </span>
                      {logItem.isFromPreviousShift && (
                        <Badge
                          variant="outline"
                          className="border-yellow-500 text-yellow-600"
                        >
                          Turno Anterior
                        </Badge>
                      )}
                      {logItem.is_manual_time && (
                        <Badge variant="secondary">MANUAL</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span
                        className={`font-semibold ${
                          logItem.status === 'Ocupada'
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {logItem.status === 'Ocupada' ? 'ACTIVA' : 'SALIDA'}
                      </span>
                      <ChevronDown className="h-4 w-4 transition-transform data-[state=open]:rotate-180" />
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Entrada: {formatToMexicanTime(logItem.check_in_time!)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <span>
                        Salida:{' '}
                        {logItem.check_out_time
                          ? formatToMexicanTime(logItem.check_out_time)
                          : '...'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-bold">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>Total: ${logItem.totalStayAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4">
                  <div className="pt-4 border-t space-y-2">
                    <h4 className="font-semibold mb-2">
                      Desglose de la Cuenta:
                    </h4>
                    <div className="flex justify-between text-sm">
                      <span>Hospedaje Inicial:</span>
                      <span className="font-medium">
                        ${logItem.initialOccupancyAmount.toFixed(2)}
                      </span>
                    </div>

                    {logItem.parsedProducts.length > 0 && (
                      <div className="text-sm">
                        <p>Consumo de Productos:</p>
                        <div className="pl-4 mt-1 border-l-2 border-muted space-y-1">
                          {logItem.parsedProducts.map((p) => (
                            <div
                              key={p.id}
                              className="flex justify-between text-muted-foreground"
                            >
                              <span className="truncate pr-4">
                                {p.quantity}x {p.name}
                              </span>
                              <span className="font-medium whitespace-nowrap">
                                ${p.total.toFixed(2)}
                              </span>
                            </div>
                          ))}
                          <div className="pt-1 border-t border-muted/50 flex justify-between font-semibold text-foreground">
                            <span>Subtotal Productos:</span>
                            <span>${logItem.productsAmount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {logItem.otherChargeTransactions.length > 0 && (
                      <div className="text-sm">
                        <p className="mt-2">Otros Cargos:</p>
                        <div className="pl-4 mt-1 border-l-2 border-muted space-y-1">
                          {logItem.otherChargeTransactions.map((c) => (
                            <div
                              key={c.id}
                              className="flex justify-between text-muted-foreground"
                            >
                              <span className="truncate pr-4">{c.description}</span>
                              <span className="font-medium whitespace-nowrap">
                                ${c.amount.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
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
              <p>
                No hay actividad de habitaciones para mostrar en este turno.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
