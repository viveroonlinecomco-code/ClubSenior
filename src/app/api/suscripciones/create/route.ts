// src/app/api/suscripciones/create/route.ts
// ============================================================================
// ENDPOINT: POST /api/suscripciones/create
// Crear suscripción + contrato automático + notificaciones
// ============================================================================

import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { validateInput, validateUserExists } from '@/lib/validators'
import { handleError, createAuthError, createValidationError, APIError, ErrorCodes } from '@/lib/api-error'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  const context = 'POST /api/suscripciones/create'

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
    console.log(`[${context}] Request body:`, {
      sponsor_id: body.sponsor_id?.substring(0, 8),
      participante_id: body.participante_id?.substring(0, 8),
      condominio_id: body.condominio_id?.substring(0, 8),
      plan_id: body.plan_id,
    })

    // ========================================================================
    // 2️⃣ VALIDAR ENTRADA
    // ========================================================================
    const inputValidation = validateInput(body, [
      'sponsor_id',
      'participante_id',
      'condominio_id',
      'plan_id',
    ])
    if (!inputValidation.valid) {
      throw createValidationError(inputValidation.error!)
    }

    const { sponsor_id, participante_id, condominio_id, plan_id } = body

    // ========================================================================
    // 3️⃣ VALIDAR QUE SPONSOR EXISTE
    // ========================================================================
    const sponsorResult = await validateUserExists(supabase, sponsor_id)
    if (!sponsorResult.valid) {
      throw new APIError(
        'Sponsor not found',
        404,
        ErrorCodes.NOT_FOUND
      )
    }
    console.log(`[${context}] Sponsor validated: ${sponsor_id.substring(0, 8)}`)

    // ========================================================================
    // 4️⃣ VALIDAR QUE PARTICIPANT EXISTE
    // ========================================================================
    const participantResult = await validateUserExists(
      supabase,
      participante_id
    )
    if (!participantResult.valid) {
      throw new APIError(
        'Participant not found',
        404,
        ErrorCodes.NOT_FOUND
      )
    }
    console.log(`[${context}] Participant validated: ${participante_id.substring(0, 8)}`)

    // ========================================================================
    // 5️⃣ CREAR SUSCRIPCIÓN
    // ========================================================================
    const { data: suscripcion, error: suscripcionError } = await supabase
      .from('suscripciones')
      .insert({
        sponsor_id,
        participante_id,
        condominio_id,
        plan_id,
        estado: 'pendiente_contrato', // ← ESTADO INICIAL
        precio_mensual: 150000, // TODO: obtener de tabla planes
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
      })
      .select()
      .single()

    if (suscripcionError) {
      console.error(`[${context}] Subscription creation failed:`, suscripcionError)
      throw new APIError(
        'Failed to create subscription',
        500,
        ErrorCodes.INTERNAL_ERROR
      )
    }

    if (!suscripcion) {
      throw new APIError(
        'Subscription creation returned no data',
        500,
        ErrorCodes.INTERNAL_ERROR
      )
    }

    console.log(`[${context}] Subscription created: ${suscripcion.id.substring(0, 8)}`)

    // ========================================================================
    // 6️⃣ CREAR CONTRATO AUTOMÁTICAMENTE
    // ========================================================================
    const { data: contrato, error: contratoError } = await supabase
      .from('contratos')
      .insert({
        suscripcion_id: suscripcion.id, // ← FK CRÍTICA
        tipo: 'mandato',
        version: '1.0',
        titulo: 'Contrato de Mandato Comercial',
        descripcion: 'Términos y condiciones de ClubSenior',
        activo: true,
        aceptado: false,
      })
      .select()
      .single()

    if (contratoError) {
      console.error(`[${context}] Contract creation failed:`, contratoError)

      // ROLLBACK: Eliminar suscripción si contrato falla
      await supabase
        .from('suscripciones')
        .delete()
        .eq('id', suscripcion.id)

      throw new APIError(
        'Failed to create contract - subscription rolled back',
        500,
        ErrorCodes.INTERNAL_ERROR
      )
    }

    if (!contrato) {
      throw new APIError(
        'Contract creation returned no data',
        500,
        ErrorCodes.INTERNAL_ERROR
      )
    }

    console.log(`[${context}] Contract created: ${contrato.id.substring(0, 8)}`)

    // ========================================================================
    // 7️⃣ CREAR NOTIFICACIONES PARA AMBOS
    // ========================================================================
    const notificationInsert = [
      {
        usuario_id: sponsor_id,
        evento_tipo: 'firma_requerida',
        titulo: 'Tu firma requerida',
        mensaje: 'Por favor firma el contrato de mandato comercial para activar el plan',
        leida: false,
      },
      {
        usuario_id: participante_id,
        evento_tipo: 'firma_requerida',
        titulo: 'Tu firma requerida',
        mensaje: 'Por favor firma el contrato de mandato comercial para activar el plan',
        leida: false,
      },
    ]

    const { error: notificationError } = await supabase
      .from('notificaciones')
      .insert(notificationInsert)

    if (notificationError) {
      console.warn(`[${context}] Notification creation warning:`, notificationError)
      // NO es crítico - no hacer rollback
    } else {
      console.log(`[${context}] Notifications created for sponsor and participant`)
    }

    // ========================================================================
    // 8️⃣ RESPUESTA EXITOSA
    // ========================================================================
    const elapsedMs = Date.now() - startTime

    const response = {
      success: true,
      data: {
        suscripcion: {
          id: suscripcion.id,
          estado: suscripcion.estado,
          precio_mensual: suscripcion.precio_mensual,
          fecha_inicio: suscripcion.fecha_inicio,
          fecha_fin: suscripcion.fecha_fin,
        },
        contrato: {
          id: contrato.id,
          tipo: contrato.tipo,
          aceptado: contrato.aceptado,
        },
        nextStep: 'Ambas partes deben firmar el contrato',
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
// REQUEST/RESPONSE TYPES (para documentación)
// ============================================================================
/*
REQUEST BODY:
{
  "sponsor_id": "uuid-of-sponsor",      // Quien paga (mamá)
  "participante_id": "uuid-of-user",    // Quien usa (abuela)
  "condominio_id": "uuid-of-condominio",// Condominio donde está
  "plan_id": "uuid-or-number"           // Plan a comprar
}

RESPUESTA EXITOSA (201):
{
  "success": true,
  "data": {
    "suscripcion": {
      "id": "uuid",
      "estado": "pendiente_contrato",
      "precio_mensual": 150000,
      "fecha_inicio": "2026-09-12",
      "fecha_fin": "2026-10-12"
    },
    "contrato": {
      "id": "uuid",
      "tipo": "mandato",
      "aceptado": false
    },
    "nextStep": "Ambas partes deben firmar el contrato",
    "meta": {
      "timestamp": "2026-09-12T20:45:00Z",
      "elapsed_ms": 234
    }
  }
}

RESPUESTA: ENTRADA INVÁLIDA (400):
{
  "success": false,
  "error": "Missing required field: sponsor_id",
  "errorCode": "INVALID_INPUT",
  "timestamp": "2026-09-12T20:45:00Z"
}

RESPUESTA: USUARIO NO EXISTE (404):
{
  "success": false,
  "error": "Sponsor not found",
  "errorCode": "NOT_FOUND",
  "timestamp": "2026-09-12T20:45:00Z"
}

RESPUESTA: ERROR DE CONFLICTO (409):
{
  "success": false,
  "error": "Data conflict - record already exists or reference invalid",
  "errorCode": "CONFLICT",
  "timestamp": "2026-09-12T20:45:00Z"
}

RESPUESTA: ERROR DEL SERVIDOR (500):
{
  "success": false,
  "error": "Failed to create subscription",
  "errorCode": "INTERNAL_ERROR",
  "timestamp": "2026-09-12T20:45:00Z",
  "debug": "stack trace (solo en development)"
}
*/
