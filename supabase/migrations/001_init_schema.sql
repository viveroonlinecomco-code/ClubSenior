/**
 * Tardes de Café, Mente & Saberes - PostgreSQL Schema
 * Database: Supabase PostgreSQL
 * Execution: Run in Supabase SQL Editor or via migrations
 * 
 * IMPORTANT: Deploy AFTER creating Supabase project and auth is initialized
 */

-- ============================================================================
-- ENABLE REQUIRED EXTENSIONS
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABLES
-- ============================================================================

-- PROFILES: Connected to auth.users, mirrors Supabase Auth
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- ============================================================================
-- LOCATIONS & CONDOMINIOS
-- ============================================================================

CREATE TABLE condominios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  ubicacion TEXT NOT NULL,
  ciudad TEXT NOT NULL,
  contacto_admin_nombre TEXT NOT NULL,
  contacto_admin_email TEXT NOT NULL,
  contacto_admin_phone TEXT NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  CONSTRAINT nombre_unique_per_ciudad UNIQUE(nombre, ciudad)
);

CREATE INDEX idx_condominios_ciudad ON condominios(ciudad);
CREATE INDEX idx_condominios_activo ON condominios(activo);

-- ============================================================================
-- RELATIONSHIPS & FAMILY
-- ============================================================================

CREATE TABLE family_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sponsor_id UUID NOT NULL,
  participante_id UUID NOT NULL,
  parentesco TEXT NOT NULL CHECK (parentesco IN ('hijo', 'hija', 'nieto', 'nieta', 'otro')),
  es_pagador BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (sponsor_id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (participante_id) REFERENCES profiles(id) ON DELETE CASCADE,
  CONSTRAINT different_users CHECK (sponsor_id != participante_id),
  UNIQUE(sponsor_id, participante_id)
);

CREATE INDEX idx_family_sponsor ON family_relationships(sponsor_id);
CREATE INDEX idx_family_participante ON family_relationships(participante_id);

-- ============================================================================
-- PARTICIPANTES
-- ============================================================================

CREATE TABLE participantes (
  id UUID PRIMARY KEY,
  condominio_id UUID NOT NULL,
  nombre TEXT NOT NULL,
  edad INTEGER NOT NULL CHECK (edad >= 50 AND edad <= 120),
  genero TEXT CHECK (genero IN ('masculino', 'femenino', 'otro')),
  tiene_autonomia_motriz BOOLEAN NOT NULL,
  notas TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (id) REFERENCES profiles(id) ON DELETE CASCADE,
  FOREIGN KEY (condominio_id) REFERENCES condominios(id) ON DELETE CASCADE
);

CREATE INDEX idx_participantes_condominio ON participantes(condominio_id);
CREATE INDEX idx_participantes_activo ON participantes(activo);

-- ============================================================================
-- PLANES & PRICING
-- ============================================================================

CREATE TABLE planes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  descripcion TEXT NOT NULL,
  precio_cop INTEGER NOT NULL CHECK (precio_cop > 0),
  frecuencia TEXT NOT NULL CHECK (frecuencia IN ('mensual', 'trimestral', 'anual')),
  duracion_dias INTEGER NOT NULL CHECK (duracion_dias > 0),
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- ============================================================================
-- SUSCRIPCIONES (STATE MACHINE)
-- ============================================================================

CREATE TABLE suscripciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participante_id UUID NOT NULL,
  plan_id UUID NOT NULL,
  sponsor_id UUID NOT NULL,
  estado TEXT NOT NULL DEFAULT 'STARTED' CHECK (estado IN (
    'STARTED', 'DATA_COMPLETED', 'LEGAL_ACCEPTED', 'PAYMENT_PENDING',
    'PAYMENT_APPROVED', 'ACTIVE', 'PAYMENT_FAILED', 'CANCELLED', 'EXPIRED', 'SUSPENDED'
  )),
  fecha_inicio DATE,
  fecha_fin DATE,
  fecha_cancelacion DATE,
  razon_cancelacion TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (participante_id) REFERENCES participantes(id) ON DELETE CASCADE,
  FOREIGN KEY (plan_id) REFERENCES planes(id),
  FOREIGN KEY (sponsor_id) REFERENCES profiles(id)
);

