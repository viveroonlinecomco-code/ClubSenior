// src/lib/validators.ts
// ============================================================================
// VALIDADORES REUTILIZABLES PARA TODOS LOS ENDPOINTS
// Importar en cualquier ruta: import { validateUserExists, ... } from '@/lib/validators'
// ============================================================================

export type ValidatorResult = {
  valid: boolean
  error?: string
  data?: any
}

// ============================================================================
// 1. VALIDAR QUE USUARIO EXISTE
// ============================================================================
export async function validateUserExists(
  supabase: any,
  userId: string
): Promise<ValidatorResult> {
  if (!userId) {
    return { valid: false, error: 'User ID required' }
  }

  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('id, condominio_id')
    .eq('id', userId)
    .single()

  if (error || !usuario) {
    return { valid: false, error: 'User not found' }
  }

  return { valid: true, data: usuario }
}

// ============================================================================
// 2. ✅ CRÍTICO: VALIDAR QUE SUSCRIPCIÓN ESTÁ ACTIVA
// ============================================================================
// REGLA INMUTABLE: Usuario SOLO ve actividades si estado = 'activa'
export async function validateSubscriptionActive(
  supabase: any,
  userId: string
): Promise<ValidatorResult> {
  const { data: suscripcion, error } = await supabase
    .from('suscripciones')
    .select('*')
    .or(`sponsor_id.eq.${userId},participante_id.eq.${userId}`)
    .eq('estado', 'activa') // ← CRÍTICO: SOLO 'activa'
    .gte('fecha_fin', new Date())
    .lte('fecha_inicio', new Date())
    .single()

  if (error || !suscripcion) {
    return {
      valid: false,
      error: 'No active subscription - upgrade to view activities',
    }
  }

  return { valid: true, data: suscripcion }
}

// ============================================================================
// 3. VALIDAR QUE AMBOS HAN FIRMADO
// ============================================================================
export async function validateBothSigned(
  supabase: any,
  suscripcionId: string
): Promise<ValidatorResult> {
  const { data: contrato, error: contratoError } = await supabase
    .from('contratos')
    .select('id, firmas(*)')
    .eq('suscripcion_id', suscripcionId)
    .single()

  if (contratoError || !contrato) {
    return { valid: false, error: 'Contract not found' }
  }

  if (!contrato.firmas || contrato.firmas.length < 2) {
    return {
      valid: false,
      error: 'Both parties must sign - awaiting signatures',
    }
  }

  const hasSponsor = contrato.firmas.some(
    (f: any) => f.rol_al_firmar === 'sponsor'
  )
  const hasParticipant = contrato.firmas.some(
    (f: any) => f.rol_al_firmar === 'participant'
  )

  if (!hasSponsor || !hasParticipant) {
    return {
      valid: false,
      error: 'Sponsor and participant must both sign',
    }
  }

  return { valid: true, data: contrato }
}

// ============================================================================
// 4. VALIDAR QUE ENTRADA ES VÁLIDA
// ============================================================================
export function validateInput(
  data: any,
  requiredFields: string[]
): ValidatorResult {
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null) {
      return {
        valid: false,
        error: `Missing required field: ${field}`,
      }
    }
  }

  return { valid: true }
}

// ============================================================================
// 5. VALIDAR FORMATO UUID
// ============================================================================
export function validateUUID(uuid: string): ValidatorResult {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

  if (!uuidRegex.test(uuid)) {
    return { valid: false, error: 'Invalid UUID format' }
  }

  return { valid: true }
}
