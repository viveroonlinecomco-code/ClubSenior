-- ============================================================================
-- SQL SEGURA FASE 1 - MVP ADMIN DASHBOARD
-- Ejecutar en Supabase Console (seguro, no toca nada existente)
-- ============================================================================

-- 1. CREAR TABLA ASISTENCIAS (nueva, no modifica nada)
CREATE TABLE IF NOT EXISTS asistencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  actividad_id UUID NOT NULL,
  asistio BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE CASCADE,
  
  UNIQUE(usuario_id, actividad_id)
);

-- Índice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_asistencias_actividad_id 
  ON asistencias(actividad_id);

CREATE INDEX IF NOT EXISTS idx_asistencias_usuario_id 
  ON asistencias(usuario_id);

-- 2. ENABLE RLS (security)
ALTER TABLE asistencias ENABLE ROW LEVEL SECURITY;

-- 3. CREAR POLICY PERMISIVA PARA MVP
-- Elena puede hacer todo (sin tabla admin_users compleja)
-- Si hay JWT válido → permitir lectura/escritura
CREATE POLICY "asistencias_authenticated" ON asistencias
  FOR SELECT
  USING (auth.jwt() IS NOT NULL);

CREATE POLICY "asistencias_admin_write" ON asistencias
  FOR INSERT
  WITH CHECK (auth.jwt() IS NOT NULL);

CREATE POLICY "asistencias_admin_update" ON asistencias
  FOR UPDATE
  USING (auth.jwt() IS NOT NULL)
  WITH CHECK (auth.jwt() IS NOT NULL);

CREATE POLICY "asistencias_admin_delete" ON asistencias
  FOR DELETE
  USING (auth.jwt() IS NOT NULL);

-- 4. VERIFICACIÓN (ejecutar después)
-- SELECT tablename FROM pg_tables WHERE tablename = 'asistencias';
-- → Output: asistencias ✅

-- SELECT COUNT(*) FROM asistencias;
-- → Output: 0 (tabla vacía, lista para usar)

-- ============================================================================
-- ✅ SQL SEGURA LISTA
-- NO modifica tablas existentes (usuarios, actividades, etc)
-- NO rompe nada del flujo actual
-- ============================================================================
