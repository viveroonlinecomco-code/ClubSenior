// src/app/api/webhooks/wompi/route.ts
// ============================================================================
// WEBHOOK: POST /api/webhooks/wompi
// Recibir eventos de Wompi (pagos aprobados, fallidos)
// Actualizar estado de suscripción
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import crypto from 'crypto'

// ============================================================================
// VALIDAR FIRMA WOMPI
// ============================================================================
function validateWompiSignature(
  payload: string,
  signature: string
): boolean {
  // TODO: En producción, usar WOMPI_WEBHOOK_SECRET del env
  // Por ahora asumimos que Wompi envía eventos válidos

  // const secret = process.env.WOMPI_WEBHOOK_SECRET
  // if (!secret) {
  //   console.warn('[Wompi Webhook] WOMPI_WEBHOOK_SECRET no configurado')
  //   return false
  // }

  // const hash = crypto
  //   .createHmac('sha256', secret)
  //   .update(payload)
  //   .digest('hex')

  // return hash === signature

  // PARA DESARROLLO: aceptar todos (comentar en producción)
  console.log('[Wompi Webhook] Signature validation skipped (development)')
  return true
}

export async function POST(request: NextRequest) {
  const context = 'POST /api/webhooks/wompi'
  const startTime = Date.now()

  try {
    // ========================================================================
    // 1️⃣ OBTENER PAYLOAD
    // ========================================================================
    const rawBody = await request.text()
    const signature = request.headers.get('x-wompi-signature') || ''

    console.log(`[${context}] Webhook received`, {
      signature: signature.substring(0, 10),
      size: rawBody.length,
    })

    // ========================================================================
    // 2️⃣ VALIDAR FIRMA
    // ========================================================================
    if (!validateWompiSignature(rawBody, signature)) {
      console.warn(`[${context}] Invalid signature`)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // ========================================================================
    // 3️⃣ PARSEAR EVENTO
    // ========================================================================
    const event = JSON.parse(rawBody)
    console.log(`[${context}] Event type:`, event.event)

    // ========================================================================
    // 4️⃣ SETUP SUPABASE
    // ========================================================================
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [] } }
    )

    // ========================================================================
    // 5️⃣ PROCESAR EVENTOS
    // ========================================================================
    // EVENTO: transaction.approved
    if (event.event === 'transaction.approved') {
      console.log(`[${context}] Processing: transaction.approved`)

      const { data: transactionData } = event

      // transactionData.reference es nuestro suscripcion_id (lo pasamos al crear pago)
      const suscripcion_id = transactionData.reference

      if (!suscripcion_id) {
        console.warn(`[${context}] No reference in approved transaction`)
        return NextResponse.json(
          { success: false, message: 'No reference' },
          { status: 400 }
        )
      }

      // Actualizar suscripción a 'activa'
      const { data: suscripcion, error: updateError } = await supabase
        .from('suscripciones')
        .update({
          estado: 'activa', // ← PAGO COMPLETADO = ACTIVA
          fecha_primer_pago: new Date().toISOString(),
        })
        .eq('id', suscripcion_id)
        .select()
        .single()

      if (updateError) {
        console.error(`[${context}] Update failed:`, updateError)
        return NextResponse.json(
          { success: false, message: 'Update failed' },
          { status: 500 }
        )
      }

      console.log(`[${context}] Suscripción activated: ${suscripcion_id.substring(0, 8)}`)

      // Crear notificación para ambos
      await supabase.from('notificaciones').insert([
        {
          usuario_id: suscripcion.sponsor_id,
          evento_tipo: 'pago_completado',
          titulo: 'Plan activado ✅',
          mensaje: 'Tu pago fue procesado exitosamente. ¡Plan activado!',
          leida: false,
        },
        {
          usuario_id: suscripcion.participante_id,
          evento_tipo: 'pago_completado',
          titulo: 'Plan activado ✅',
          mensaje: 'El plan ha sido activado. ¡Ya puedes acceder a las actividades!',
          leida: false,
        },
      ])

      console.log(`[${context}] Notifications sent`)

      return NextResponse.json(
        { success: true, message: 'Subscription activated' },
        { status: 200 }
      )
    }

    // EVENTO: transaction.failed
    if (event.event === 'transaction.failed') {
      console.log(`[${context}] Processing: transaction.failed`)

      const { data: transactionData } = event
      const suscripcion_id = transactionData.reference

      if (!suscripcion_id) {
        console.warn(`[${context}] No reference in failed transaction`)
        return NextResponse.json(
          { success: false, message: 'No reference' },
          { status: 400 }
        )
      }

      // Cambiar estado a 'fallo_pago'
      const { data: suscripcion, error: updateError } = await supabase
        .from('suscripciones')
        .update({
          estado: 'fallo_pago', // ← PAGO FALLIDO
        })
        .eq('id', suscripcion_id)
        .select()
        .single()

      if (updateError) {
        console.error(`[${context}] Update failed:`, updateError)
        return NextResponse.json(
          { success: false, message: 'Update failed' },
          { status: 500 }
        )
      }

      console.log(`[${context}] Suscripción marked as fallo_pago: ${suscripcion_id.substring(0, 8)}`)

      // Notificar sponsor del fallo
      await supabase.from('notificaciones').insert({
        usuario_id: suscripcion.sponsor_id,
        evento_tipo: 'pago_fallido',
        titulo: 'Pago rechazado ❌',
        mensaje: `El pago no pudo ser procesado. Intenta con otro método o contacta soporte.`,
        leida: false,
      })

      return NextResponse.json(
        { success: true, message: 'Subscription marked as payment failed' },
        { status: 200 }
      )
    }

    // EVENTO: transaction.declined
    if (event.event === 'transaction.declined') {
      console.log(`[${context}] Processing: transaction.declined`)

      const { data: transactionData } = event
      const suscripcion_id = transactionData.reference

      if (!suscripcion_id) {
        console.warn(`[${context}] No reference in declined transaction`)
        return NextResponse.json(
          { success: false, message: 'No reference' },
          { status: 400 }
        )
      }

      // Similar a failed
      const { data: suscripcion, error: updateError } = await supabase
        .from('suscripciones')
        .update({
          estado: 'fallo_pago',
        })
        .eq('id', suscripcion_id)
        .select()
        .single()

      if (updateError) {
        console.error(`[${context}] Update failed:`, updateError)
        return NextResponse.json(
          { success: false, message: 'Update failed' },
          { status: 500 }
        )
      }

      console.log(`[${context}] Suscripción marked as fallo_pago: ${suscripcion_id.substring(0, 8)}`)

      await supabase.from('notificaciones').insert({
        usuario_id: suscripcion.sponsor_id,
        evento_tipo: 'pago_rechazado',
        titulo: 'Transacción rechazada ⚠️',
        mensaje: `Tu banco rechazó la transacción. Verifica los datos e intenta nuevamente.`,
        leida: false,
      })

      return NextResponse.json(
        { success: true, message: 'Subscription marked as declined' },
        { status: 200 }
      )
    }

    // ========================================================================
    // EVENTO DESCONOCIDO
    // ========================================================================
    console.warn(`[${context}] Unknown event type: ${event.event}`)
    return NextResponse.json(
      { success: false, message: 'Unknown event type' },
      { status: 400 }
    )
  } catch (error: any) {
    console.error(`[${context}] Error:`, error.message)
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}

// ============================================================================
// WEBHOOK EVENTOS ESPERADOS
// ============================================================================
/*
EVENTO: transaction.approved
{
  "event": "transaction.approved",
  "data": {
    "id": "wompi-transaction-id",
    "reference": "suscripcion-uuid",  ← Nuestro suscripcion_id
    "amount": 150000,
    "status": "APPROVED",
    ...
  }
}

EVENTO: transaction.failed
{
  "event": "transaction.failed",
  "data": {
    "reference": "suscripcion-uuid",
    ...
  }
}

EVENTO: transaction.declined
{
  "event": "transaction.declined",
  "data": {
    "reference": "suscripcion-uuid",
    ...
  }
}

ACCIONES EN CADA CASO:
approved  → estado='activa' + notificaciones ✅
failed    → estado='fallo_pago' + notificación ❌
declined  → estado='fallo_pago' + notificación ⚠️
*/
