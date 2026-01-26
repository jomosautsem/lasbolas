'use client';

import { useState, useEffect, useRef } from 'react';
import { AppLayout } from '@/components/motel/app-layout';
import DashboardKPIs from '@/components/motel/dashboard-kpis';
import RoomGrid from '@/components/motel/room-grid';
import { rooms as initialRooms, products as initialProducts, transactions as initialTransactions, expenses as initialExpenses, rates as initialRates, roomTypes as initialRoomTypes, vehicleHistory as initialVehicleHistory, employees as initialEmployees } from '@/lib/data';
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

export default function Home() {
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [vehicleHistory, setVehicleHistory] = useState<VehicleHistory[]>(initialVehicleHistory);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [rates, setRates] = useState<Rate[]>(initialRates);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>(initialRoomTypes);
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const { toast } = useToast();

  // New state and ref for alarm
  const [expiringRoomIds, setExpiringRoomIds] = useState<number[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Effect to detect expiring rooms
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
      
      // Only update state if the array of IDs has actually changed.
      setExpiringRoomIds(currentIds => {
        const sortedNewIds = [...expiringIds].sort();
        const sortedCurrentIds = [...currentIds].sort();
        if (JSON.stringify(sortedNewIds) !== JSON.stringify(sortedCurrentIds)) {
          return expiringIds;
        }
        return currentIds;
      });
    };

    const intervalId = setInterval(checkRooms, 30 * 1000); // Check every 30 seconds
    checkRooms(); // Initial check

    return () => clearInterval(intervalId);
  }, [rooms]);

  // Effect to play the alarm sound
  useEffect(() => {
    if (expiringRoomIds.length > 0 && hasInteracted) {
      const playAlarm = () => {
        audioRef.current?.play().catch(error => {
          console.error("Error playing alarm sound:", error);
          // This catch is for browsers that might still block it.
        });
      };

      playAlarm(); // Play immediately when a room starts expiring
      const alarmIntervalId = setInterval(playAlarm, 3 * 60 * 1000); // Repeat every 3 minutes

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

  const handleConfirmCheckIn = (roomToUpdate: Room, checkInData: any) => {
    if (checkInData.selectedRate?.price > 0) {
      const shiftInfo = getCurrentShiftInfo();
      const newTransaction: Transaction = {
        id: Date.now(),
        room_id: roomToUpdate.id,
        amount: checkInData.selectedRate.price,
        type: 'Hospedaje Inicial',
        timestamp: new Date().toISOString(),
        shift: shiftInfo.shift,
        description: `Renta ${checkInData.selectedRate.name} - Hab ${roomToUpdate.name}`,
        turno_calculado: shiftInfo.shift,
        fecha_operativa: shiftInfo.operationalDate.toISOString().split('T')[0],
      };
      setTransactions(currentTransactions => [...currentTransactions, newTransaction]);
    }
    
    if (checkInData.plate && (checkInData.entryType === 'Auto' || checkInData.entryType === 'Moto')) {
      const newVehicleHistoryEntry: VehicleHistory = {
        id: Date.now(),
        plate: checkInData.plate,
        check_in_time: checkInData.startTime.toISOString(),
        check_out_time: null,
        room_id: roomToUpdate.id,
        room_name: roomToUpdate.name,
        entry_type: checkInData.entryType,
        vehicle_brand: checkInData.marca,
        vehicle_details: `${checkInData.modelo} ${checkInData.color}`,
      };
      setVehicleHistory(current => [...current, newVehicleHistoryEntry]);
    }

    setRooms(currentRooms => 
      currentRooms.map(r => {
        if (r.id === roomToUpdate.id) {
          return {
            ...r,
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
          };
        }
        return r;
      })
    );
  };

  const handleUpdateControls = (roomId: number, tvControls: number, acControls: number) => {
    setRooms(currentRooms =>
      currentRooms.map(r => {
        if (r.id === roomId) {
          return { ...r, tv_controls: tvControls, ac_controls: acControls };
        }
        return r;
      })
    );
  };

  const handleReleaseRoom = (roomId: number) => {
    setRooms(currentRooms =>
      currentRooms.map(r => {
        if (r.id === roomId) {
          return {
            ...r,
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
          };
        }
        return r;
      })
    );
    const room = rooms.find(r => r.id === roomId);
    if(room) {
      toast({
        title: 'Habitación Liberada',
        description: `La habitación ${room.name} ha sido puesta en limpieza.`,
      });
    }

    setVehicleHistory(current => 
      current.map(vh => {
        if (vh.room_id === roomId && vh.check_out_time === null) {
          return { ...vh, check_out_time: new Date().toISOString() };
        }
        return vh;
      })
    );
  };

  const handleFinishCleaning = (roomId: number) => {
    setRooms(currentRooms =>
      currentRooms.map(r => {
        if (r.id === roomId) {
          return { ...r, status: 'Disponible' };
        }
        return r;
      })
    );
    const room = rooms.find(r => r.id === roomId);
    if(room) {
      toast({
        title: 'Habitación Lista',
        description: `La habitación ${room.name} ahora está disponible.`,
      });
    }
  };

  const handleChangeRoom = (fromRoomId: number, toRoomId: number) => {
    const fromRoom = rooms.find(r => r.id === fromRoomId);
    const toRoom = rooms.find(r => r.id === toRoomId);

    if (!fromRoom || !toRoom) {
      console.error("Could not find rooms for change");
      return;
    }

    const updatedRooms = rooms.map(r => {
      if (r.id === fromRoomId) {
        return {
          ...r,
          status: 'Limpieza' as const,
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
        };
      }
      if (r.id === toRoomId) {
        return {
          ...r, 
          status: 'Ocupada' as const,
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
        };
      }
      return r;
    });
    setRooms(updatedRooms);

    setVehicleHistory(current => 
      current.map(vh => {
        if (vh.room_id === fromRoomId && vh.check_out_time === null) {
          return { ...vh, room_id: toRoomId, room_name: toRoom.name };
        }
        return vh;
      })
    );

    toast({
      title: 'Cambio de Habitación Exitoso',
      description: `Cliente movido de ${fromRoom.name} a ${toRoom.name}.`,
    });
  };

  const handleAdjustPackage = (roomId: number, newRate: Rate, difference: number) => {
    const roomToUpdate = rooms.find(r => r.id === roomId);
    if (!roomToUpdate || !roomToUpdate.check_in_time) return;

    const shiftInfo = getCurrentShiftInfo();
    const newTransaction: Transaction = {
      id: Date.now(),
      room_id: roomId,
      amount: difference,
      type: 'Ajuste de Paquete',
      timestamp: new Date().toISOString(),
      shift: shiftInfo.shift,
      description: `Ajuste a paquete ${newRate.name} - Hab ${roomToUpdate.name}`,
      turno_calculado: shiftInfo.shift,
      fecha_operativa: shiftInfo.operationalDate.toISOString().split('T')[0],
    };
    setTransactions(currentTransactions => [...currentTransactions, newTransaction]);

    setRooms(currentRooms => 
      currentRooms.map(r => {
        if (r.id === roomId) {
          const checkInTime = new Date(r.check_in_time!);
          const newCheckOutTime = addHours(checkInTime, newRate.hours);
          return {
            ...r,
            rate_id: newRate.id,
            check_out_time: newCheckOutTime.toISOString(),
            total_debt: (r.total_debt || 0) + difference,
          };
        }
        return r;
      })
    );

    toast({
      title: 'Paquete Ajustado Exitosamente',
      description: `Habitación ${roomToUpdate.name} ahora tiene el paquete ${newRate.name}. Se cobró una diferencia de $${difference.toFixed(2)}.`,
    });
  };

  const handleExtendStay = (roomId: number) => {
    const roomToUpdate = rooms.find(r => r.id === roomId);
    if (!roomToUpdate || !roomToUpdate.check_out_time) return;

    const extensionRate = rates.find(r => r.name === 'Extensión 3 Horas' && r.room_type_id === roomToUpdate.room_type_id);
    if (!extensionRate) {
      toast({
        variant: 'destructive',
        title: 'Configuración Faltante',
        description: "La tarifa de 'Extensión 3 Horas' no está configurada para este tipo de habitación.",
      });
      return;
    }

    const shiftInfo = getCurrentShiftInfo();
    const newTransaction: Transaction = {
      id: Date.now(),
      room_id: roomId,
      amount: extensionRate.price,
      type: 'Tiempo Extra',
      timestamp: new Date().toISOString(),
      shift: shiftInfo.shift,
      description: `Extensión 3 Horas - Hab ${roomToUpdate.name}`,
      turno_calculado: shiftInfo.shift,
      fecha_operativa: shiftInfo.operationalDate.toISOString().split('T')[0],
    };
    setTransactions(currentTransactions => [...currentTransactions, newTransaction]);

    setRooms(currentRooms => 
      currentRooms.map(r => {
        if (r.id === roomId) {
          const currentCheckOutTime = new Date(r.check_out_time!);
          const newCheckOutTime = addHours(currentCheckOutTime, extensionRate.hours);
          return {
            ...r,
            check_out_time: newCheckOutTime.toISOString(),
            total_debt: (r.total_debt || 0) + extensionRate.price,
          };
        }
        return r;
      })
    );

    toast({
      title: 'Estancia Extendida',
      description: `Se agregaron ${extensionRate.hours} horas a la habitación ${roomToUpdate.name} por $${extensionRate.price.toFixed(2)}.`,
    });
  };

  const handleAddPerson = (roomId: number, amount: number) => {
    const roomToUpdate = rooms.find(r => r.id === roomId);
    if (!roomToUpdate) return;

    if (amount > 0) {
      const shiftInfo = getCurrentShiftInfo();
      const newTransaction: Transaction = {
        id: Date.now(),
        room_id: roomId,
        amount: amount,
        type: 'Persona Extra',
        timestamp: new Date().toISOString(),
        shift: shiftInfo.shift,
        description: `Persona Extra - Hab ${roomToUpdate.name}`,
        turno_calculado: shiftInfo.shift,
        fecha_operativa: shiftInfo.operationalDate.toISOString().split('T')[0],
      };
      setTransactions(currentTransactions => [...currentTransactions, newTransaction]);
    }

    setRooms(currentRooms => 
      currentRooms.map(r => {
        if (r.id === roomId) {
          const currentPersons = parseInt(r.persons || '0', 10);
          return {
            ...r,
            persons: (currentPersons + 1).toString(),
            total_debt: (r.total_debt || 0) + amount,
          };
        }
        return r;
      })
    );

    toast({
      title: 'Persona Agregada',
      description: `Se agregó una persona a la habitación ${roomToUpdate.name}. ${amount > 0 ? `Se cobraron $${amount.toFixed(2)}.` : 'Sin costo.'}`,
    });
  };

  const handleRemovePerson = (roomId: number) => {
    const roomToUpdate = rooms.find(r => r.id === roomId);
    if (!roomToUpdate) return;
    
    const currentPersons = parseInt(roomToUpdate.persons || '0', 10);
    if (currentPersons <= 0) {
      toast({
        variant: "destructive",
        title: 'Acción no válida',
        description: `La habitación ${roomToUpdate.name} no tiene personas para reducir.`,
      });
      return;
    }

    setRooms(currentRooms => 
      currentRooms.map(r => {
        if (r.id === roomId) {
          return {
            ...r,
            persons: (currentPersons - 1).toString(),
          };
        }
        return r;
      })
    );

    toast({
      title: 'Persona Removida',
      description: `Se redujo una persona de la habitación ${roomToUpdate.name}.`,
    });
  };

  const handleAddExpense = ({ description, amount }: { description: string, amount: number }) => {
    const shiftInfo = getCurrentShiftInfo();
    const newExpense: Expense = {
      id: Date.now(),
      description,
      amount,
      date: new Date().toISOString(),
      shift: shiftInfo.shift,
    };
    setExpenses(currentExpenses => [...currentExpenses, newExpense]);
    toast({
      title: 'Gasto Registrado',
      description: `Se registró un gasto de $${amount.toFixed(2)} por "${description}".`,
    });
  };

  const handleAddConsumption = (roomId: number, items: (Product & { quantity: number })[], totalPrice: number) => {
    const roomToUpdate = rooms.find(r => r.id === roomId);
    if (!roomToUpdate) return;

    const shiftInfo = getCurrentShiftInfo();
    const description = items.map(item => `${item.quantity}x ${item.name}`).join(', ');

    const newTransaction: Transaction = {
      id: Date.now(),
      room_id: roomId,
      amount: totalPrice,
      type: 'Consumo',
      timestamp: new Date().toISOString(),
      shift: shiftInfo.shift,
      description,
      turno_calculado: shiftInfo.shift,
      fecha_operativa: shiftInfo.operationalDate.toISOString().split('T')[0],
    };
    setTransactions(currentTransactions => [...currentTransactions, newTransaction]);
    
    setRooms(currentRooms => 
      currentRooms.map(r => {
        if (r.id === roomId) {
          return {
            ...r,
            total_debt: (r.total_debt || 0) + totalPrice,
          };
        }
        return r;
      })
    );
  };
  
  const handleAddProduct = (newProductData: Omit<Product, 'id'>) => {
    setProducts(currentProducts => {
      const newProduct: Product = {
        id: currentProducts.length > 0 ? Math.max(...currentProducts.map(p => p.id)) + 1 : 1,
        ...newProductData,
      };
      return [...currentProducts, newProduct];
    });
    toast({ title: 'Producto Creado', description: `El producto "${newProductData.name}" ha sido creado.` });
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(currentProducts =>
      currentProducts.map(p => (p.id === updatedProduct.id ? updatedProduct : p))
    );
    toast({ title: 'Producto Actualizado', description: `El producto "${updatedProduct.name}" ha sido actualizado.` });
  };

  const handleDeleteProduct = (productId: number) => {
    const productName = products.find(p => p.id === productId)?.name || '';
    setProducts(currentProducts => currentProducts.filter(p => p.id !== productId));
    toast({ variant: 'destructive', title: 'Producto Eliminado', description: `El producto "${productName}" ha sido eliminado.` });
  };

  const handleAddEmployee = (newEmployeeData: Omit<Employee, 'id' | 'status'>) => {
    setEmployees(current => {
      const newEmployee: Employee = {
        id: current.length > 0 ? Math.max(...current.map(e => e.id)) + 1 : 1,
        status: 'Activo',
        ...newEmployeeData,
      };
      return [...current, newEmployee];
    });
    toast({ title: 'Empleado Creado', description: `El empleado "${newEmployeeData.name}" ha sido creado.` });
  };

  const handleUpdateEmployee = (updatedEmployee: Employee) => {
    setEmployees(current =>
      current.map(e => (e.id === updatedEmployee.id ? updatedEmployee : e))
    );
    toast({ title: 'Empleado Actualizado', description: `El empleado "${updatedEmployee.name}" ha sido actualizado.` });
  };

  const handleDeleteEmployee = (employeeId: number) => {
    const employeeName = employees.find(e => e.id === employeeId)?.name || '';
    setEmployees(current => current.filter(e => e.id !== employeeId));
    toast({ variant: 'destructive', title: 'Empleado Eliminado', description: `El empleado "${employeeName}" ha sido eliminado.` });
  };
  
  const handleSellToEmployee = (employeeId: number, items: (Product & { quantity: number; salePrice: number })[], totalPrice: number) => {
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return;

    const shiftInfo = getCurrentShiftInfo();
    const description = `Venta a ${employee.name}: ` + items.map(item => `${item.quantity}x ${item.name} @ $${item.salePrice.toFixed(2)}`).join(', ');

    const newTransaction: Transaction = {
      id: Date.now(),
      room_id: null,
      employee_id: employeeId,
      amount: totalPrice,
      type: 'Venta a Empleado',
      timestamp: new Date().toISOString(),
      shift: shiftInfo.shift,
      description,
      turno_calculado: shiftInfo.shift,
      fecha_operativa: shiftInfo.operationalDate.toISOString().split('T')[0],
    };
    setTransactions(currentTransactions => [...currentTransactions, newTransaction]);
    
    toast({
      title: 'Venta a Empleado Registrada',
      description: `Se registró una venta de $${totalPrice.toFixed(2)} a ${employee.name}.`,
    });
  };

  const handleAddRate = (newRateData: Omit<Rate, 'id'>) => {
    setRates(current => {
      const newRate: Rate = {
        id: current.length > 0 ? Math.max(...current.map(r => r.id)) + 1 : 1,
        ...newRateData,
      };
      return [...current, newRate];
    });
    toast({ title: 'Tarifa Creada', description: `La tarifa "${newRateData.name}" ha sido creada.` });
  };

  const handleUpdateRate = (updatedRate: Rate) => {
    setRates(current =>
      current.map(r => (r.id === updatedRate.id ? updatedRate : r))
    );
    toast({ title: 'Tarifa Actualizada', description: `La tarifa "${updatedRate.name}" ha sido actualizada.` });
  };

  const handleDeleteRate = (rateId: number) => {
    const rateName = rates.find(r => r.id === rateId)?.name || '';
    setRates(current => current.filter(r => r.id !== rateId));
    toast({ variant: 'destructive', title: 'Tarifa Eliminada', description: `La tarifa "${rateName}" ha sido eliminada.` });
  };

  const handleAddRoomType = (newRoomTypeData: Omit<RoomType, 'id'>) => {
    setRoomTypes(current => {
      const newRoomType: RoomType = {
        id: current.length > 0 ? Math.max(...current.map(rt => rt.id)) + 1 : 1,
        ...newRoomTypeData,
      };
      return [...current, newRoomType];
    });
    toast({ title: 'Tipo de Habitación Creado', description: `El tipo "${newRoomTypeData.name}" ha sido creado.` });
  };

  const handleUpdateRoomType = (updatedRoomType: RoomType) => {
    setRoomTypes(current =>
      current.map(rt => (rt.id === updatedRoomType.id ? updatedRoomType : rt))
    );
    toast({ title: 'Tipo de Habitación Actualizado', description: `El tipo "${updatedRoomType.name}" ha sido actualizado.` });
  };

  const handleDeleteRoomType = (roomTypeId: number) => {
    const isUsed = rooms.some(r => r.room_type_id === roomTypeId);
    if (isUsed) {
      toast({
        variant: 'destructive',
        title: 'Error al Eliminar',
        description: 'No se puede eliminar un tipo de habitación que está en uso.'
      });
      return;
    }
    const roomTypeName = roomTypes.find(rt => rt.id === roomTypeId)?.name || '';
    setRoomTypes(current => current.filter(rt => rt.id !== roomTypeId));
    toast({ variant: 'destructive', title: 'Tipo de Habitación Eliminado', description: `El tipo "${roomTypeName}" ha sido eliminado.` });
  };


  const occupiedRooms = rooms.filter(r => r.status === 'Ocupada');


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
