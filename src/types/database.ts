/**
 * Database types for "Tardes de Café, Mente & Saberes"
 * Auto-generated from PostgreSQL schema
 * Generated: 2026-09-07
 */

// ============================================================================
// AUTHENTICATION & PROFILES
// ============================================================================

export type Profile = {
  id: string; // UUID, FK auth.users
  email: string;
  phone: string | null;
  full_name: string;
  avatar_url: string | null;
  created_at: string; // ISO timestamp
  updated_at: string;
};

export type UserRole = 'sponsor' | 'participant' | 'admin' | 'facilitator';

// ============================================================================
// LOCATIONS & CONDOMINIOS
// ============================================================================

export type Condominio = {
  id: string; // UUID, PK
  nombre: string;
  ubicacion: string; // e.g., "Cajicá, Cundinamarca"
  ciudad: string;
  contacto_admin_nombre: string;
  contacto_admin_email: string;
  contacto_admin_phone: string;
  created_at: string;
  updated_at: string;
};

// ============================================================================
// RELATIONSHIPS
// ============================================================================

export type FamilyRelationship = {
  id: string; // UUID, PK
  sponsor_id: string; // FK profiles
  participante_id: string; // FK profiles
  parentesco: 'hijo' | 'hija' | 'nieto' | 'nieta' | 'otro'; // Relationship type
  es_pagador: boolean; // Is this sponsor the payment holder?
  created_at: string;
  updated_at: string;
};

// ============================================================================
// PARTICIPANTES
// ============================================================================

export type Participante = {
  id: string; // UUID, PK (same as profile.id)
  condominio_id: string; // FK condominios
  nombre: string;
  edad: number;
  genero: 'masculino' | 'femenino' | 'otro' | null;
  tiene_autonomia_motriz: boolean; // Required for participation
  notas: string | null; // Medical info, interests, etc
  created_at: string;
  updated_at: string;
};

// ============================================================================
// PLANES & PRICING
// ============================================================================

export type Plan = {
  id: string; // UUID, PK
  nombre: string;
  descripcion: string;
  precio_cop: number; // In cents (COP)
  frecuencia: 'mensual' | 'trimestral' | 'anual';
  duracion_dias: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
};

// ============================================================================
// SUSCRIPCIONES (STATE MACHINE)
// ============================================================================

export type SubscriptionState =
  | 'STARTED'
  | 'DATA_COMPLETED'
  | 'LEGAL_ACCEPTED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_APPROVED'
  | 'ACTIVE'
  | 'PAYMENT_FAILED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'SUSPENDED';

export type Suscripcion = {
  id: string; // UUID, PK
  participante_id: string; // FK participantes
  plan_id: string; // FK planes
  sponsor_id: string; // FK profiles (who's paying)
  estado: SubscriptionState;
  fecha_inicio: string; // ISO date (nullable)
  fecha_fin: string; // ISO date (nullable)
  fecha_cancelacion: string | null; // ISO date
  razon_cancelacion: string | null;
  created_at: string;
  updated_at: string;
};

// ============================================================================
// PAGOS (WOMPI)
// ============================================================================

export type PaymentStatus = 'PENDING' | 'APPROVED' | 'FAILED' | 'REFUNDED';

export type Pago = {
  id: string; // UUID, PK
  suscripcion_id: string; // FK suscripciones
  monto_cop: number; // In cents
  referencia_wompi: string; // Unique transaction ID from Wompi
  estado: PaymentStatus;
  metadata_wompi: Record<string, unknown> | null; // Full Wompi response
  intento_numero: number; // Retry count
  created_at: string;
  updated_at: string;
  processed_at: string | null; // When webhook was processed
};

// ============================================================================
// DOCUMENTOS LEGALES (VERSIONED)
// ============================================================================

export type TipoContrato =
  | 'TERMINOS_SERVICIO'
  | 'POLITICA_PRIVACIDAD'
  | 'AUTORIZACION_DATOS';

export type Contrato = {
  id: string; // UUID, PK
  tipo: TipoContrato;
  version: string; // "1.0", "1.1", "2.0"
  titulo: string;
  descripcion: string;
  storage_path: string; // Private bucket path
  hash_documento: string; // SHA256
  activo: boolean;
  created_at: string;
  updated_at: string;
};

// ============================================================================
// FIRMAS (AUDITABLE)
// ============================================================================

export type Firma = {
  id: string; // UUID, PK
  contrato_id: string; // FK contratos
  usuario_id: string; // FK profiles
  version_documento: string; // What version was signed
  hash_documento: string; // Verify integrity
  timestamp: string; // ISO timestamp
  ip_address: string | null;
  user_agent: string | null;
  otp_verificado: boolean; // Was OTP used?
  aceptado: boolean; // True if accepted, false if rejected
  created_at: string;
};

