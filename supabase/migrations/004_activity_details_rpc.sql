-- ============================================================================
-- Supabase Migration 004: Activity Details RPC
-- Purpose: Optimize N+1 queries by combining activity, participantes, and asistencias
-- Execution: Automatic on deployment via Supabase
-- ============================================================================

CREATE OR REPLACE FUNCTION get_activity_details(activity_id UUID)
RETURNS TABLE (
  actividad_id UUID,
  nombre TEXT,
  descripcion TEXT,
  fecha DATE,
  hora_inicio TIME,
  duracion_minutos INT,
  condominio_id UUID,
  ubicacion TEXT,
  capacidad_max INT,
  estado TEXT,
  participante_id UUID,
  participante_nombre TEXT,
  participante_edad INT,
  participante_genero TEXT,
  asistencia_presente BOOLEAN,
  asistencia_hora_llegada TIMESTAMP,
  asistencia_observaciones TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.nombre,
    a.descripcion,
    a.fecha,
    a.hora_inicio,
    a.duracion_minutos,
    a.condominio_id,
    a.ubicacion,
    a.capacidad_max,
    a.estado,
    p.id,
    p.nombre,
    p.edad,
    p.genero,
    ast.presente,
    ast.hora_llegada,
    ast.observaciones
  FROM actividades a
  LEFT JOIN participantes p ON p.condominio_id = a.condominio_id AND p.activo = TRUE
  LEFT JOIN asistencias ast ON ast.actividad_id = a.id AND ast.participante_id = p.id
  WHERE a.id = activity_id
  ORDER BY p.nombre NULLS LAST;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create index for faster activity lookups
CREATE INDEX IF NOT EXISTS idx_actividades_id_condominio 
  ON actividades(id, condominio_id);

-- Create index for participantes lookups by condominio
CREATE INDEX IF NOT EXISTS idx_participantes_condominio_active
  ON participantes(condominio_id) 
  WHERE activo = TRUE;

-- Create composite index for asistencias lookups
CREATE INDEX IF NOT EXISTS idx_asistencias_actividad_participante
  ON asistencias(actividad_id, participante_id);
