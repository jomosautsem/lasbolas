export type RoomStatus = 'Disponible' | 'Ocupada' | 'Limpieza' | 'Mantenimiento' | 'Profunda';
export type EntryType = 'Auto' | 'Moto' | 'Pie';
export type TransactionType = 'Hospedaje Inicial' | 'Tiempo Extra' | 'Consumo' | 'Gasto';
export type ProductCategory = 'Cocina' | 'Snack' | 'Bebida' | 'Otro';
export type EmployeeRole = 'Admin' | 'Recepcionista' | 'Limpieza';
export type VehicleReportSeverity = 'Baja' | 'Media' | 'Alta';
export type Shift = 'Matutino' | 'Vespertino' | 'Nocturno';


export interface Room {
  id: number;
  name: string;
  status: RoomStatus;
  check_in_time: string | null;
  check_out_time: string | null;
  room_type_id: number;
  vehicle_plate?: string;
  vehicle_brand?: string;
  vehicle_details?: string;
  tv_controls: number;
  ac_controls: number;
  customer_name?: string;
  entry_type?: EntryType;
  total_debt?: number;
}

export interface RoomType {
  id: number;
  name: string;
}

export interface Rate {
  id: number;
  name: string;
  hours: number;
  price: number;
  room_type_id: number;
  is_extra_hour: boolean;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  category: ProductCategory;
  stock: number;
}

export interface Transaction {
  id: number;
  room_id: number | null;
  amount: number;
  type: TransactionType;
  timestamp: string;
  shift: Shift;
  description: string;
  turno_calculado: Shift;
  fecha_operativa: string;
}

export interface Consumption {
  id: number;
  room_id: number;
  employee_id: number;
  total_amount: number;
  status: 'Pendiente' | 'Pagado';
  timestamp: string;
}

export interface ConsumptionItem {
  id: number;
  consumption_id: number;
  product_id: number;
  quantity: number;
  price: number;
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
  shift: Shift;
}

export interface Employee {
  id: number;
  name: string;
  role: EmployeeRole;
  status: 'Activo' | 'Inactivo';
}

export interface VehicleReport {
  id: number;
  plate: string;
  description: string;
  severity: VehicleReportSeverity;
}

export interface VehicleHistory {
  id: number;
  plate: string;
  check_in_time: string;
  check_out_time: string | null;
  room_id: number;
}
