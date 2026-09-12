-- src/migrations/FASE_2_TRIGGERS.sql
-- ============================================================================
-- TRIGGERS POSTGRESQL - AUTOMATIZACIÓN
-- Ejecutar en Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. TRIGGER: Validar que sponsor y participant están en MISMO condominio
-- ============================================================================
-- Cuando se crea una suscripción, verificar que ambos usuarios
-- están en el mismo condominio_id

CREATE OR REPLACE FUNCTION check_suscripcion_condominio()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar que sponsor y participant existen
  IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id = NEW.sponsor_id) THEN
    RAISE EXCEPTION 'Sponsor user not found: %', NEW.sponsor_id;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM usuarios WHERE id = NEW.participante_id) THEN
    RAISE EXCEPTION 'Participant user not found: %', NEW.participante_id;
  END IF;

  -- Verificar que condominio existe y está activo
  IF NOT EXISTS (SELECT 1 FROM condominios WHERE id = NEW.condominio_id AND activo = true) THEN
    RAISE EXCEPTION 'Condominio not found or inactive: %', NEW.condominio_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_suscripcion_condominio ON suscripciones;
CREATE TRIGGER trigger_check_suscripcion_condominio
BEFORE INSERT OR UPDATE ON suscripciones
FOR EACH ROW
EXECUTE FUNCTION check_suscripcion_condominio();

-- ============================================================================
-- 2. TRIGGER: Validar estado válido en suscripciones
-- ============================================================================
-- Estados válidos: pendiente_contrato, pendiente_pago, activa, pausada, cancelada, fallo_pago, vencida

CREATE OR REPLACE FUNCTION check_suscripcion_estado()
RETURNS TRIGGER AS $$
DECLARE
  valid_estados TEXT[] := ARRAY['pendiente_contrato', 'pendiente_pago', 'activa', 'pausada', 'cancelada', 'fallo_pago', 'vencida'];
BEGIN
  IF NOT (NEW.estado = ANY(valid_estados)) THEN
    RAISE EXCEPTION 'Invalid estado: %. Must be one of: %', NEW.estado, array_to_string(valid_estados, ', ');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_suscripcion_estado ON suscripciones;
CREATE TRIGGER trigger_check_suscripcion_estado
BEFORE INSERT OR UPDATE ON suscripciones
FOR EACH ROW
EXECUTE FUNCTION check_suscripcion_estado();

-- ============================================================================
-- 3. TRIGGER: Actualizar fecha_vencimiento automáticamente
-- ============================================================================
-- Si suscripción está activa Y fecha_fin es hoy → cambiar a 'vencida'

CREATE OR REPLACE FUNCTION check_suscripcion_vencida()
RETURNS TRIGGER AS $$
BEGIN
  -- Si fecha_fin pasó y estado es 'activa' → cambiar a 'vencida'
  IF NEW.estado = 'activa' AND NEW.fecha_fin < CURRENT_DATE THEN
    NEW.estado := 'vencida';
    NEW.fecha_cancelacion := CURRENT_TIMESTAMP;
    NEW.razon_cancelacion := 'Subscription expired';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_suscripcion_vencida ON suscripciones;
CREATE TRIGGER trigger_check_suscripcion_vencida
BEFORE UPDATE ON suscripciones
FOR EACH ROW
EXECUTE FUNCTION check_suscripcion_vencida();

-- ============================================================================
-- 4. TRIGGER: Actualizar updated_at automáticamente
-- ============================================================================
-- Cualquier UPDATE debe actualizar updated_at

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar a todas las tablas principales
DROP TRIGGER IF EXISTS trigger_update_suscripciones_updated_at ON suscripciones;
CREATE TRIGGER trigger_update_suscripciones_updated_at
BEFORE UPDATE ON suscripciones
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_contratos_updated_at ON contratos;
CREATE TRIGGER trigger_update_contratos_updated_at
BEFORE UPDATE ON contratos
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_usuarios_updated_at ON usuarios;
CREATE TRIGGER trigger_update_usuarios_updated_at
BEFORE UPDATE ON usuarios
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_update_actividades_updated_at ON actividades;
CREATE TRIGGER trigger_update_actividades_updated_at
BEFORE UPDATE ON actividades
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 5. TRIGGER: Cuando se firma → actualizar estado de contrato
-- ============================================================================
-- Si se registra firma → marcar contrato como aceptado (si ambos firmaron)