CREATE INDEX idx_suscripciones_participante ON suscripciones(participante_id);
CREATE INDEX idx_suscripciones_sponsor ON suscripciones(sponsor_id);
CREATE INDEX idx_suscripciones_estado ON suscripciones(estado);

-- ============================================================================
-- PAGOS (WOMPI)
-- ============================================================================

CREATE TABLE pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suscripcion_id UUID NOT NULL,
  monto_cop INTEGER NOT NULL CHECK (monto_cop > 0),
  referencia_wompi TEXT NOT NULL UNIQUE,
  estado TEXT NOT NULL DEFAULT 'PENDING' CHECK (estado IN ('PENDING', 'APPROVED', 'FAILED', 'REFUNDED')),
  metadata_wompi JSONB,
  intento_numero INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  processed_at TIMESTAMP,

  FOREIGN KEY (suscripcion_id) REFERENCES suscripciones(id) ON DELETE CASCADE
);

CREATE INDEX idx_pagos_suscripcion ON pagos(suscripcion_id);
CREATE INDEX idx_pagos_referencia ON pagos(referencia_wompi);
CREATE INDEX idx_pagos_estado ON pagos(estado);

-- ============================================================================
-- DOCUMENTOS LEGALES (VERSIONED)
-- ============================================================================

CREATE TABLE contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('TERMINOS_SERVICIO', 'POLITICA_PRIVACIDAD', 'AUTORIZACION_DATOS')),
  version TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  storage_path TEXT NOT NULL,
  hash_documento TEXT NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  UNIQUE(tipo, version)
);

-- ============================================================================
-- FIRMAS (AUDITABLE)
-- ============================================================================

CREATE TABLE firmas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL,
  usuario_id UUID NOT NULL,
  version_documento TEXT NOT NULL,
  hash_documento TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT now(),
  ip_address INET,
  user_agent TEXT,
  otp_verificado BOOLEAN DEFAULT FALSE,
  aceptado BOOLEAN NOT NULL,

  FOREIGN KEY (contrato_id) REFERENCES contratos(id),
  FOREIGN KEY (usuario_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_firmas_usuario ON firmas(usuario_id);
CREATE INDEX idx_firmas_contrato ON firmas(contrato_id);

-- ============================================================================
-- ACTIVIDADES
-- ============================================================================

CREATE TABLE actividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  condominio_id UUID NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  fecha DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  facilitador_id UUID,
  modulo TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (condominio_id) REFERENCES condominios(id) ON DELETE CASCADE,
  FOREIGN KEY (facilitador_id) REFERENCES profiles(id)
);

CREATE INDEX idx_actividades_condominio ON actividades(condominio_id);
CREATE INDEX idx_actividades_fecha ON actividades(fecha);

-- ============================================================================
-- ASISTENCIAS
-- ============================================================================

CREATE TABLE asistencias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actividad_id UUID NOT NULL,
  participante_id UUID NOT NULL,
  asistio BOOLEAN NOT NULL,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE CASCADE,
  FOREIGN KEY (participante_id) REFERENCES participantes(id) ON DELETE CASCADE,
  UNIQUE(actividad_id, participante_id)
);

CREATE INDEX idx_asistencias_participante ON asistencias(participante_id);

-- ============================================================================
-- REPORTES SEMANALES
-- ============================================================================

CREATE TABLE reportes_semanales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participante_id UUID NOT NULL,
  semana_inicio DATE NOT NULL,
  semana_fin DATE NOT NULL,
  actividades_realizadas INTEGER DEFAULT 0,
  asistencias INTEGER DEFAULT 0,
  inasistencias INTEGER DEFAULT 0,
  observaciones TEXT,
  calificacion_general INTEGER CHECK (calificacion_general IS NULL OR (calificacion_general >= 1 AND calificacion_general <= 5)),
  resumen TEXT,
  created_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (participante_id) REFERENCES participantes(id) ON DELETE CASCADE,
  UNIQUE(participante_id, semana_inicio)
);

CREATE INDEX idx_reportes_participante ON reportes_semanales(participante_id);

-- ============================================================================
-- NOTIFICACIONES
-- ============================================================================

