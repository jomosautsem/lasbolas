-- supabase/seed.sql
-- Este script actualiza las habitaciones y las tarifas para el tipo 'Sencilla'.

-- ADVERTENCIA: Este script borrará todas las habitaciones existentes y las tarifas
-- regulares (no de extensión) para el tipo de habitación 'Sencilla' (ID=1).

-- 1. Borrar todas las habitaciones existentes para evitar duplicados.
TRUNCATE TABLE public.rooms RESTART IDENTITY CASCADE;

-- 2. Insertar la nueva lista de 21 habitaciones.
-- Se asume que el room_type_id para 'Sencilla' es 1.
INSERT INTO public.rooms (name, room_type_id) VALUES
('Habitación 1', 1),
('Habitación 2', 1),
('Habitación 3', 1),
('Habitación 4', 1),
('Habitación 5', 1),
('Habitación 6', 1),
('Habitación 7', 1),
('Habitación 8', 1),
('Habitación 9A', 1),
('Habitación 9B', 1),
('Habitación 10', 1),
('Habitación 11', 1),
('Habitación 12', 1),
('Habitación 13', 1),
('Habitación 14', 1),
('Habitación 15', 1),
('Habitación 16', 1),
('Habitación 17', 1),
('Habitación 18', 1),
('Habitación 19', 1),
('Habitación 20', 1);

-- 3. Borrar las tarifas regulares existentes para el tipo de habitación 'Sencilla' (ID=1).
-- Esto no borrará las tarifas de "Tiempo Extra".
DELETE FROM public.rates 
WHERE room_type_id = 1 AND is_extra_hour = false;

-- 4. Insertar las nuevas tarifas para el tipo de habitación 'Sencilla'.
INSERT INTO public.rates (name, hours, price, room_type_id, is_extra_hour) VALUES 
('2 Horas', 2, 220, 1, false),
('4 Horas', 4, 280, 1, false),
('5 Horas', 5, 300, 1, false),
('8 Horas', 8, 330, 1, false),
('12 Horas', 12, 480, 1, false);

-- Nota: Este script no modifica las tarifas de otros tipos de habitación como 'Con Jacuzzi'.
-- La tarifa 'Extensión 3 Horas' para habitaciones Sencillas se mantiene si ya existía.
