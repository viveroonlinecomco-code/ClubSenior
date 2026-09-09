-- ============================================================================
-- SEED DATA - ClubSenior
-- Datos de ejemplo para testing local
-- Ejecutar en: https://supabase.com/dashboard/project/popgpdhtyhckvkjmiknq/sql
-- ============================================================================

-- ============================================================================
-- 1. INSERT CONDOMINIOS
-- ============================================================================

INSERT INTO condominios (
  id, nombre, ubicacion, ciudad, 
  contacto_admin_nombre, contacto_admin_email, contacto_admin_phone,
  activo
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655440001',
    'Hacienda Oasis',
    'Calle Principal 123, Vereda San Pablo',
    'Cajicá',
    'Miguel González',
    'miguel.gonzalez@haciendaoasis.com',
    '+57 310 555 0001',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655440002',
    'Residencial Sabana Verde',
    'Avenida Independencia 456',
    'Chía',
    'Carmen López',
    'carmen.lopez@sabanatech.com',
    '+57 310 555 0002',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655440003',
    'Conjunto Metropolitano',
    'Carrera 7 No 100-50',
    'Cajicá',
    'Roberto Martínez',
    'robert.martinez@metropol.com.co',
    '+57 310 555 0003',
    true
  )
ON CONFLICT (nombre, ciudad) DO NOTHING;

-- ============================================================================
-- 2. INSERT PLANES
-- ============================================================================

INSERT INTO planes (
  id, nombre, descripcion, precio_cop, 
  duracion_dias, sesiones_incluidas, activo
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655550001',
    'Plan Mensual',
    '4 sesiones de 2 horas cada una, una por semana',
    160000,
    30,
    4,
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655550002',
    'Plan Trimestral',
    '12 sesiones de 2 horas cada una, una por semana durante 3 meses',
    450000,
    90,
    12,
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655550003',
    'Plan Semestral',
    '24 sesiones de 2 horas cada una durante 6 meses',
    850000,
    180,
    24,
    true
  )
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================================
-- 3. INSERT ACTIVIDADES (Sample Activities)
-- ============================================================================

INSERT INTO actividades (
  id, nombre, descripcion, tipo, 
  duracion_minutos, capacidad_maxima, facilitador_nombre, activo
) VALUES
  (
    '550e8400-e29b-41d4-a716-446655660001',
    'Tarde de Café y Conversación',
    'Espacio para compartir historias, experiencias de vida y crear nuevas amistades',
    'SOCIAL',
    120,
    15,
    'Facilitador General',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655660002',
    'Ejercicios de Memoria y Concentración',
    'Juegos mentales y ejercicios cognitivos para mantener la mente activa',
    'COGNITIVA',
    120,
    12,
    'Psicólogo',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655660003',
    'Taller de Manualidades',
    'Creación de artesanías, pinturas y proyectos creativos',
    'CREATIVIDAD',
    120,
    10,
    'Artesana',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655660004',
    'Yoga Suave para Adultos Mayores',
    'Ejercicio físico adaptado, flexibilidad y relajación',
    'FISICA',
    90,
    12,
    'Instructor de Yoga',
    true
  ),
  (
    '550e8400-e29b-41d4-a716-446655660005',
    'Sesión de Historias y Sabiduría',
    'Conversatorios sobre la vida, anécdotas y lecciones aprendidas',
    'CULTURAL',
    120,
    20,
    'Historiador',
    true
  )
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================================
-- 4. INSERT FAMILY RELATIONSHIPS (Presets)
-- ============================================================================

-- Nota: Las relaciones familiares se crean dinámicamente cuando el usuario 
-- se registra. Estos son solo ejemplos de posibles tipos.

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Ver condominios creados
SELECT COUNT(*) as condominios_count FROM condominios;

-- Ver planes creados
SELECT COUNT(*) as planes_count FROM planes;

-- Ver actividades creadas
SELECT COUNT(*) as actividades_count FROM actividades;

-- Ver all condominios
SELECT id, nombre, ciudad, activo FROM condominios ORDER BY ciudad;

-- Ver all planes
SELECT id, nombre, precio_cop, duracion_dias, sesiones_incluidas FROM planes;

-- Ver all actividades
SELECT id, nombre, tipo, duracion_minutos, facilitador_nombre FROM actividades;
