export type RoomStatus = 'Disponible' | 'Ocupada' | 'Limpieza' | 'Mantenimiento' | 'Profunda';
export type EntryType = 'Auto' | 'Moto' | 'Pie';
export type Shift = 'Matutino' | 'Vespertino' | 'Nocturno';
export type ProductCategory = 'Bebida' | 'Snack' | 'Cocina' | 'Otro';
export type EmployeeRole = 'Recepcionista' | 'Recamarera' | 'Cochero';
export type EmployeeStatus = 'Activo' | 'Inactivo';

export type RoomType = {
  id: number;
  name: string;
};

export type Rate = {
  id: number;
  name: string;
  hours: number;
  price: number;
  room_type_id: number;
  is_extra_hour: boolean;
};

export type Room = {
  id: number;
  name: string;
  status: RoomStatus;
  room_type_id: number;
  check_in_time: string | null;
  check_out_time: string | null;
  customer_name: string;
  persons: string;
  entry_type?: EntryType;
  vehicle_plate: string;
  vehicle_brand: string;
  vehicle_details: string;
  rate_id: number | null;
  total_debt: number;
  tv_controls: number;
  ac_controls: number;
  maintenance_note: string | null;
  is_manual_time: boolean;
};

export type Transaction = {
  id: number;
  room_id: number | null;
  employee_id: number | null;
  amount: number;
  type: string;
  timestamp: string;
  shift: Shift;
  description: string;
  turno_calculado: Shift;
  fecha_operativa: string; // "YYYY-MM-DD"
};

export type Expense = {
  id: number;
  description: string;
  amount: number;
  date: string; // ISO string
  shift: Shift;
  // New fields for better filtering
  turno_calculado?: Shift;
  fecha_operativa?: string;
};

export type Product = {
    id: number;
    name: string;
    price: number;
    category: ProductCategory;
};

export type VehicleHistory = {
    id: number;
    plate: string;
    check_in_time: string;
    check_out_time: string | null;
    room_id: number;
    room_name: string;
    entry_type: EntryType;
    vehicle_brand: string;
    vehicle_details: string;
};

export type VehicleReport = {
    id: number;
    plate: string;
    description: string;
    severity: 'Alta' | 'Media' | 'Baja';
};

export type Employee = {
    id: number;
    name: string;
    role: EmployeeRole;
    status: EmployeeStatus;
};
