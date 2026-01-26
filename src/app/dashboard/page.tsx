'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/motel/app-layout';
import DashboardKPIs from '@/components/motel/dashboard-kpis';
import RoomGrid from '@/components/motel/room-grid';
import { getCurrentShiftInfo } from '@/lib/datetime';
import type { Room, Transaction, Rate, Expense, VehicleHistory, Product, Employee, RoomType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { addHours, differenceInMinutes } from 'date-fns';
import AddExpenseModal from '@/components/motel/add-expense-modal';
import VehicleHistoryPage from '@/components/motel/vehicle-history-page';
import ConsumptionPage from '@/components/motel/consumption-page';
import EmployeesPage from '@/components/motel/employees-page';
import ReportsPage from '@/components/motel/reports-page';
import OccupancyMonitorPage from '@/components/motel/occupancy-monitor-page';
import SettingsPage from '@/components/motel/settings-page';
import { supabase } from '@/lib/supabaseClient';
import type { RealtimeChannel, User } from '@supabase/supabase-js';
import Loading from '../loading';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [vehicleHistory, setVehicleHistory] = useState<VehicleHistory[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [rates, setRates] = useState<Rate[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const { toast } = useToast();

  const [expiringRoomIds, setExpiringRoomIds] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
      } else {
        setUser(session.user);
        setLoading(false);
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/');
      } else if (session) {
        setUser(session.user);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const showToast = useCallback((...args: Parameters<typeof toast>) => {
    toast(...args);
  }, [toast]);

  useEffect(() => {
    if (loading) return;

    const tableSetterMap = {
      rooms: setRooms,
      products: setProducts,
      transactions: setTransactions,
      expenses: setExpenses,
      vehicle_history: setVehicleHistory,
      employees: setEmployees,
      rates: setRates,
      room_types: setRoomTypes,
    };

    const channels: RealtimeChannel[] = [];

    Object.entries(tableSetterMap).forEach(([table, setter]) => {
      const fetchAndSet = async () => {
        const { data, error } = await supabase.from(table).select('*').order('id');
        if (error) {
          showToast({ variant: 'destructive', title: `Error cargando ${table}`, description: error.message });
        } else {
          setter(data as any[] || []);
        }
      };

      fetchAndSet();

      const channel = supabase
        .channel(`public:${table}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: table }, payload => {
          fetchAndSet();
        })
        .subscribe();
      
      channels.push(channel);
    });

    return () => {
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [showToast, loading]);
  

  useEffect(() => {
    const checkRooms = () => {
      const now = new Date();
      const expiringIds = rooms
        .filter(room => room.status === 'Ocupada' && room.check_out_time)
        .filter(room => {
          const timeLeft = differenceInMinutes(new Date(room.check_out_time!), now);
          return timeLeft <= 10 && timeLeft >= 0;
        })
        .map(room => room.id);
      
      setExpiringRoomIds(currentIds => {
        const sortedNewIds = [...expiringIds].sort();
        const sortedCurrentIds = [...currentIds].sort();
        if (JSON.stringify(sortedNewIds) !== JSON.stringify(sortedCurrentIds)) {
          return expiringIds;
        }
        return currentIds;
      });
    };

    const intervalId = setInterval(checkRooms, 30 * 1000);
    checkRooms();

    return () => clearInterval(intervalId);
  }, [rooms]);

  useEffect(() => {
    if (expiringRoomIds.length > 0 && hasInteracted) {
      const playAlarm = () => {
        audioRef.current?.play().catch(console.error);
      };
      playAlarm();
      const alarmIntervalId = setInterval(playAlarm, 3 * 60 * 1000);
      return () => clearInterval(alarmIntervalId);
    }
  }, [expiringRoomIds, hasInteracted]);

  const handleInteraction = () => {
    if (!hasInteracted) {
      setHasInteracted(true);
      toast({
        title: "Sonido de Alertas Activado",
        description: "Recibirá una notificación sonora para habitaciones a punto de vencer.",
      });
    }
  };

  const handleConfirmCheckIn = async (roomToUpdate: Room, checkInData: any) => {
    const shiftInfo = getCurrentShiftInfo();

    if (checkInData.selectedRate?.price > 0) {
      const newTransaction: Omit<Transaction, 'id'> = {
        room_id: roomToUpdate.id,
        amount: checkInData.selectedRate.price,
        type: 'Hospedaje Inicial',
        timestamp: new Date().toISOString(),
        shift: shiftInfo.shift,
        description: `Renta ${checkInData.selectedRate.name} - Hab ${roomToUpdate.name}`,
        turno_calculado: shiftInfo.shift,
        fecha_operativa: shiftInfo.operationalDate.toISOString().split('T')[0],
      };
      const { error } = await supabase.from('transactions').insert([newTransaction]);
      if (error) {
        toast({ variant: 'destructive', title: 'Error al crear transacción', description: error.message });
        return;
      }
    }
    
    if (checkInData.plate && (checkInData.entryType === 'Auto' || checkInData.entryType === 'Moto')) {
      const newVehicleHistoryEntry: Omit<VehicleHistory, 'id'> = {
        plate: checkInData.plate,
        check_in_time: checkInData.startTime.toISOString(),
        check_out_time: null,
        room_id: roomToUpdate.id,
        room_name: roomToUpdate.name,
        entry_type: checkInData.entryType,
        vehicle_brand: checkInData.marca,
        vehicle_details: `${checkInData.modelo} ${checkInData.color}`,
      };
      const { error } = await supabase.from('vehicle_history').insert([newVehicleHistoryEntry]);
      if (error) {
        toast({ variant: 'destructive', title: 'Error al guardar vehículo', description: error.message });
        return;
      }
    }

    const { error } = await supabase
      .from('rooms')
      .update({
        status: 'Ocupada',
        check_in_time: checkInData.startTime?.toISOString(),
        check_out_time: checkInData.endTime?.toISOString(),
        customer_name: checkInData.customerName,
        persons: checkInData.persons,
        entry_type: checkInData.entryType,
        vehicle_plate: checkInData.plate,
        vehicle_brand: checkInData.marca,
        vehicle_details: `${checkInData.modelo} ${checkInData.color}`,
        rate_id: checkInData.selectedRate?.id,
        total_debt: checkInData.selectedRate?.price || 0,
        tv_controls: 0,
        ac_controls: 0,
      })
      .eq('id', roomToUpdate.id);

    if (error) {
      toast({ variant: 'destructive', title: 'Error en Check-in', description: error.message });
    } else {
      toast({ title: 'Check-in Exitoso', description: `Habitación ${roomToUpdate.name} ocupada.` });
    }
  };

  const handleUpdateControls = async (roomId: number, tvControls: number, acControls: number) => {
    const { error } = await supabase.from('rooms').update({ tv_controls: tvControls, ac_controls: acControls }).eq('id', roomId);
    if (error) {
      toast({ variant: 'destructive', title: 'Error al actualizar', description: error.message });
    } else {
      toast({ title: 'Controles Actualizados', description: 'Se han guardado los controles.' });
    }
  };

  const handleReleaseRoom = async (roomId: number) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;
    
    const { error } = await supabase.from('rooms').update({
      status: 'Limpieza',
      check_in_time: null,
      check_out_time: null,
      customer_name: '',
      persons: '0',
      entry_type: undefined,
      vehicle_plate: '',
      vehicle_brand: '',
      vehicle_details: '',
      rate_id: null,
      total_debt: 0,
      tv_controls: 0,
      ac_controls: 0,
    }).eq('id', roomId);
    
    if (error) {
      toast({ variant: 'destructive', title: 'Error al liberar', description: error.message });
      return;
    }

    const { error: vehicleError } = await supabase
      .from('vehicle_history')
      .update({ check_out_time: new Date().toISOString() })
      .eq('room_id', roomId)
      .is('check_out_time', null);

    if (vehicleError) {
      toast({ variant: 'destructive', title: 'Error al actualizar vehículo', description: vehicleError.message });
    } else {
      toast({ title: 'Habitación Liberada', description: `La habitación ${room.name} ha sido puesta en limpieza.` });
    }
  };

  const handleFinishCleaning = async (roomId: number) => {
    const { error } = await supabase.from('rooms').update({ status: 'Disponible' }).eq('id', roomId);
    const room = rooms.find(r => r.id === roomId);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else if (room) {
      toast({ title: 'Habitación Lista', description: `La habitación ${room.name} ahora está disponible.` });
    }
  };

  const handleChangeRoom = async (fromRoomId: number, toRoomId: number) => {
    const fromRoom = rooms.find(r => r.id === fromRoomId);
    const toRoom = rooms.find(r => r.id === toRoomId);

    if (!fromRoom || !toRoom) return;

    const { error: toRoomError } = await supabase.from('rooms').update({
        status: 'Ocupada',
        check_in_time: fromRoom.check_in_time,
        check_out_time: fromRoom.check_out_time,
        customer_name: fromRoom.customer_name,
        persons: fromRoom.persons,
        entry_type: fromRoom.entry_type,
        vehicle_plate: fromRoom.vehicle_plate,
        vehicle_brand: fromRoom.vehicle_brand,
        vehicle_details: fromRoom.vehicle_details,
        rate_id: fromRoom.rate_id,
        total_debt: fromRoom.total_debt,
        tv_controls: fromRoom.tv_controls,
        ac_controls: fromRoom.ac_controls,
    }).eq('id', toRoomId);

    if (toRoomError) {
      toast({ variant: 'destructive', title: 'Error al cambiar habitación (1)', description: toRoomError.message });
      return;
    }

    const { error: fromRoomError } = await supabase.from('rooms').update({
      status: 'Limpieza',
      check_in_time: null, check_out_time: null, customer_name: '', persons: '0', entry_type: undefined,
      vehicle_plate: '', vehicle_brand: '', vehicle_details: '', rate_id: null, total_debt: 0, tv_controls: 0, ac_controls: 0,
    }).eq('id', fromRoomId);
    
    if (fromRoomError) {
      toast({ variant: 'destructive', title: 'Error al cambiar habitación (2)', description: fromRoomError.message });
      return;
    }

    const { error: vehicleError } = await supabase.from('vehicle_history').update({ room_id: toRoomId, room_name: toRoom.name }).eq('room_id', fromRoomId).is('check_out_time', null);

    if (vehicleError) {
      toast({ variant: 'destructive', title: 'Error al actualizar vehículo', description: vehicleError.message });
    } else {
      toast({ title: 'Cambio de Habitación Exitoso', description: `Cliente movido de ${fromRoom.name} a ${toRoom.name}.` });
    }
  };

  const handleAdjustPackage = async (roomId: number, newRate: Rate, difference: number) => {
    const roomToUpdate = rooms.find(r => r.id === roomId);
    if (!roomToUpdate || !roomToUpdate.check_in_time) return;

    const shiftInfo = getCurrentShiftInfo();
    const newTransaction = {
      room_id: roomId, amount: difference, type: 'Ajuste de Paquete', timestamp: new Date().toISOString(),
      shift: shiftInfo.shift, description: `Ajuste a paquete ${newRate.name} - Hab ${roomToUpdate.name}`,
      turno_calculado: shiftInfo.shift, fecha_operativa: shiftInfo.operationalDate.toISOString().split('T')[0],
    };
    const { error: transError } = await supabase.from('transactions').insert([newTransaction]);
    if (transError) {
      toast({ variant: 'destructive', title: 'Error', description: transError.message });
      return;
    }

    const checkInTime = new Date(roomToUpdate.check_in_time);
    const newCheckOutTime = addHours(checkInTime, newRate.hours);
    const { error: roomError } = await supabase.from('rooms').update({
      rate_id: newRate.id,
      check_out_time: newCheckOutTime.toISOString(),
      total_debt: (roomToUpdate.total_debt || 0) + difference,
    }).eq('id', roomId);

    if (roomError) {
      toast({ variant: 'destructive', title: 'Error', description: roomError.message });
    } else {
      toast({ title: 'Paquete Ajustado Exitosamente', description: `Habitación ${roomToUpdate.name} ahora tiene ${newRate.name}.` });
    }
  };

  const handleExtendStay = async (roomId: number) => {
    const roomToUpdate = rooms.find(r => r.id === roomId);
    if (!roomToUpdate || !roomToUpdate.check_out_time) return;

    const extensionRate = rates.find(r => r.name === 'Extensión 3 Horas' && r.room_type_id === roomToUpdate.room_type_id);
    if (!extensionRate) {
      toast({ variant: 'destructive', title: 'Configuración Faltante', description: "Tarifa de 'Extensión 3 Horas' no encontrada." });
      return;
    }

    const shiftInfo = getCurrentShiftInfo();
    const newTransaction = {
      room_id: roomId, amount: extensionRate.price, type: 'Tiempo Extra', timestamp: new Date().toISOString(),
      shift: shiftInfo.shift, description: `Extensión 3 Horas - Hab ${roomToUpdate.name}`,
      turno_calculado: shiftInfo.shift, fecha_operativa: shiftInfo.operationalDate.toISOString().split('T')[0],
    };
    const { error: transError } = await supabase.from('transactions').insert([newTransaction]);
    if (transError) {
      toast({ variant: 'destructive', title: 'Error', description: transError.message });
      return;
    }

    const currentCheckOutTime = new Date(roomToUpdate.check_out_time);
    const newCheckOutTime = addHours(currentCheckOutTime, extensionRate.hours);
    const { error: roomError } = await supabase.from('rooms').update({
      check_out_time: newCheckOutTime.toISOString(),
      total_debt: (roomToUpdate.total_debt || 0) + extensionRate.price,
    }).eq('id', roomId);
    
    if (roomError) {
      toast({ variant: 'destructive', title: 'Error', description: roomError.message });
    } else {
      toast({ title: 'Estancia Extendida', description: `Se agregaron ${extensionRate.hours} horas a la habitación ${roomToUpdate.name}.` });
    }
  };

  const handleAddPerson = async (roomId: number, amount: number) => {
    const roomToUpdate = rooms.find(r => r.id === roomId);
    if (!roomToUpdate) return;
    const currentPersons = parseInt(roomToUpdate.persons || '0', 10);

    if (amount > 0) {
      const shiftInfo = getCurrentShiftInfo();
      const newTransaction = {
        room_id: roomId, amount: amount, type: 'Persona Extra', timestamp: new Date().toISOString(),
        shift: shiftInfo.shift, description: `Persona Extra - Hab ${roomToUpdate.name}`,
        turno_calculado: shiftInfo.shift, fecha_operativa: shiftInfo.operationalDate.toISOString().split('T')[0],
      };
      const { error: transError } = await supabase.from('transactions').insert([newTransaction]);
      if (transError) {
        toast({ variant: 'destructive', title: 'Error', description: transError.message });
        return;
      }
    }

    const { error: roomError } = await supabase.from('rooms').update({
      persons: (currentPersons + 1).toString(),
      total_debt: (roomToUpdate.total_debt || 0) + amount,
    }).eq('id', roomId);
    
    if (roomError) {
      toast({ variant: 'destructive', title: 'Error', description: roomError.message });
    } else {
      toast({ title: 'Persona Agregada', description: `Se agregó una persona a la habitación ${roomToUpdate.name}.` });
    }
  };

  const handleRemovePerson = async (roomId: number) => {
    const roomToUpdate = rooms.find(r => r.id === roomId);
    if (!roomToUpdate) return;
    const currentPersons = parseInt(roomToUpdate.persons || '0', 10);
    if (currentPersons <= 0) {
      toast({ variant: "destructive", title: 'Acción no válida' });
      return;
    }

    const { error } = await supabase.from('rooms').update({ persons: (currentPersons - 1).toString() }).eq('id', roomId);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Persona Removida', description: `Se redujo una persona de la habitación ${roomToUpdate.name}.` });
    }
  };

  const handleAddExpense = async ({ description, amount }: { description: string, amount: number }) => {
    const shiftInfo = getCurrentShiftInfo();
    const newExpense: Omit<Expense, 'id'> = { description, amount, date: new Date().toISOString(), shift: shiftInfo.shift };
    const { error } = await supabase.from('expenses').insert([newExpense]);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Gasto Registrado', description: `Gasto de $${amount.toFixed(2)} por "${description}".` });
    }
  };

  const handleAddConsumption = async (roomId: number, items: (Product & { quantity: number })[], totalPrice: number) => {
    const roomToUpdate = rooms.find(r => r.id === roomId);
    if (!roomToUpdate) return;

    const shiftInfo = getCurrentShiftInfo();
    const description = items.map(item => `${item.quantity}x ${item.name}`).join(', ');

    const newTransaction = {
      room_id: roomId, amount: totalPrice, type: 'Consumo', timestamp: new Date().toISOString(),
      shift: shiftInfo.shift, description, turno_calculado: shiftInfo.shift, fecha_operativa: shiftInfo.operationalDate.toISOString().split('T')[0],
    };
    const { error: transError } = await supabase.from('transactions').insert([newTransaction]);
    if (transError) {
      toast({ variant: 'destructive', title: 'Error', description: transError.message });
      return;
    }
    
    const { error: roomError } = await supabase.from('rooms').update({ total_debt: (roomToUpdate.total_debt || 0) + totalPrice }).eq('id', roomId);
    if (roomError) {
      toast({ variant: 'destructive', title: 'Error', description: roomError.message });
    }
  };
  
  const handleAddProduct = async (newProductData: Omit<Product, 'id'>) => {
    const { error } = await supabase.from('products').insert([newProductData]);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Producto Creado', description: `El producto "${newProductData.name}" ha sido creado.` });
    }
  };

  const handleUpdateProduct = async (updatedProduct: Product) => {
    const { error } = await supabase.from('products').update(updatedProduct).eq('id', updatedProduct.id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Producto Actualizado', description: `El producto "${updatedProduct.name}" ha sido actualizado.` });
    }
  };

  const handleDeleteProduct = async (productId: number) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ variant: 'destructive', title: 'Producto Eliminado'});
    }
  };

  const handleAddEmployee = async (newEmployeeData: Omit<Employee, 'id' | 'status'>) => {
    const newEmployee = { status: 'Activo', ...newEmployeeData };
    const { error } = await supabase.from('employees').insert([newEmployee]);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Empleado Creado', description: `El empleado "${newEmployeeData.name}" ha sido creado.` });
    }
  };

  const handleUpdateEmployee = async (updatedEmployee: Employee) => {
    const { error } = await supabase.from('employees').update(updatedEmployee).eq('id', updatedEmployee.id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Empleado Actualizado' });
    }
  };

  const handleDeleteEmployee = async (employeeId: number) => {
    const { error } = await supabase.from('employees').delete().eq('id', employeeId);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ variant: 'destructive', title: 'Empleado Eliminado' });
    }
  };
  
  const handleSellToEmployee = async (employeeId: number, items: (Product & { quantity: number; salePrice: number })[], totalPrice: number) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;

    const shiftInfo = getCurrentShiftInfo();
    const description = `Venta a ${employee.name}: ` + items.map(item => `${item.quantity}x ${item.name} @ $${item.salePrice.toFixed(2)}`).join(', ');

    const newTransaction = {
      employee_id: employeeId, amount: totalPrice, type: 'Venta a Empleado', timestamp: new Date().toISOString(),
      shift: shiftInfo.shift, description, turno_calculado: shiftInfo.shift, fecha_operativa: shiftInfo.operationalDate.toISOString().split('T')[0],
    };
    const { error } = await supabase.from('transactions').insert([newTransaction]);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Venta a Empleado Registrada', description: `Venta de $${totalPrice.toFixed(2)} a ${employee.name}.` });
    }
  };

  const handleAddRate = async (newRateData: Omit<Rate, 'id'>) => {
    const { error } = await supabase.from('rates').insert([newRateData]);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Tarifa Creada' });
    }
  };

  const handleUpdateRate = async (updatedRate: Rate) => {
    const { error } = await supabase.from('rates').update(updatedRate).eq('id', updatedRate.id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Tarifa Actualizada' });
    }
  };

  const handleDeleteRate = async (rateId: number) => {
    const { error } = await supabase.from('rates').delete().eq('id', rateId);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ variant: 'destructive', title: 'Tarifa Eliminada' });
    }
  };

  const handleAddRoomType = async (newRoomTypeData: Omit<RoomType, 'id'>) => {
    const { error } = await supabase.from('room_types').insert([newRoomTypeData]);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Tipo de Habitación Creado' });
    }
  };

  const handleUpdateRoomType = async (updatedRoomType: RoomType) => {
    const { error } = await supabase.from('room_types').update(updatedRoomType).eq('id', updatedRoomType.id);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ title: 'Tipo de Habitación Actualizado' });
    }
  };

  const handleDeleteRoomType = async (roomTypeId: number) => {
    const isUsed = rooms.some(r => r.room_type_id === roomTypeId);
    if (isUsed) {
      toast({ variant: 'destructive', title: 'Error al Eliminar', description: 'No se puede eliminar un tipo de habitación que está en uso.' });
      return;
    }
    const { error } = await supabase.from('room_types').delete().eq('id', roomTypeId);
    if (error) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } else {
      toast({ variant: 'destructive', title: 'Tipo de Habitación Eliminado' });
    }
  };


  const occupiedRooms = rooms.filter(r => r.status === 'Ocupada');

  if (loading) {
    return <Loading />;
  }

  return (
    <div onClickCapture={handleInteraction}>
      <AppLayout onAddExpenseClick={() => setIsAddExpenseModalOpen(true)} activeView={activeView} setActiveView={setActiveView}>
        {activeView === 'dashboard' && (
          <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <DashboardKPIs
              rooms={rooms}
              transactions={transactions}
              expenses={expenses}
            />
            <RoomGrid 
              rooms={rooms} 
              rates={rates} 
              roomTypes={roomTypes}
              transactions={transactions}
              onConfirmCheckIn={handleConfirmCheckIn}
              onUpdateControls={handleUpdateControls}
              onReleaseRoom={handleReleaseRoom}
              onFinishCleaning={handleFinishCleaning}
              onRoomChange={handleChangeRoom}
              onAdjustPackage={handleAdjustPackage}
              onExtendStay={handleExtendStay}
              onAddPerson={handleAddPerson}
              onRemovePerson={handleRemovePerson}
            />
          </div>
        )}
        {activeView === 'occupancy-monitor' && (
          <OccupancyMonitorPage
            rooms={rooms}
            rates={rates}
            roomTypes={roomTypes}
          />
        )}
        {activeView === 'vehicles' && (
          <VehicleHistoryPage vehicleHistory={vehicleHistory} />
        )}
        {activeView === 'consumption' && (
          <ConsumptionPage 
            products={products}
            occupiedRooms={occupiedRooms}
            onConfirm={handleAddConsumption}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}
        {activeView === 'employees' && (
          <EmployeesPage
            employees={employees}
            products={products}
            transactions={transactions}
            onAddEmployee={handleAddEmployee}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onConfirmSale={handleSellToEmployee}
          />
        )}
         {activeView === 'reports' && (
          <ReportsPage
            rooms={rooms}
            transactions={transactions}
            expenses={expenses}
            products={products}
          />
        )}
        {activeView === 'settings' && (
          <SettingsPage
            rooms={rooms}
            rates={rates}
            roomTypes={roomTypes}
            onAddRate={handleAddRate}
            onUpdateRate={handleUpdateRate}
            onDeleteRate={handleDeleteRate}
            onAddRoomType={handleAddRoomType}
            onUpdateRoomType={handleUpdateRoomType}
            onDeleteRoomType={handleDeleteRoomType}
          />
        )}
      </AppLayout>
      <AddExpenseModal
        isOpen={isAddExpenseModalOpen}
        onOpenChange={setIsAddExpenseModalOpen}
        onConfirm={handleAddExpense}
      />
      <audio ref={audioRef} src="/alarm.mp3" preload="auto" />
    </div>
  );
}
