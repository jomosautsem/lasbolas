-- Este script reemplaza TODAS las habitaciones existentes por la nueva lista.
-- ¡CUIDADO! Se borrarán los datos de las habitaciones actuales.

-- 1. Elimina las habitaciones existentes en la tabla 'rooms'.
-- Las tablas relacionadas (vehicle_history) se borrarán en cascada y las transacciones (transactions)
-- actualizarán su room_id a NULL, según la configuración de la base de datos.
DELETE FROM public.rooms;


-- 2. Reinicia la secuencia del ID para que los nuevos IDs comiencen desde 1.
SELECT setval(pg_get_serial_sequence('public.rooms', 'id'), 1, false);


-- 3. Inserta la nueva lista de 21 habitaciones.
-- Se asume que todas son del tipo de habitación con ID = 1 ('Sencilla').
-- Si deseas asignarlas a otro tipo, cambia el segundo número en cada línea.
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
