-- Migration: Extend usuarios table with missing fields
-- Date: 2026-09-15
-- Purpose: Add all personal data fields needed for Inscribir flow

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS (
  nombre_abuelo VARCHAR(100),
  apellido_abuelo VARCHAR(100),
  fecha_nacimiento DATE,
  ciudad VARCHAR(100),
  terminos_aceptados BOOLEAN DEFAULT false,
  politica_privacidad_aceptada BOOLEAN DEFAULT false,
  suscripcion_plan VARCHAR(50),        -- 'mensual' or 'sesion'
  suscripcion_estado VARCHAR(50),      -- 'activa', 'cancelada', 'pendiente_pago', 'vencida'
  fecha_pago_ultimo TIMESTAMP,
  contratos_sponsor_firmado BOOLEAN DEFAULT false,
  contratos_participant_firmado BOOLEAN DEFAULT false,
  inscripcion_completada BOOLEAN DEFAULT false
);

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
CREATE INDEX IF NOT EXISTS idx_usuarios_inscripcion_completada ON usuarios(inscripcion_completada);
CREATE INDEX IF NOT EXISTS idx_usuarios_suscripcion_estado ON usuarios(suscripcion_estado);

-- Add comment for clarity
COMMENT ON COLUMN usuarios.nombre_abuelo IS 'Nombre del abuelo/adulto mayor';
COMMENT ON COLUMN usuarios.apellido_abuelo IS 'Apellido del abuelo/adulto mayor';
COMMENT ON COLUMN usuarios.fecha_nacimiento IS 'Fecha de nacimiento del usuario';
COMMENT ON COLUMN usuarios.ciudad IS 'Ciudad donde reside (Sabana Bogotá)';
COMMENT ON COLUMN usuarios.terminos_aceptados IS 'Aceptó términos de servicio (Paso 2)';
COMMENT ON COLUMN usuarios.politica_privacidad_aceptada IS 'Aceptó política de privacidad (Paso 2)';
COMMENT ON COLUMN usuarios.suscripcion_plan IS 'Plan seleccionado: mensual ($150k) o sesion ($40k)';
COMMENT ON COLUMN usuarios.suscripcion_estado IS 'Estado actual de suscripción';
COMMENT ON COLUMN usuarios.fecha_pago_ultimo IS 'Timestamp del último pago completado';
COMMENT ON COLUMN usuarios.contratos_sponsor_firmado IS 'Sponsor contract signed (Paso 3)';
COMMENT ON COLUMN usuarios.contratos_participant_firmado IS 'Participant contract signed (Paso 3)';
COMMENT ON COLUMN usuarios.inscripcion_completada IS 'Flag: todos los 4 pasos completados + pagado';
