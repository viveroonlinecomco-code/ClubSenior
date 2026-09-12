// src/app/api/firmas/firmar/route.ts
// ============================================================================
// ENDPOINT: POST /api/firmas/firmar
// Registrar firma de sponsor o participant
// Si ambos firmaron → cambiar estado a 'pendiente_pago'
// ============================================================================

import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { validateInput } from '@/lib/validators'
import { handleError, createValidationError, APIError, ErrorCodes } from '@/lib/api-error'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const context = 'POST /api/firmas/firmar'

  try {
    // ========================================================================
    // SETUP
    // ========================================================================
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [] } }
    )

    // ========================================================================
    // 1️⃣ PARSEAR BODY
    // ========================================================================
    const body = await request.json()
    console.log(`[${context}] Request:`, {
      contrato_id: body.contrato_id?.substring(0, 8),
      usuario_id: body.usuario_id?.substring(0, 8),
      rol_al_firmar: body.rol_al_firmar,
    })

    // ========================================================================
    // 2️⃣ VALIDAR ENTRADA
    // ========================================================================
    const inputValidation = validateInput(body, [
      'contrato_id',
      'usuario_id',
      'rol_al_firmar',
    ])
    if (!inputValidation.valid) {
      throw createValidationError(inputValidation.error!)
    }

    const { contrato_id, usuario_id, rol_al_firmar } = body

    // Validar que rol_al_firmar es válido
    if (!['sponsor', 'participant'].includes(rol_al_firmar)) {
      throw new APIError(
        'rol_al_firmar must be "sponsor" or "participant"',
        400,
        ErrorCodes.INVALID_INPUT
      )
    }

    // ========================================================================
    // 3️⃣ REGISTRAR FIRMA
    // ========================================================================
    const { data: firma, error: firmaError } = await supabase
      .from('firmas')
      .insert({
        contrato_id,
        usuario_id,
        rol_al_firmar,
        acepto_terminos: true,
        fecha_firma: new Date().toISOString(),
      })
      .select()
      .single()

    if (firmaError) {
      console.error(`[${context}] Firma creation failed:`, firmaError)
      throw new APIError(
        'Failed to register signature',
        500,
        ErrorCodes.INTERNAL_ERROR
      )
    }

    if (!firma) {
      throw new APIError(
        'Firma creation returned no data',
        500,
        ErrorCodes.INTERNAL_ERROR
      )
    }

    console.log(
      `[${context}] Firma registered: ${rol_al_firmar} - ${usuario_id.substring(0, 8)}`
    )

    // ========================================================================
    // 4️⃣ VERIFICAR SI AMBOS HAN FIRMADO
    // ========================================================================
    const { data: firmas, error: firmasError } = await supabase
      .from('firmas')
      .select('rol_al_firmar')
      .eq('contrato_id', contrato_id)

    if (firmasError) {
      console.error(`[${context}] Firmas query failed:`, firmasError)
      throw new APIError(
        'Failed to check signatures',
        500,
        ErrorCodes.INTERNAL_ERROR
      )
    }

    const sponsorFirmó = firmas?.some((f: any) => f.rol_al_firmar === 'sponsor')
    const participantFirmó = firmas?.some((f: any) => f.rol_al_firmar === 'participant')

    console.log(`[${context}] Signatures: sponsor=${sponsorFirmó}, participant=${participantFirmó}`)

    // ========================================================================
    // 5️⃣ SI AMBOS FIRMARON → CAMBIAR ESTADO A 'pendiente_pago'
    // ========================================================================
    let suscripcion = null

    if (sponsorFirmó && participantFirmó) {
      console.log(`[${context}] Both parties signed! Changing state to pendiente_pago`)

      // Obtener suscripcion_id del contrato
      const { data: contrato, error: contratoError } = await supabase
        .from('contratos')
        .select('suscripcion_id')
        .eq('id', contrato_id)
        .single()

      if (contratoError || !contrato) {
        console.error(`[${context}] Contrato query failed:`, contratoError)
        throw new APIError(
          'Contract not found',
          404,
          ErrorCodes.NOT_FOUND
        )
      }

      // Cambiar estado de suscripción
      const { data: updatedSuscripcion, error: updateError } = await supabase
        .from('suscripciones')
        .update({
          estado: 'pendiente_pago', // ← CAMBIO DE ESTADO CRÍTICO
        })
        .eq('id', contrato.suscripcion_id)
        .select()
        .single()

      if (updateError) {
        console.error(`[${context}] Suscripción update failed:`, updateError)
        throw new APIError(
          'Failed to update subscription state',
          500,
          ErrorCodes.INTERNAL_ERROR
        )
      }

      suscripcion = updatedSuscripcion

      console.log(`[${context}] Subscription state changed to pendiente_pago`)

      // ========================================================================
      // 6️⃣ CREAR NOTIFICACIÓN PARA PAGO
      // ========================================================================
      // Solo notificar al sponsor (quien paga)
      const { error: notificationError } = await supabase
        .from('notificaciones')
        .insert({
          usuario_id: updatedSuscripcion.sponsor_id,
          evento_tipo: 'pago_requerido',
          titulo: 'Proceder al pago',
          mensaje:
            'Ambas partes han firmado el contrato. Ahora completa el pago para activar el plan.',
          leida: false,
        })

      if (notificationError) {
        console.warn(`[${context}] Notification creation warning:`, notificationError)
        // NO es crítico - no hacer rollback
      } else {
        console.log(
          `[${context}] Payment notification sent to sponsor: ${updatedSuscripcion.sponsor_id.substring(0, 8)}`
        )
      }
    }

    // ========================================================================
    // 7️⃣ RESPUESTA
    // ========================================================================
    const elapsedMs = Date.now() - startTime

    const response = {
      success: true,
      data: {
        firma: {
          id: firma.id,
          usuario_id: firma.usuario_id,
          rol_al_firmar: firma.rol_al_firmar,
          fecha_firma: firma.fecha_firma,
        },
        signatures: {
          sponsor_signed: sponsorFirmó,
          participant_signed: participantFirmó,
          both_signed: sponsorFirmó && participantFirmó,
        },
        state_change: sponsorFirmó && participantFirmó
          ? {
              from: 'pendiente_contrato',
              to: 'pendiente_pago',
              reason: 'Both parties signed',
            }
          : null,
        nextStep: sponsorFirmó && participantFirmó
          ? 'Proceed to payment'
          : 'Waiting for other party to sign',
        suscripcion: suscripcion ? {
          id: suscripcion.id,
          estado: suscripcion.estado,
        } : null,
        meta: {
          timestamp: new Date().toISOString(),
          elapsed_ms: elapsedMs,
        },
      },
    }

    console.log(`[${context}] Success in ${elapsedMs}ms`)

    return NextResponse.json(response, { status: 201 })

    // ========================================================================
    // ERROR HANDLING
    // ========================================================================
  } catch (error: any) {
    const { statusCode, body } = handleError(error, context)
    console.error(`[${context}] Final status: ${statusCode}`, body)
    return NextResponse.json(body, { status: statusCode })
  }
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================
/*
REQUEST BODY:
{
  "contrato_id": "uuid",           // ID del contrato a firmar
  "usuario_id": "uuid",            // Quien firma
  "rol_al_firmar": "sponsor"       // "sponsor" o "participant"
}

RESPUESTA EXITOSA - ESPERANDO OTRA FIRMA (201):
{
  "success": true,
  "data": {
    "firma": {
      "id": "uuid",
      "usuario_id": "uuid",
      "rol_al_firmar": "sponsor",
      "fecha_firma": "2026-09-12T21:00:00Z"
    },
    "signatures": {
      "sponsor_signed": true,
      "participant_signed": false,
      "both_signed": false
    },
    "state_change": null,
    "nextStep": "Waiting for other party to sign",
    "suscripcion": null,
    "meta": {
      "timestamp": "2026-09-12T21:00:00Z",
      "elapsed_ms": 234
    }
  }
}

RESPUESTA EXITOSA - AMBOS FIRMARON (201):
{
  "success": true,
  "data": {
    "firma": {
      "id": "uuid",
      "usuario_id": "uuid",
      "rol_al_firmar": "participant",
      "fecha_firma": "2026-09-12T21:05:00Z"
    },
    "signatures": {
      "sponsor_signed": true,
      "participant_signed": true,
      "both_signed": true
    },
    "state_change": {
      "from": "pendiente_contrato",
      "to": "pendiente_pago",
      "reason": "Both parties signed"
    },
    "nextStep": "Proceed to payment",
    "suscripcion": {
      "id": "uuid",
      "estado": "pendiente_pago"
    },
    "meta": {
      "timestamp": "2026-09-12T21:05:00Z",
      "elapsed_ms": 345
    }
  }
}

RESPUESTA: ENTRADA INVÁLIDA (400):
{
  "success": false,
  "error": "rol_al_firmar must be \"sponsor\" or \"participant\"",
  "errorCode": "INVALID_INPUT",
  "timestamp": "2026-09-12T21:00:00Z"
}

RESPUESTA: CONTRATO NO EXISTE (404):
{
  "success": false,
  "error": "Contract not found",
  "errorCode": "NOT_FOUND",
  "timestamp": "2026-09-12T21:00:00Z"
}
*/
