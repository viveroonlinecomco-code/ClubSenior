-- TABLA FACILITADORES
-- Almacena información de facilitadores por condominio

CREATE TABLE IF NOT EXISTS facilitadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  nombre TEXT NOT NULL,
  condominio_id UUID NOT NULL REFERENCES condominios(id),
  rol TEXT DEFAULT 'FACILITADOR' CHECK (rol IN ('FACILITADOR', 'DIRECTOR', 'ADMIN')),
  estado TEXT DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO', 'SUSPENDIDO')),
  telefono TEXT,
  especialidades TEXT, -- JSON array de especialidades
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- TABLA AUDIT_LOG
-- Registra todas las acciones críticas del sistema

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID,
  usuario_email TEXT,
  usuario_tipo TEXT CHECK (usuario_tipo IN ('FAMILIA', 'FACILITADOR', 'ADMIN')),
  accion TEXT NOT NULL,
  tabla_afectada TEXT,
  registro_id UUID,
  datos_previos JSONB,
  datos_nuevos JSONB,
  ip_address TEXT,
  user_agent TEXT,
  resultado TEXT CHECK (resultado IN ('EXITOSO', 'ERROR', 'RECHAZADO')),
  detalles TEXT,
  created_at TIMESTAMP DEFAULT now()
);

-- INDEXES para performance
CREATE INDEX idx_facilitadores_condominio ON facilitadores(condominio_id);
CREATE INDEX idx_facilitadores_email ON facilitadores(email);
CREATE INDEX idx_audit_log_usuario ON audit_log(usuario_id);
CREATE INDEX idx_audit_log_fecha ON audit_log(created_at);
CREATE INDEX idx_audit_log_tabla ON audit_log(tabla_afectada);

-- RLS POLICIES - FACILITADORES

-- Política 1: Facilitador solo ve su propio perfil
CREATE POLICY "Facilitador lee su propio perfil"
  ON facilitadores
  FOR SELECT
  USING (
    id = (
      SELECT id FROM facilitadores 
      WHERE email = current_setting('request.jwt.claims', true)::jsonb->>'email'
      LIMIT 1
    )
    OR current_setting('request.jwt.claims', true)::jsonb->>'role' = 'ADMIN'
  );

-- Política 2: Admin ve todos los facilitadores de su condominio
CREATE POLICY "Admin ve facilitadores de su condominio"
  ON facilitadores
  FOR SELECT
  USING (
    condominio_id = (
      SELECT condominio_id FROM facilitadores 
      WHERE email = current_setting('request.jwt.claims', true)::jsonb->>'email'
      LIMIT 1
    )
  );

-- Política 3: Facilitador actualiza solo su propio perfil
CREATE POLICY "Facilitador actualiza su propio perfil"
  ON facilitadores
  FOR UPDATE
  USING (
    id = (
      SELECT id FROM facilitadores 
      WHERE email = current_setting('request.jwt.claims', true)::jsonb->>'email'
      LIMIT 1
    )
  );

-- RLS POLICIES - ACTIVIDADES (restricción por condominio)

-- Política 1: Facilitador ve solo actividades de su condominio
CREATE POLICY "Facilitador ve actividades de su condominio"
  ON actividades
  FOR SELECT
  USING (
    condominio_id = (
      SELECT condominio_id FROM facilitadores 
      WHERE email = current_setting('request.jwt.claims', true)::jsonb->>'email'
      LIMIT 1
    )
    OR current_setting('request.jwt.claims', true)::jsonb->>'role' = 'ADMIN'
  );

-- Política 2: Facilitador crea actividades en su condominio
CREATE POLICY "Facilitador crea actividades en su condominio"
  ON actividades
  FOR INSERT
  WITH CHECK (
    condominio_id = (
      SELECT condominio_id FROM facilitadores 
      WHERE email = current_setting('request.jwt.claims', true)::jsonb->>'email'
      LIMIT 1
    )
  );

-- Política 3: Facilitador actualiza solo actividades de su condominio
CREATE POLICY "Facilitador actualiza actividades de su condominio"
  ON actividades
  FOR UPDATE
  USING (
    condominio_id = (
      SELECT condominio_id FROM facilitadores 
      WHERE email = current_setting('request.jwt.claims', true)::jsonb->>'email'
      LIMIT 1
    )
  );

-- RLS POLICIES - ASISTENCIAS

-- Política 1: Facilitador ve asistencias de su condominio
CREATE POLICY "Facilitador ve asistencias de su condominio"
  ON asistencias
  FOR SELECT
  USING (
    actividad_id IN (
      SELECT id FROM actividades 
      WHERE condominio_id = (
        SELECT condominio_id FROM facilitadores 
        WHERE email = current_setting('request.jwt.claims', true)::jsonb->>'email'
        LIMIT 1
      )
    )
  );

-- Política 2: Facilitador registra asistencias en su condominio
CREATE POLICY "Facilitador registra asistencias en su condominio"
  ON asistencias
  FOR INSERT
  WITH CHECK (
    actividad_id IN (
      SELECT id FROM actividades 
      WHERE condominio_id = (
        SELECT condominio_id FROM facilitadores 
        WHERE email = current_setting('request.jwt.claims', true)::jsonb->>'email'
        LIMIT 1
      )
    )
  );

-- Política 3: Facilitador actualiza asistencias de su condominio
CREATE POLICY "Facilitador actualiza asistencias de su condominio"
  ON asistencias
  FOR UPDATE
  USING (
    actividad_id IN (
      SELECT id FROM actividades 
      WHERE condominio_id = (
        SELECT condominio_id FROM facilitadores 
        WHERE email = current_setting('request.jwt.claims', true)::jsonb->>'email'
        LIMIT 1
      )
    )
  );

-- RLS POLICIES - PARTICIPANTES (solo lectura para facilitador)

-- Política 1: Facilitador ve participantes de su condominio
CREATE POLICY "Facilitador ve participantes de su condominio"
  ON participantes
  FOR SELECT
  USING (
    condominio_id = (
      SELECT condominio_id FROM facilitadores 
      WHERE email = current_setting('request.jwt.claims', true)::jsonb->>'email'
      LIMIT 1
    )
  );

-- RLS POLICIES - AUDIT_LOG (solo insertar, nunca eliminar)

-- Política 1: Cualquier usuario puede insertar en audit_log
CREATE POLICY "Cualquiera puede registrar auditoría"
  ON audit_log
  FOR INSERT
  WITH CHECK (true);

-- Política 2: Solo ADMIN puede leer audit_log
CREATE POLICY "Solo admin lee audit_log"
  ON audit_log
  FOR SELECT
  USING (
    current_setting('request.jwt.claims', true)::jsonb->>'role' = 'ADMIN'
  );

-- Política 3: Nunca permitir DELETE en audit_log
CREATE POLICY "Nunca eliminar audit_log"
  ON audit_log
  FOR DELETE
  USING (false);
