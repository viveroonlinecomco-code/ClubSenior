/**
 * Complete seed script for ClubSenior
 * Creates realistic test data for development and demonstration
 * Run in Supabase SQL Editor
 */

-- ============================================================================
-- CONDOMINIOS
-- ============================================================================

INSERT INTO condominios (nombre, ubicacion, ciudad, contacto_admin_nombre, contacto_admin_email, contacto_admin_phone)
VALUES 
  ('Residencial Sabana', 'Km 30 Autopista Norte', 'Bogotá', 'Carlos Rodríguez', 'carlos@residencial-sabana.co', '+57 300 1111111'),
  ('Condominio Los Laureles', 'Calle 150 con Carrera 7', 'Bogotá', 'María García', 'maria@loslaureles.co', '+57 300 2222222'),
  ('Torres del Valle', 'Diagonal 140 con Carrera 15', 'Bogotá', 'Juan Martínez', 'juan@torresdelvalle.co', '+57 300 3333333'),
  ('Conjunto Parque Norte', 'Carrera 19 con Calle 100', 'Bogotá', 'Ana López', 'ana@parquenorte.co', '+57 300 4444444'),
  ('Residencias Campestre', 'Vía Zipaquirá Km 5', 'Cajicá', 'Roberto Sánchez', 'roberto@campestre.co', '+57 300 5555555')
ON CONFLICT (nombre, ciudad) DO NOTHING;

-- ============================================================================
-- FACILITADORES (Profiles + Facilitador info)
-- ============================================================================

-- Note: En producción, estos serían creados vía admin panel
-- Por ahora, creamos perfiles que representan facilitadores

INSERT INTO profiles (id, email, full_name, phone)
VALUES
  ('11111111-1111-1111-1111-111111111111'::uuid, 'maria.facilitadora@clubsenior.co', 'María Rodríguez García', '+57 320 1111111'),
  ('22222222-2222-2222-2222-222222222222'::uuid, 'carlos.facilitador@clubsenior.co', 'Carlos López Martínez', '+57 320 2222222'),
  ('33333333-3333-3333-3333-333333333333'::uuid, 'ana.facilitadora@clubsenior.co', 'Ana María Gómez Ruiz', '+57 320 3333333'),
  ('44444444-4444-4444-4444-444444444444'::uuid, 'juan.facilitador@clubsenior.co', 'Juan Carlos Vargas', '+57 320 4444444')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- ACTIVIDADES (Weekly schedule)
-- ============================================================================

INSERT INTO actividades (nombre, descripcion, tipo, horario_inicio, horario_fin, frecuencia, facilitador_id, condominio_id, capacidad_maxima)
VALUES
  ('Yoga Terapéutico', 'Ejercicios de relajación y flexibilidad adaptados para adultos mayores', 'EJERCICIO', '10:00', '11:00', 'LUNES', '11111111-1111-1111-1111-111111111111'::uuid, (SELECT id FROM condominios WHERE nombre='Residencial Sabana' LIMIT 1), 15),
  ('Taller de Arte y Manualidades', 'Pintura, dibujo y actividades creativas', 'TALLER', '14:00', '15:30', 'MARTES', '22222222-2222-2222-2222-222222222222'::uuid, (SELECT id FROM condominios WHERE nombre='Residencial Sabana' LIMIT 1), 12),
  ('Cine Club - Películas Clásicas', 'Proyección de películas y discusión en grupo', 'ENTRETENIMIENTO', '15:00', '17:00', 'MIERCOLES', '33333333-3333-3333-3333-333333333333'::uuid, (SELECT id FROM condominios WHERE nombre='Residencial Sabana' LIMIT 1), 20),
  ('Charla de Salud y Bienestar', 'Charlas educativas sobre temas de salud', 'EDUCACION', '10:00', '11:00', 'JUEVES', '44444444-4444-4444-4444-444444444444'::uuid, (SELECT id FROM condominios WHERE nombre='Residencial Sabana' LIMIT 1), 25),
  ('Tertulia Literaria', 'Lectura y discusión de libros clásicos', 'EDUCACION', '14:00', '15:30', 'VIERNES', '11111111-1111-1111-1111-111111111111'::uuid, (SELECT id FROM condominios WHERE nombre='Residencial Sabana' LIMIT 1), 10),
  ('Zumba Senior', 'Ritmos latinos adaptados para adultos mayores', 'EJERCICIO', '09:00', '10:00', 'LUNES', '22222222-2222-2222-2222-222222222222'::uuid, (SELECT id FROM condominios WHERE nombre='Condominio Los Laureles' LIMIT 1), 20),
  ('Taller de Cocina Saludable', 'Preparación de recetas nutritivas y deliciosas', 'TALLER', '10:00', '12:00', 'MIERCOLES', '33333333-3333-3333-3333-333333333333'::uuid, (SELECT id FROM condominios WHERE nombre='Condominio Los Laureles' LIMIT 1), 8),
  ('Juegos de Mesa y Ajedrez', 'Actividades lúdicas para estimular la mente', 'ENTRETENIMIENTO', '14:00', '16:00', 'VIERNES', '44444444-4444-4444-4444-444444444444'::uuid, (SELECT id FROM condominios WHERE nombre='Condominio Los Laureles' LIMIT 1), 15)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SAMPLE USERS (Auth users would be created via signup flow)
