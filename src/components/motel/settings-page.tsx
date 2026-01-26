'use client';
import { useState } from 'react';
import type { Rate, RoomType, Room } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, Settings } from 'lucide-react';
import RateFormModal from './rate-form-modal';
import DeleteRateDialog from './delete-rate-dialog';
import RoomTypeFormModal from './room-type-form-modal';
import DeleteRoomTypeDialog from './delete-room-type-dialog';

interface SettingsPageProps {
  rooms: Room[];
  rates: Rate[];
  roomTypes: RoomType[];
  onAddRate: (rateData: Omit<Rate, 'id'>) => void;
  onUpdateRate: (rate: Rate) => void;
  onDeleteRate: (rateId: number) => void;
  onAddRoomType: (roomTypeData: Omit<RoomType, 'id'>) => void;
  onUpdateRoomType: (roomType: RoomType) => void;
  onDeleteRoomType: (roomTypeId: number) => void;
}

export default function SettingsPage({
  rooms,
  rates,
  roomTypes,
  onAddRate,
  onUpdateRate,
  onDeleteRate,
  onAddRoomType,
  onUpdateRoomType,
  onDeleteRoomType,
}: SettingsPageProps) {
  const [isRateFormOpen, setIsRateFormOpen] = useState(false);
  const [isDeleteRateOpen, setIsDeleteRateOpen] = useState(false);
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null);

  const [isRoomTypeFormOpen, setIsRoomTypeFormOpen] = useState(false);
  const [isDeleteRoomTypeOpen, setIsDeleteRoomTypeOpen] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null);

  // Rate Handlers
  const handleOpenRateForm = (rate: Rate | null = null) => {
    setSelectedRate(rate);
    setIsRateFormOpen(true);
  };

  const handleOpenDeleteRateDialog = (rate: Rate) => {
    setSelectedRate(rate);
    setIsDeleteRateOpen(true);
  };
  
  const handleConfirmDeleteRate = () => {
    if (selectedRate) {
      onDeleteRate(selectedRate.id);
      setIsDeleteRateOpen(false);
      setSelectedRate(null);
    }
  };
  
  const handleRateFormSubmit = (rateData: Omit<Rate, 'id'> | Rate) => {
    if ('id' in rateData) {
      onUpdateRate(rateData);
    } else {
      onAddRate(rateData);
    }
    setIsRateFormOpen(false);
  };
  
  // Room Type Handlers
  const handleOpenRoomTypeForm = (roomType: RoomType | null = null) => {
    setSelectedRoomType(roomType);
    setIsRoomTypeFormOpen(true);
  };

  const handleOpenDeleteRoomTypeDialog = (roomType: RoomType) => {
    setSelectedRoomType(roomType);
    setIsDeleteRoomTypeOpen(true);
  };
  
  const handleConfirmDeleteRoomType = () => {
    if (selectedRoomType) {
      onDeleteRoomType(selectedRoomType.id);
      setIsDeleteRoomTypeOpen(false);
      setSelectedRoomType(null);
    }
  };

  const handleRoomTypeFormSubmit = (roomTypeData: Omit<RoomType, 'id'> | RoomType) => {
    if ('id' in roomTypeData) {
      onUpdateRoomType(roomTypeData);
    } else {
      onAddRoomType(roomTypeData);
    }
    setIsRoomTypeFormOpen(false);
  };


  return (
    <>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
         <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Settings/> Configuración</CardTitle>
              <CardDescription>Administre las tarifas, habitaciones y otros parámetros del sistema.</CardDescription>
            </CardHeader>
        </Card>
        <Tabs defaultValue="rates" className="space-y-4">
          <TabsList>
            <TabsTrigger value="rates">Gestión de Tarifas</TabsTrigger>
            <TabsTrigger value="rooms">Administración de Habitaciones</TabsTrigger>
          </TabsList>
          
          <TabsContent value="rates">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Tarifas de Hospedaje</CardTitle>
                    <CardDescription>Cree, edite y elimine los paquetes de precios.</CardDescription>
                  </div>
                  <Button onClick={() => handleOpenRateForm()}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Tarifa
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Tipo Habitación</TableHead>
                      <TableHead>Horas</TableHead>
                      <TableHead>Precio</TableHead>
                      <TableHead>Tarifa Extra</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rates.map(rate => (
                      <TableRow key={rate.id}>
                        <TableCell className="font-medium">{rate.name}</TableCell>
                        <TableCell>{roomTypes.find(rt => rt.id === rate.room_type_id)?.name || 'N/A'}</TableCell>
                        <TableCell>{rate.hours} hrs</TableCell>
                        <TableCell>${rate.price.toFixed(2)}</TableCell>
                        <TableCell>{rate.is_extra_hour ? 'Sí' : 'No'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenRateForm(rate)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteRateDialog(rate)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rooms">
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Tipos de Habitación</CardTitle>
                        <CardDescription>Gestione las categorías de sus habitaciones.</CardDescription>
                      </div>
                      <Button onClick={() => handleOpenRoomTypeForm()}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Agregar Tipo
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre del Tipo</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {roomTypes.map(rt => (
                          <TableRow key={rt.id}>
                            <TableCell className="font-medium">{rt.name}</TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="icon" onClick={() => handleOpenRoomTypeForm(rt)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => handleOpenDeleteRoomTypeDialog(rt)}>
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
                 <Card>
                  <CardHeader>
                    <CardTitle>Lista de Habitaciones</CardTitle>
                    <CardDescription>Ver listado de todas las habitaciones. La edición es limitada.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Table>
                       <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Tipo</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rooms.map(room => (
                          <TableRow key={room.id}>
                            <TableCell className="font-medium">{room.name}</TableCell>
                            <TableCell>{roomTypes.find(rt => rt.id === room.room_type_id)?.name || 'N/A'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <RateFormModal 
        isOpen={isRateFormOpen}
        onOpenChange={setIsRateFormOpen}
        onConfirm={handleRateFormSubmit}
        rateToEdit={selectedRate}
        roomTypes={roomTypes}
      />
      <DeleteRateDialog
        isOpen={isDeleteRateOpen}
        onOpenChange={setIsDeleteRateOpen}
        onConfirm={handleConfirmDeleteRate}
        rateName={selectedRate?.name || ''}
      />
       <RoomTypeFormModal 
        isOpen={isRoomTypeFormOpen}
        onOpenChange={setIsRoomTypeFormOpen}
        onConfirm={handleRoomTypeFormSubmit}
        roomTypeToEdit={selectedRoomType}
      />
       <DeleteRoomTypeDialog
        isOpen={isDeleteRoomTypeOpen}
        onOpenChange={setIsDeleteRoomTypeOpen}
        onConfirm={handleConfirmDeleteRoomType}
        roomTypeName={selectedRoomType?.name || ''}
      />
    </>
  );
}
