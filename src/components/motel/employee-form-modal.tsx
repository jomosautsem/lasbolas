'use client';
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Employee, EmployeeRole } from '@/lib/types';

interface EmployeeFormModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onConfirm: (data: Omit<Employee, 'id' | 'status'> | Employee) => void;
  employeeToEdit?: Employee | null;
}

const roles: EmployeeRole[] = ['Recepcionista', 'Recamarera', 'Cochero'];

export default function EmployeeFormModal({ isOpen, onOpenChange, onConfirm, employeeToEdit }: EmployeeFormModalProps) {
  const [name, setName] = useState('');
  const [role, setRole] = useState<EmployeeRole>('Recepcionista');
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (employeeToEdit) {
        setName(employeeToEdit.name);
        setRole(employeeToEdit.role);
      } else {
        setName('');
        setRole('Recepcionista');
      }
    }
  }, [isOpen, employeeToEdit]);

  const handleConfirmClick = () => {
    if (!name.trim() || !role) {
      toast({
        variant: 'destructive',
        title: 'Datos Incompletos',
        description: 'Por favor, complete todos los campos correctamente.',
      });
      return;
    }

    const employeeData = {
      name,
      role,
    };
    
    if (employeeToEdit) {
      onConfirm({ ...employeeData, id: employeeToEdit.id, status: employeeToEdit.status });
    } else {
      onConfirm(employeeData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            {employeeToEdit ? 'Editar Empleado' : 'Nuevo Empleado'}
          </DialogTitle>
          <DialogDescription>
            {employeeToEdit ? 'Modifique los detalles del empleado.' : 'Ingrese los detalles del nuevo empleado.'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Empleado</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select value={role} onValueChange={(value: EmployeeRole) => setRole(value)}>
              <SelectTrigger id="role">
                <SelectValue placeholder="Seleccione un rol" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="button" onClick={handleConfirmClick}>Guardar Empleado</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