CREATE TABLE notificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('EMAIL', 'SMS', 'WHATSAPP', 'PUSH', 'IN_APP')),
  asunto TEXT NOT NULL,
  contenido TEXT NOT NULL,
  leida BOOLEAN DEFAULT FALSE,
  enviada BOOLEAN DEFAULT FALSE,
  fecha_envio TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (usuario_id) REFERENCES profiles(id) ON DELETE CASCADE
);

CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);

-- ============================================================================
-- WEBHOOKS (IDEMPOTENCY)
-- ============================================================================

CREATE TABLE webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor TEXT NOT NULL,
  evento_id_externo TEXT NOT NULL,
  evento_tipo TEXT NOT NULL,
  payload JSONB NOT NULL,
  procesado BOOLEAN DEFAULT FALSE,
  resultado TEXT,
  error TEXT,
  intento_numero INTEGER DEFAULT 0,
  fecha_procesamiento TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),

  UNIQUE(proveedor, evento_id_externo)
);

CREATE INDEX idx_webhook_evento_externo ON webhook_events(evento_id_externo);
CREATE INDEX idx_webhook_procesado ON webhook_events(procesado);

-- ============================================================================
-- AUDIT LOGGING
-- ============================================================================

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  accion TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT now(),

  FOREIGN KEY (actor_id) REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_accion ON audit_logs(accion);
CREATE INDEX idx_audit_timestamp ON audit_logs(created_at);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE condominios ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE suscripciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
ALTER TABLE contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE firmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE asistencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE reportes_semanales ENABLE ROW LEVEL SECURITY;
ALTER TABLE notificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can only see their own profile
CREATE POLICY "Users see own profile" ON profiles FOR SELECT USING (id = auth.uid());

-- Users can only update their own profile
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (id = auth.uid());

-- Admins can see all profiles (via service role)
-- Note: Service role bypasses RLS automatically

-- ============================================================================
-- SUSCRIPCIONES POLICIES
-- ============================================================================

-- Sponsors can see subscriptions they own
CREATE POLICY "Sponsors see own subscriptions" ON suscripciones FOR SELECT
  USING (sponsor_id = auth.uid());

-- Participantes can see their own subscriptions
CREATE POLICY "Participantes see own subscriptions" ON suscripciones FOR SELECT
  USING (
    participante_id IN (
      SELECT id FROM profiles WHERE id = auth.uid()
    )
  );

-- ============================================================================
-- PAGOS POLICIES
-- ============================================================================

-- Users can only see payments for their subscriptions
CREATE POLICY "Users see own payment history" ON pagos FOR SELECT
  USING (
    suscripcion_id IN (
      SELECT id FROM suscripciones 
      WHERE sponsor_id = auth.uid() OR participante_id = auth.uid()
    )
  );

-- ============================================================================
-- FIRMAS POLICIES
-- ============================================================================

-- Users can only see their own signatures
CREATE POLICY "Users see own signatures" ON firmas FOR SELECT
  USING (usuario_id = auth.uid());

-- ============================================================================
-- AUDIT LOGS POLICIES
-- ============================================================================

-- Regular users can only see logs about themselves
CREATE POLICY "Users see own audit logs" ON audit_logs FOR SELECT
  USING (actor_id = auth.uid());

-- Admins can see all audit logs (via service role)

-- ============================================================================
-- NOTIFICACIONES POLICIES
-- ============================================================================

-- Users can only see their own notifications
CREATE POLICY "Users see own notifications" ON notificaciones FOR SELECT
  USING (usuario_id = auth.uid());

-- Users can only update their own notifications (mark as read)
CREATE POLICY "Users update own notifications" ON notificaciones FOR UPDATE
  USING (usuario_id = auth.uid());

-- ============================================================================
-- WEBHOOK POLICIES
-- ============================================================================

-- Webhooks are not accessible from client (no SELECT policy)
-- Only backend (service role) can read/write webhooks

-- ============================================================================
-- SAMPLE DATA (for testing - remove in production)
-- ============================================================================

-- Insert test plan
INSERT INTO planes (nombre, descripcion, precio_cop, frecuencia, duracion_dias)
VALUES ('Mensual ViveroOnline', 'Plan mensual', 160000, 'mensual', 30)
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO planes (nombre, descripcion, precio_cop, frecuencia, duracion_dias)
VALUES ('Trimestral ViveroOnline', 'Plan trimestral', 450000, 'trimestral', 90)
ON CONFLICT (nombre) DO NOTHING;