-- ============================================================================

-- These are example participants for the dashboard
-- In production, users sign up via /inscribir

INSERT INTO profiles (id, email, full_name, phone)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'juan.perez@example.com', 'Juan Pedro Pérez', '+57 300 9999901'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'rosa.santos@example.com', 'Rosa María Santos', '+57 300 9999902'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'luis.gomez@example.com', 'Luis Fernando Gómez', '+57 300 9999903'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, 'carmen.rivera@example.com', 'Carmen Elena Rivera', '+57 300 9999904'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'jorge.torres@example.com', 'Jorge Alfredo Torres', '+57 300 9999905')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- PARTICIPANTES (Seniors)
-- ============================================================================

INSERT INTO participantes (id, condominio_id, nombre, edad, genero, tiene_autonomia_motriz, notas)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, (SELECT id FROM condominios WHERE nombre='Residencial Sabana' LIMIT 1), 'Juan Pedro Pérez', 72, 'masculino', true, 'Muy activo, participa en todas las actividades'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, (SELECT id FROM condominios WHERE nombre='Residencial Sabana' LIMIT 1), 'Rosa María Santos', 68, 'femenino', true, 'Interesada en arte y manualidades'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, (SELECT id FROM condominios WHERE nombre='Condominio Los Laureles' LIMIT 1), 'Luis Fernando Gómez', 75, 'masculino', true, 'Prefiere actividades de ejercicio'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, (SELECT id FROM condominios WHERE nombre='Condominio Los Laureles' LIMIT 1), 'Carmen Elena Rivera', 70, 'femenino', true, 'Amante de la lectura y literatura'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, (SELECT id FROM condominios WHERE nombre='Torres del Valle' LIMIT 1), 'Jorge Alfredo Torres', 78, 'masculino', true, 'Interesado en temas de salud')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- SUSCRIPCIONES (Active subscriptions)
-- ============================================================================

INSERT INTO suscripciones (participante_id, plan_id, sponsor_id, estado, fecha_inicio, fecha_fin)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, (SELECT id FROM planes WHERE nombre='Plan Individual' LIMIT 1), 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, 'ACTIVE', '2026-08-15'::date, '2026-09-15'::date),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, (SELECT id FROM planes WHERE nombre='Plan Individual' LIMIT 1), 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, 'ACTIVE', '2026-08-20'::date, '2026-09-20'::date),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, (SELECT id FROM planes WHERE nombre='Plan Individual' LIMIT 1), 'cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, 'ACTIVE', '2026-09-01'::date, '2026-10-01'::date),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, (SELECT id FROM planes WHERE nombre='Plan Trimestral' LIMIT 1), 'dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, 'ACTIVE', '2026-09-05'::date, '2026-12-05'::date),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, (SELECT id FROM planes WHERE nombre='Plan Individual' LIMIT 1), 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid, 'PAYMENT_PENDING', '2026-09-10'::date, '2026-10-10'::date)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ASISTENCIAS (Attendance records)
-- ============================================================================