// ============================================================================
// ACTIVIDADES & ASISTENCIA
// ============================================================================

export type Actividad = {
  id: string; // UUID, PK
  condominio_id: string; // FK condominios
  titulo: string;
  descripcion: string;
  fecha: string; // ISO date
  hora_inicio: string; // HH:MM
  hora_fin: string; // HH:MM
  facilitador_id: string | null; // FK profiles
  modulo: string; // e.g., "mentoría_plateada", "cata_origen"
  created_at: string;
  updated_at: string;
};

export type Asistencia = {
  id: string; // UUID, PK
  actividad_id: string; // FK actividades
  participante_id: string; // FK participantes
  asistio: boolean;
  observaciones: string | null;
  created_at: string;
};

// ============================================================================
// REPORTES SEMANALES
// ============================================================================

export type ReporteSemanal = {
  id: string; // UUID, PK
  participante_id: string; // FK participantes
  semana_inicio: string; // ISO date (Monday)
  semana_fin: string; // ISO date (Sunday)
  actividades_realizadas: number;
  asistencias: number;
  inasistencias: number;
  observaciones: string | null;
  calificacion_general: number | null; // 1-5
  resumen: string; // AI-generated summary
  created_at: string;
};

// ============================================================================
// NOTIFICACIONES (ABSTRACTED)
// ============================================================================

export type TipoNotificacion =
  | 'EMAIL'
  | 'SMS'
  | 'WHATSAPP'
  | 'PUSH'
  | 'IN_APP';

export type Notificacion = {
  id: string; // UUID, PK
  usuario_id: string; // FK profiles
  tipo: TipoNotificacion;
  asunto: string;
  contenido: string;
  leida: boolean;
  enviada: boolean;
  fecha_envio: string | null; // ISO timestamp
  created_at: string;
};

// ============================================================================
// WEBHOOKS (IDEMPOTENCY)
// ============================================================================

export type WebhookEvent = {
  id: string; // UUID, PK
  proveedor: 'wompi' | 'twilio' | 'other'; // Source
  evento_id_externo: string; // External ID (Wompi event ID)
  evento_tipo: string; // e.g., "PAYMENT.APPROVED"
  payload: Record<string, unknown>; // Full webhook payload
  procesado: boolean;
  resultado: string | null; // Success/Error details
  error: string | null; // Error message if failed
  intento_numero: number; // Retry count
  fecha_procesamiento: string | null; // ISO timestamp
  created_at: string;
};

// ============================================================================
// AUDIT LOGGING
// ============================================================================

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'LEGAL_ACCEPTED'
  | 'SIGNATURE_CREATED'
  | 'PAYMENT_CREATED'
  | 'PAYMENT_APPROVED'
  | 'PAYMENT_FAILED'
  | 'SUBSCRIPTION_ACTIVATED'
  | 'SUBSCRIPTION_CANCELLED'
  | 'DOCUMENT_ACCESSED'
  | 'ADMIN_ACTION'
  | 'DATA_EXPORT'
  | 'PERMISSION_CHANGED';

export type ResourceType =
  | 'PROFILE'
  | 'PARTICIPANTE'
  | 'SUSCRIPCION'
  | 'PAGO'
  | 'CONTRATO'
  | 'FIRMA'
  | 'DOCUMENTO'
  | 'ACTIVIDAD'
  | 'ASISTENCIA'
  | 'USER';

export type AuditLog = {
  id: string; // UUID, PK
  actor_id: string | null; // FK profiles (who did it)
  accion: AuditAction;
  resource_type: ResourceType;
  resource_id: string;
  metadata: Record<string, unknown> | null; // {ip, user_agent, old_value, new_value}
  created_at: string;
};

// ============================================================================
// ENUM HELPERS
// ============================================================================

export const SUBSCRIPTION_STATES: SubscriptionState[] = [
  'STARTED',
  'DATA_COMPLETED',
  'LEGAL_ACCEPTED',
  'PAYMENT_PENDING',
  'PAYMENT_APPROVED',
  'ACTIVE',
  'PAYMENT_FAILED',
  'CANCELLED',
  'EXPIRED',
  'SUSPENDED',
];

export const PAYMENT_STATUSES: PaymentStatus[] = [
  'PENDING',
  'APPROVED',
  'FAILED',
  'REFUNDED',
];

export const AUDIT_ACTIONS: AuditAction[] = [
  'LOGIN',
  'LOGOUT',
  'LEGAL_ACCEPTED',
  'SIGNATURE_CREATED',
  'PAYMENT_CREATED',
  'PAYMENT_APPROVED',
  'PAYMENT_FAILED',
  'SUBSCRIPTION_ACTIVATED',
  'SUBSCRIPTION_CANCELLED',
  'DOCUMENT_ACCESSED',
  'ADMIN_ACTION',
  'DATA_EXPORT',
  'PERMISSION_CHANGED',
];
