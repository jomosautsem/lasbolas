'use client';

import React, { useState, useMemo } from 'react';
import type { Product, Employee, EmployeeRole, Transaction } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ShoppingCart, Plus, Minus, X, Beer, UtensilsCrossed, GlassWater, PlusCircle, Edit, Trash2, Users, DollarSign, History } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import EmployeeFormModal from './employee-form-modal';
import DeleteEmployeeDialog from './delete-employee-dialog';
import { getCurrentShiftInfo, formatToMexicanTime } from '@/lib/datetime';
import { format } from 'date-fns';

interface EmployeesPageProps {
  employees: Employee[];
  products: Product[];
  transactions: Transaction[];
  onAddEmployee: (employeeData: Omit<Employee, 'id' | 'status'>) => void;
  onUpdateEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: number) => void;
  onConfirmSale: (employeeId: number, items: (Product & { quantity: number; salePrice: number })[], totalPrice: number) => void;
}

type EmployeeCartItem = Product & { quantity: number; salePrice: number };

const categoryIcons: { [key: string]: React.ElementType } = {
  Bebida: Beer,
  Snack: UtensilsCrossed,
  Cocina: UtensilsCrossed,
  Otro: GlassWater,
};

export default function EmployeesPage({ employees, products, transactions, onAddEmployee, onUpdateEmployee, onDeleteEmployee, onConfirmSale }: EmployeesPageProps) {
  const [cart, setCart] = useState<EmployeeCartItem[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [openEmployeeId, setOpenEmployeeId] = useState<number | null>(null);
  const { toast } = useToast();

  const shiftInfo = useMemo(() => getCurrentShiftInfo(), []);
  const operationalDateStr = useMemo(() => format(shiftInfo.operationalDate, 'yyyy-MM-dd'), [shiftInfo]);

  const shiftEmployeeSales = useMemo(() => {
      const sales = transactions.filter(t => 
          t.type === 'Venta a Empleado' &&
          t.turno_calculado === shiftInfo.shift &&
          t.fecha_operativa === operationalDateStr
      );
      
      return sales.reduce((acc, t) => {
          if (t.employee_id) {
              if (!acc[t.employee_id]) {
                  acc[t.employee_id] = [];
              }
              acc[t.employee_id].push(t);
          }
          return acc;
      }, {} as { [key: number]: Transaction[] });

  }, [transactions, shiftInfo, operationalDateStr]);

  const handleQuantityChange = (product: Product, change: number) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.id === product.id);
      if (existingItem) {
        const newQuantity = existingItem.quantity + change;
        if (newQuantity > 0) {
          return currentCart.map(item =>
            item.id === product.id ? { ...item, quantity: newQuantity } : item
          );
        } else {
          return currentCart.filter(item => item.id !== product.id);
        }
      } else if (change > 0) {
        return [...currentCart, { ...product, quantity: 1, salePrice: product.price }];
      }
      return currentCart;
    });
  };

  const handlePriceChange = (productId: number, newPrice: number) => {
    setCart(currentCart =>
      currentCart.map(item =>
        item.id === productId ? { ...item, salePrice: newPrice } : item
      )
    );
  };
  
  const handleRemoveFromCart = (productId: number) => {
      setCart(currentCart => currentCart.filter(item => item.id !== productId));
  }

  const totalPrice = useMemo(() => {
    return cart.reduce((total, item) => total + item.salePrice * item.quantity, 0);
  }, [cart]);

  const handleConfirmSale = () => {
    if (!selectedEmployeeId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Por favor, seleccione un empleado.' });
      return;
    }
    if (cart.length === 0) {
      toast({ variant: 'destructive', title: 'Error', description: 'El carrito está vacío.' });
      return;
    }

    onConfirmSale(parseInt(selectedEmployeeId, 10), cart, totalPrice);
    
    toast({
      title: 'Venta a Empleado Registrada',
      description: `Se cargaron $${totalPrice.toFixed(2)} a la cuenta.`,
    });

    setCart([]);
    setSelectedEmployeeId('');
  };
  
  const getProductQuantity = (productId: number) => {
    return cart.find(item => item.id === productId)?.quantity || 0;
  }

  const handleOpenFormModal = (employee: Employee | null = null) => {
    setSelectedEmployee(employee);
    setIsFormModalOpen(true);
  };

  const handleOpenDeleteDialog = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = () => {
    if (selectedEmployee) {
      onDeleteEmployee(selectedEmployee.id);
      setIsDeleteDialogOpen(false);
      setSelectedEmployee(null);
    }
  };

  const handleFormSubmit = (employeeData: Omit<Employee, 'id' | 'status'> | Employee) => {
    if ('id' in employeeData) {
      onUpdateEmployee(employeeData);
    } else {
      onAddEmployee(employeeData);
    }
    setIsFormModalOpen(false);
  };

  return (
    <>
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
       <Tabs defaultValue="sale" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sale">Venta a Empleados</TabsTrigger>
          <TabsTrigger value="employees">Gestionar Empleados</TabsTrigger>
        </TabsList>
        <TabsContent value="sale">
            <div className="grid md:grid-cols-3 gap-8">
            <Card className="md:col-span-2">
                <CardHeader>
                <CardTitle>Menú de Productos</CardTitle>
                <CardDescription>Seleccione productos para vender a un empleado.</CardDescription>
                </CardHeader>
                <CardContent>
                <ScrollArea className="h-[60vh]">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pr-4">
                    {products.map(product => {
                        const Icon = categoryIcons[product.category] || UtensilsCrossed;
                        const quantity = getProductQuantity(product.id);
                        return (
                        <Card key={product.id} className="flex flex-col">
                            <CardHeader className="p-3">
                            <Icon className="h-8 w-8 text-muted-foreground mx-auto" />
                            </CardHeader>
                            <CardContent className="p-3 flex-grow text-center">
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-muted-foreground">${product.price.toFixed(2)}</p>
                            </CardContent>
                            <CardFooter className="p-2 bg-muted/50 flex justify-center items-center gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleQuantityChange(product, -1)} disabled={quantity === 0}>
                                <Minus className="h-4 w-4"/>
                            </Button>
                            <span className="font-bold text-lg w-6 text-center">{quantity}</span>
                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleQuantityChange(product, 1)}>
                                <Plus className="h-4 w-4"/>
                            </Button>
                            </CardFooter>
                        </Card>
                        );
                    })}
                    </div>
                </ScrollArea>
                </CardContent>
            </Card>

            <Card className="md:col-span-1 flex flex-col">
                <CardHeader>
                <CardTitle className="flex items-center gap-2"><ShoppingCart /> Venta Actual</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                    <div>
                    <label className="text-sm font-medium mb-2 block">Empleado</label>
                    <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                        <SelectTrigger>
                        <SelectValue placeholder="Seleccione un empleado..." />
                        </SelectTrigger>
                        <SelectContent>
                        {employees.map(employee => (
                            <SelectItem key={employee.id} value={employee.id.toString()}>
                                {employee.name}
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                    </div>
                    <Separator />
                    <ScrollArea className="h-64">
                        <div className="space-y-2 pr-4">
                        {cart.length > 0 ? (
                            cart.map(item => (
                            <div key={item.id} className="flex justify-between items-start text-sm">
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-xs text-muted-foreground">{item.quantity} x ${item.price.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="relative w-24">
                                      <DollarSign className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                                      <Input
                                        type="number"
                                        value={item.salePrice}
                                        onChange={(e) => handlePriceChange(item.id, parseFloat(e.target.value) || 0)}
                                        className="pl-6 h-8 text-sm"
                                      />
                                    </div>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRemoveFromCart(item.id)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground pt-16">El carrito está vacío</div>
                        )}
                        </div>
                    </ScrollArea>
                </CardContent>
                <CardFooter className="flex-col items-stretch space-y-4 border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <Button onClick={handleConfirmSale} disabled={cart.length === 0 || !selectedEmployeeId}>
                        Confirmar Venta
                    </Button>
                </CardFooter>
            </Card>
            </div>
        </TabsContent>
        <TabsContent value="employees">
            <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                <div>
                    <CardTitle>Gestión de Empleados</CardTitle>
                    <CardDescription>Crea, edita, elimina empleados y revisa su historial de consumo.</CardDescription>
                </div>
                <Button onClick={() => handleOpenFormModal()}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Agregar Empleado
                </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {employees.length > 0 ? (
                    employees.map((employee) => {
                      const employeeSales = shiftEmployeeSales[employee.id] || [];
                      return (
                        <React.Fragment key={employee.id}>
                            <TableRow 
                                onClick={() => setOpenEmployeeId(prev => prev === employee.id ? null : employee.id)}
                                className="cursor-pointer hover:bg-muted/50"
                            >
                                <TableCell className="font-medium">{employee.name}</TableCell>
                                <TableCell>{employee.role}</TableCell>
                                <TableCell>{employee.status}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleOpenFormModal(employee); }}>
                                    <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleOpenDeleteDialog(employee); }}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                            {openEmployeeId === employee.id && (
                                <TableRow>
                                    <TableCell colSpan={4} className="p-0">
                                        <div className="p-4 bg-muted/20">
                                            <div className="flex items-center gap-2 mb-2 font-semibold">
                                                <History className="h-5 w-5 text-primary" />
                                                Historial de Consumo del Turno
                                            </div>
                                            {employeeSales.length > 0 ? (
                                                <Table>
                                                    <TableHeader>
                                                        <TableRow>
                                                            <TableHead>Hora</TableHead>
                                                            <TableHead>Descripción</TableHead>
                                                            <TableHead className="text-right">Monto</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {employeeSales.map(sale => (
                                                            <TableRow key={sale.id}>
                                                                <TableCell>{formatToMexicanTime(sale.timestamp)}</TableCell>
                                                                <TableCell>{sale.description}</TableCell>
                                                                <TableCell className="text-right">${sale.amount.toFixed(2)}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            ) : (
                                                <p className="text-sm text-muted-foreground text-center py-4">No hay consumos para este empleado en el turno actual.</p>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </React.Fragment>
                      )
                    })
                    ) : (
                    <TableRow>
                        <TableCell colSpan={4} className="text-center">
                        No hay empleados registrados.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </CardContent>
            </Card>
        </TabsContent>
      </Tabs>
    </div>
    <EmployeeFormModal
        isOpen={isFormModalOpen}
        onOpenChange={setIsFormModalOpen}
        onConfirm={handleFormSubmit}
        employeeToEdit={selectedEmployee}
    />
    <DeleteEmployeeDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        employeeName={selectedEmployee?.name || ''}
    />
    </>
  );
}
