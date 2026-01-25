import type { Room, RoomType, Rate, Product, Transaction, Expense } from './types';

export const roomTypes: RoomType[] = [
  { id: 1, name: 'Sencilla' },
  { id: 2, name: 'Jacuzzi' },
];

export const rooms: Room[] = [
  { id: 1, name: '101', status: 'Disponible', check_in_time: null, check_out_time: null, room_type_id: 1, tv_controls: 1, ac_controls: 1, total_debt: 0 },
  { id: 2, name: '102', status: 'Ocupada', check_in_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), check_out_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), room_type_id: 1, vehicle_plate: 'ABC-123', vehicle_brand: 'Nissan', tv_controls: 1, ac_controls: 1, customer_name: "Juan Perez", entry_type: 'Auto', total_debt: 450 },
  { id: 3, name: '103', status: 'Limpieza', check_in_time: null, check_out_time: null, room_type_id: 1, tv_controls: 1, ac_controls: 1, total_debt: 0 },
  { id: 4, name: '104', status: 'Mantenimiento', check_in_time: null, check_out_time: null, room_type_id: 1, tv_controls: 1, ac_controls: 1, total_debt: 0 },
  { id: 5, name: '201', status: 'Ocupada', check_in_time: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), check_out_time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), room_type_id: 2, vehicle_plate: 'XYZ-789', vehicle_brand: 'Chevrolet', tv_controls: 1, ac_controls: 1, customer_name: "Maria Lopez", entry_type: 'Auto', total_debt: 700 },
  { id: 6, name: '202', status: 'Disponible', check_in_time: null, check_out_time: null, room_type_id: 2, tv_controls: 1, ac_controls: 1, total_debt: 0 },
  { id: 7, name: '203', status: 'Profunda', check_in_time: null, check_out_time: null, room_type_id: 2, tv_controls: 1, ac_controls: 1, total_debt: 0 },
  { id: 8, name: '204', status: 'Disponible', check_in_time: null, check_out_time: null, room_type_id: 2, tv_controls: 1, ac_controls: 1, total_debt: 0 },
];

export const rates: Rate[] = [
  { id: 1, name: '4 Horas', hours: 4, price: 350, room_type_id: 1, is_extra_hour: false },
  { id: 2, name: '8 Horas', hours: 8, price: 500, room_type_id: 1, is_extra_hour: false },
  { id: 3, name: 'Hora Extra', hours: 1, price: 100, room_type_id: 1, is_extra_hour: true },
  { id: 4, name: '4 Horas Jacuzzi', hours: 4, price: 550, room_type_id: 2, is_extra_hour: false },
  { id: 5, name: '8 Horas Jacuzzi', hours: 8, price: 750, room_type_id: 2, is_extra_hour: false },
  { id: 6, name: 'Hora Extra Jacuzzi', hours: 1, price: 150, room_type_id: 2, is_extra_hour: true },
];

export const products: Product[] = [
    { id: 1, name: 'Cerveza', price: 35, category: 'Bebida', stock: 100 },
    { id: 2, name: 'Papas Fritas', price: 25, category: 'Snack', stock: 50 },
    { id: 3, name: 'Agua', price: 20, category: 'Bebida', stock: 120 },
    { id: 4, name: 'Club Sandwich', price: 120, category: 'Cocina', stock: 20 },
];

export const transactions: Transaction[] = [
    { id: 1, room_id: 2, amount: 350, type: 'Hospedaje Inicial', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), shift: 'Vespertino', description: 'Renta 4 horas', turno_calculado: 'Vespertino', fecha_operativa: new Date().toISOString().split('T')[0] },
    { id: 2, room_id: 2, amount: 100, type: 'Consumo', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), shift: 'Vespertino', description: '2 Cervezas, 1 Papas', turno_calculado: 'Vespertino', fecha_operativa: new Date().toISOString().split('T')[0] },
    { id: 3, room_id: 5, amount: 550, type: 'Hospedaje Inicial', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), shift: 'Matutino', description: 'Renta 4 horas Jacuzzi', turno_calculado: 'Matutino', fecha_operativa: new Date().toISOString().split('T')[0] },
    { id: 4, room_id: 5, amount: 150, type: 'Tiempo Extra', timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), shift: 'Vespertino', description: '1 Hora Extra', turno_calculado: 'Vespertino', fecha_operativa: new Date().toISOString().split('T')[0] },
];

export const expenses: Expense[] = [
    { id: 1, description: 'Limpieza de cisterna', amount: 500, date: new Date().toISOString(), shift: 'Matutino' },
    { id: 2, description: 'Pago de refrescos', amount: 350, date: new Date().toISOString(), shift: 'Vespertino' },
];

export const vehicleReports = [
    { id: 1, plate: 'BAD-456', description: 'Cliente problemático', severity: 'Alta' },
];