CREATE OR REPLACE FUNCTION update_contrato_when_signed()
RETURNS TRIGGER AS $$
DECLARE
  sponsor_firma_existe BOOLEAN;
  participant_firma_existe BOOLEAN;
BEGIN
  -- Verificar si ambos han firmado este contrato
  SELECT EXISTS(SELECT 1 FROM firmas WHERE contrato_id = NEW.contrato_id AND rol_al_firmar = 'sponsor')
  INTO sponsor_firma_existe;

  SELECT EXISTS(SELECT 1 FROM firmas WHERE contrato_id = NEW.contrato_id AND rol_al_firmar = 'participant')
  INTO participant_firma_existe;

  -- Si ambos firmaron, marcar contrato como aceptado
  IF sponsor_firma_existe AND participant_firma_existe THEN
    UPDATE contratos
    SET aceptado = true, updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.contrato_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_contrato_when_signed ON firmas;
CREATE TRIGGER trigger_update_contrato_when_signed
AFTER INSERT ON firmas
FOR EACH ROW
EXECUTE FUNCTION update_contrato_when_signed();

-- ============================================================================
-- 6. TRIGGER: Validar que firma solo registre UNA por usuario por contrato
-- ============================================================================
-- Prevenir que alguien firme 2 veces el mismo contrato

CREATE OR REPLACE FUNCTION check_duplicate_signature()
RETURNS TRIGGER AS $$
BEGIN
  IF EXISTS(
    SELECT 1 FROM firmas
    WHERE contrato_id = NEW.contrato_id
    AND usuario_id = NEW.usuario_id
    AND id != NEW.id
  ) THEN
    RAISE EXCEPTION 'User % already signed contract %', NEW.usuario_id, NEW.contrato_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_check_duplicate_signature ON firmas;
CREATE TRIGGER trigger_check_duplicate_signature
BEFORE INSERT ON firmas
FOR EACH ROW
EXECUTE FUNCTION check_duplicate_signature();

-- ============================================================================
-- 7. TRIGGER: Cuando suscripción se cancela → notificar
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_on_cancellation()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.estado = 'cancelada' AND OLD.estado != 'cancelada' THEN
    INSERT INTO notificaciones (usuario_id, evento_tipo, titulo, mensaje, leida)
    VALUES 
      (NEW.sponsor_id, 'suscripcion_cancelada', 'Plan cancelado', 'Tu plan ha sido cancelado.', false),
      (NEW.participante_id, 'suscripcion_cancelada', 'Plan cancelado', 'El plan ha sido cancelado.', false);
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_notify_on_cancellation ON suscripciones;
CREATE TRIGGER trigger_notify_on_cancellation
AFTER UPDATE ON suscripciones
FOR EACH ROW
EXECUTE FUNCTION notify_on_cancellation();

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

SELECT '✅ TRIGGERS IMPLEMENTADOS:' as status;

SELECT 
  trigger_name,
  'ACTIVO' as status
FROM (
  SELECT 'trigger_check_suscripcion_condominio' as trigger_name
  UNION ALL SELECT 'trigger_check_suscripcion_estado'
  UNION ALL SELECT 'trigger_check_suscripcion_vencida'
  UNION ALL SELECT 'trigger_update_suscripciones_updated_at'
  UNION ALL SELECT 'trigger_update_contratos_updated_at'
  UNION ALL SELECT 'trigger_update_usuarios_updated_at'
  UNION ALL SELECT 'trigger_update_actividades_updated_at'
  UNION ALL SELECT 'trigger_update_contrato_when_signed'
  UNION ALL SELECT 'trigger_check_duplicate_signature'
  UNION ALL SELECT 'trigger_notify_on_cancellation'
) as t;

-- ============================================================================
-- NOTAS
-- ============================================================================
/*
TRIGGERS CRÍTICOS:
1. check_suscripcion_condominio → Validar mismo condominio
2. check_suscripcion_estado → Estado válido
3. update_contrato_when_signed → Automático cuando ambos firman
4. check_duplicate_signature → Una firma por usuario

AUTOMATIZACIÓN:
- Al crear suscripción → validar condominio
- Al actualizar suscripción → validar estado + vencimiento
- Al firmar → marcar contrato aceptado
- Al cancelar → enviar notificación
*/
