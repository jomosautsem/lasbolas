'use client';
import { useState, useMemo } from 'react';
import type { VehicleHistory } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { formatToMexicanDate, formatToMexicanTime } from '@/lib/datetime';
import { subDays, isAfter } from 'date-fns';
import { Car, Search } from 'lucide-react';
import { MotorcycleIcon } from '@/components/icons';

interface VehicleHistoryPageProps {
  vehicleHistory: VehicleHistory[];
}

export default function VehicleHistoryPage({ vehicleHistory }: VehicleHistoryPageProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = useMemo(() => {
    const fortyDaysAgo = subDays(new Date(), 40);
    return vehicleHistory
      .filter(vh => isAfter(new Date(vh.check_in_time), fortyDaysAgo))
      .filter(vh => vh.plate.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => new Date(b.check_in_time).getTime() - new Date(a.check_in_time).getTime());
  }, [vehicleHistory, searchTerm]);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historial de Vehículos</CardTitle>
              <CardDescription>Vehículos que han ingresado en los últimos 40 días.</CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                type="search"
                placeholder="Buscar por placa..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Placa</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Marca y Detalles</TableHead>
                <TableHead>Habitación</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Salida</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistory.length > 0 ? (
                filteredHistory.map((vh) => (
                  <TableRow key={vh.id}>
                    <TableCell className="font-medium">{vh.plate}</TableCell>
                    <TableCell>
                      {vh.entry_type === 'Auto' && <Car className="h-5 w-5" />}
                      {vh.entry_type === 'Moto' && <MotorcycleIcon className="h-5 w-5" />}
                    </TableCell>
                    <TableCell>{vh.vehicle_brand} {vh.vehicle_details}</TableCell>
                    <TableCell>{vh.room_name}</TableCell>
                    <TableCell>
                        {formatToMexicanDate(vh.check_in_time)} {formatToMexicanTime(vh.check_in_time)}
                    </TableCell>
                    <TableCell>
                      {vh.check_out_time ? `${formatToMexicanDate(vh.check_out_time)} ${formatToMexicanTime(vh.check_out_time)}` : 'En estancia'}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No hay vehículos en el historial reciente.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