WITH activities AS (
  SELECT id FROM actividades LIMIT 5
),
seniors AS (
  SELECT id FROM participantes LIMIT 3
)
INSERT INTO asistencias (actividad_id, participante_id, asistio)
SELECT 
  (SELECT id FROM activities OFFSET floor(random() * 5) LIMIT 1),
  (SELECT id FROM seniors OFFSET floor(random() * 3) LIMIT 1),
  (random() > 0.2)  -- 80% attendance rate
FROM generate_series(1, 15)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- REPORTES SEMANALES (Weekly reports)
-- ============================================================================

INSERT INTO reportes_semanales (participante_id, semana_inicio, semana_fin, actividades_realizadas, asistencias, inasistencias, observaciones, calificacion_general, resumen)
VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '2026-09-01'::date, '2026-09-07'::date, 5, 4, 1, 'Excelente participación en todas las actividades. Mostró entusiasmo especial en yoga.', 5, 'Semana productiva con buena integración social'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '2026-09-01'::date, '2026-09-07'::date, 3, 3, 0, 'Rosa participó activamente en taller de arte y cine. Creó una obra hermosa.', 4, 'Semana de creatividad y disfrute'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid, '2026-09-01'::date, '2026-09-07'::date, 4, 3, 1, 'Luis fue constante en actividades de ejercicio. Muestra mejoría en flexibilidad.', 4, 'Progreso físico notable'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '2026-09-08'::date, '2026-09-14'::date, 5, 5, 0, 'Semana excelente. Participó en todas las actividades programadas. Liderazgo en grupo.', 5, 'Comportamiento ejemplar'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid, '2026-09-08'::date, '2026-09-14'::date, 3, 2, 1, 'Carmen asistió a tertulia literaria. Aportó opiniones valiosas en debates.', 4, 'Participación intelectual destacada')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- PAGOS (Payment history)
-- ============================================================================

INSERT INTO pagos (suscripcion_id, monto_cop, referencia_wompi, estado, metadata_wompi)
VALUES
  ((SELECT id FROM suscripciones WHERE participante_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid LIMIT 1), 160000, 'wompi_001_juan_1234', 'APPROVED', '{"transaction_id": "txn_001", "date": "2026-08-15"}'),
  ((SELECT id FROM suscripciones WHERE participante_id='bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid LIMIT 1), 160000, 'wompi_002_rosa_5678', 'APPROVED', '{"transaction_id": "txn_002", "date": "2026-08-20"}'),
  ((SELECT id FROM suscripciones WHERE participante_id='cccccccc-cccc-cccc-cccc-cccccccccccc'::uuid LIMIT 1), 160000, 'wompi_003_luis_9012', 'APPROVED', '{"transaction_id": "txn_003", "date": "2026-09-01"}'),
  ((SELECT id FROM suscripciones WHERE participante_id='dddddddd-dddd-dddd-dddd-dddddddddddd'::uuid LIMIT 1), 450000, 'wompi_004_carmen_3456', 'APPROVED', '{"transaction_id": "txn_004", "date": "2026-09-05"}'),
  ((SELECT id FROM suscripciones WHERE participante_id='eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'::uuid LIMIT 1), 160000, 'wompi_005_jorge_7890', 'PENDING', '{"transaction_id": "txn_005", "date": "2026-09-10"}')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- RESULTADO
-- ============================================================================

SELECT 
  (SELECT COUNT(*) FROM condominios) as condominios_created,
  (SELECT COUNT(*) FROM profiles) as perfiles_created,
  (SELECT COUNT(*) FROM participantes) as participantes_created,
  (SELECT COUNT(*) FROM actividades) as actividades_created,
  (SELECT COUNT(*) FROM suscripciones) as suscripciones_created,
  (SELECT COUNT(*) FROM asistencias) as asistencias_created,
  (SELECT COUNT(*) FROM reportes_semanales) as reportes_created,
  (SELECT COUNT(*) FROM pagos) as pagos_created;
