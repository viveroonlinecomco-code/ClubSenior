// src/app/api/actividades/proximas/route.ts
// ============================================================================
// ENDPOINT: GET /api/actividades/proximas
// ✅ Con validaciones completas + error handling
// ============================================================================

import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import {
  validateUserExists,
  validateSubscriptionActive,
  validateBothSigned,
} from '@/lib/validators'

export async function GET(request: NextRequest) {
  const startTime = Date.now()

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
    // 1️⃣ OBTENER USER ID (de header)
    // ========================================================================
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'x-user-id header required',
        },
        { status: 401 }
      )
    }

    // ========================================================================
    // 2️⃣ VALIDAR QUE USUARIO EXISTE
    // ========================================================================
    const userResult = await validateUserExists(supabase, userId)
    if (!userResult.valid) {
      console.warn(`[Actividades] User not found: ${userId}`)
      return NextResponse.json(
        {
          error: 'Not Found',
          message: userResult.error,
        },
        { status: 404 }
      )
    }
    const usuario = userResult.data

    // ========================================================================
    // 3️⃣ ✅ CRÍTICO: VALIDAR SUSCRIPCIÓN ACTIVA
    // ========================================================================
    // REGLA INMUTABLE: Si estado != 'activa' → BLOQUEAR
    const subscResult = await validateSubscriptionActive(supabase, userId)
    if (!subscResult.valid) {
      console.warn(
        `[Actividades] No active subscription for user: ${userId}`,
        subscResult.error
      )
      return NextResponse.json(
        {
          error: 'Subscription Required',
          message: subscResult.error,
          requiresAction: 'upgrade_plan',
        },
        { status: 403 } // Forbidden, no 404
      )
    }
    const suscripcion = subscResult.data

    // ========================================================================
    // 4️⃣ VALIDAR QUE AMBOS HAN FIRMADO
    // ========================================================================
    const signResult = await validateBothSigned(
      supabase,
      suscripcion.id
    )
    if (!signResult.valid) {
      console.warn(
        `[Actividades] Contract not signed: ${suscripcion.id}`,
        signResult.error
      )
      return NextResponse.json(
        {
          error: 'Signing Required',
          message: signResult.error,
          requiresAction: 'sign_contract',
        },
        { status: 403 }
      )
    }

    // ========================================================================
    // 5️⃣ OBTENER ACTIVIDADES (filtradas por condominio)
    // ========================================================================
    const { data: actividades, error: actividadesError } = await supabase
      .from('actividades')
      .select(
        `
        id,
        titulo,
        descripcion,
        fecha,
        hora_inicio,
        hora_fin,
        modulo,
        condominio_id,
        created_at
        `
      )
      .eq('condominio_id', suscripcion.condominio_id)
      .gte('fecha', new Date().toISOString().split('T')[0]) // Hoy en adelante
      .order('fecha', { ascending: true })

    if (actividadesError) {
      console.error('[Actividades] Database error:', actividadesError)
      return NextResponse.json(
        {
          error: 'Database Error',
          message: 'Failed to fetch activities',
        },
        { status: 500 }
      )
    }

    // ========================================================================
    // 6️⃣ ARMAR RESPUESTA
    // ========================================================================
    const elapsedMs = Date.now() - startTime

    const response = {
      success: true,
      data: {
        condominio_id: suscripcion.condominio_id,
        suscripcion: {
          id: suscripcion.id,
          estado: suscripcion.estado,
          fecha_inicio: suscripcion.fecha_inicio,
          fecha_fin: suscripcion.fecha_fin,
        },
        actividades: actividades || [],
        meta: {
          count: (actividades || []).length,
          timestamp: new Date().toISOString(),
          elapsed_ms: elapsedMs,
        },
      },
    }

    console.log(
      `[Actividades] Success: ${(actividades || []).length} activities for user ${userId}`
    )

    return NextResponse.json(response, { status: 200 })
  } catch (error: any) {
    // ========================================================================
    // ERROR HANDLING
    // ========================================================================
    console.error('[Actividades] Unhandled error:', error)

    return NextResponse.json(
      {
        error: 'Internal Server Error',
        message: error.message || 'An unexpected error occurred',
        debug: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    )
  }
}

// ============================================================================
// RESPONSE TYPES (para documentación)
// ============================================================================
/*
RESPUESTA EXITOSA (200):
{
  "success": true,
  "data": {
    "condominio_id": "uuid",
    "suscripcion": {
      "id": "uuid",
      "estado": "activa",
      "fecha_inicio": "2026-09-12",
      "fecha_fin": "2026-10-12"
    },
    "actividades": [
      {
        "id": "uuid",
        "titulo": "Movimiento Vital",
        "fecha": "2026-09-12",
        "hora_inicio": "14:30",
        "modulo": "fisica"
      }
    ],
    "meta": {
      "count": 8,
      "timestamp": "2026-09-12T20:30:00Z",
      "elapsed_ms": 145
    }
  }
}

RESPUESTA: NO ESTÁ ACTIVO (403):
{
  "error": "Subscription Required",
  "message": "No active subscription - upgrade to view activities",
  "requiresAction": "upgrade_plan"
}

RESPUESTA: NO HA FIRMADO (403):
{
  "error": "Signing Required",
  "message": "Both parties must sign - awaiting signatures",
  "requiresAction": "sign_contract"
}

RESPUESTA: USUARIO NO EXISTE (404):
{
  "error": "Not Found",
  "message": "User not found"
}

RESPUESTA: ERROR (500):
{
  "error": "Internal Server Error",
  "message": "Database error or unhandled exception",
  "debug": "stack trace (solo en development)"
}
*/
