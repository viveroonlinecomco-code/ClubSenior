import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import crypto from 'crypto'

function validateWompiSignature(
  payload: string,
  signature: string
): boolean {
  console.log('[Wompi Webhook] Signature validation skipped (development)')
  return true
}

export async function POST(request: NextRequest) {
  const context = 'POST /api/webhooks/wompi'
  const startTime = Date.now()

  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-wompi-signature') || ''

    console.log(`[${context}] Webhook received`, {
      signature: signature.substring(0, 10),
      size: rawBody.length,
    })

    if (!validateWompiSignature(rawBody, signature)) {
      console.warn(`[${context}] Invalid signature`)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const event = JSON.parse(rawBody)
    console.log(`[${context}] Event type:`, event.event)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [] } }
    )

    const externalId = event.data?.id
    if (!externalId) {
      console.warn(`[${context}] No transaction ID`)
      return NextResponse.json(
        { error: 'No transaction ID' },
        { status: 400 }
      )
    }

    const { data: existingLog } = await supabase
      .from('webhook_logs')
      .select('id, processed')
      .eq('external_id', externalId)
      .limit(1)

    if (existingLog && existingLog.length > 0) {
      console.log(`[${context}] Already processed (idempotent): ${externalId.substring(0, 8)}`)
      return NextResponse.json(
        { success: true, message: 'Webhook already processed' },
        { status: 200 }
      )
    }

    if (event.event === 'transaction.approved') {
      console.log(`[${context}] Processing: transaction.approved`)

      const { data: transactionData } = event
      const suscripcion_id = transactionData.reference

      if (!suscripcion_id) {
        console.warn(`[${context}] No reference in approved transaction`)
        
        await supabase.from('webhook_logs').insert({
          webhook_source: 'wompi',
          webhook_event_type: event.event,
          external_id: externalId,
          payload: event,
          processed: false,
          error_message: 'No suscripcion reference',
        })

        return NextResponse.json(
          { success: false, message: 'No reference' },
          { status: 400 }
        )
      }

      const { data: suscripcion, error: updateError } = await supabase
        .from('suscripciones')
        .update({
          estado: 'activa',
          fecha_primer_pago: new Date().toISOString(),
        })
        .eq('id', suscripcion_id)
        .select()
        .single()

      if (updateError) {
        console.error(`[${context}] Update failed:`, updateError)
        
        await supabase.from('webhook_logs').insert({
          webhook_source: 'wompi',
          webhook_event_type: event.event,
          external_id: externalId,
          payload: event,
          processed: false,
          error_message: updateError.message,
        })

        return NextResponse.json(
          { success: false, message: 'Update failed' },
          { status: 500 }
        )
      }

      console.log(`[${context}] Suscripcion activated: ${suscripcion_id.substring(0, 8)}`)

      await supabase.from('notificaciones').insert([
        {
          usuario_id: suscripcion.sponsor_id,
          evento_tipo: 'pago_completado',
          titulo: 'Plan activado',
          mensaje: 'Tu pago fue procesado exitosamente. Plan activado.',
          leida: false,
        },
        {
          usuario_id: suscripcion.participante_id,
          evento_tipo: 'pago_completado',
          titulo: 'Plan activado',
          mensaje: 'El plan ha sido activado. Ya puedes acceder a las actividades.',
          leida: false,
        },
      ])

      await supabase.from('webhook_logs').insert({
        webhook_source: 'wompi',
        webhook_event_type: event.event,
        external_id: externalId,
        payload: event,
        processed: true,
        processed_at: new Date().toISOString(),
        processor_function: 'POST /api/webhooks/wompi',
      })

      console.log(`[${context}] Notifications sent, webhook logged`)

      return NextResponse.json(
        { success: true, message: 'Subscription activated' },
        { status: 200 }
      )
    }

    if (event.event === 'transaction.failed') {
      console.log(`[${context}] Processing: transaction.failed`)

      const { data: transactionData } = event
      const suscripcion_id = transactionData.reference

      if (!suscripcion_id) {
        console.warn(`[${context}] No reference in failed transaction`)
        
        await supabase.from('webhook_logs').insert({
          webhook_source: 'wompi',
          webhook_event_type: event.event,
          external_id: externalId,
          payload: event,
          processed: false,
          error_message: 'No suscripcion reference',
        })

        return NextResponse.json(
          { success: false, message: 'No reference' },
          { status: 400 }
        )
      }

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
        
        await supabase.from('webhook_logs').insert({
          webhook_source: 'wompi',
          webhook_event_type: event.event,
          external_id: externalId,
          payload: event,
          processed: false,
          error_message: updateError.message,
        })

        return NextResponse.json(
          { success: false, message: 'Update failed' },
          { status: 500 }
        )
      }

      console.log(`[${context}] Suscripcion marked as fallo_pago: ${suscripcion_id.substring(0, 8)}`)

      await supabase.from('notificaciones').insert({
        usuario_id: suscripcion.sponsor_id,
        evento_tipo: 'pago_fallido',
        titulo: 'Pago rechazado',
        mensaje: 'El pago no pudo ser procesado. Intenta con otro metodo o contacta soporte.',
        leida: false,
      })

      await supabase.from('webhook_logs').insert({
        webhook_source: 'wompi',
        webhook_event_type: event.event,
        external_id: externalId,
        payload: event,
        processed: true,
        processed_at: new Date().toISOString(),
        processor_function: 'POST /api/webhooks/wompi',
      })

      return NextResponse.json(
        { success: true, message: 'Subscription marked as payment failed' },
        { status: 200 }
      )
    }

    if (event.event === 'transaction.declined') {
      console.log(`[${context}] Processing: transaction.declined`)

      const { data: transactionData } = event
      const suscripcion_id = transactionData.reference

      if (!suscripcion_id) {
        console.warn(`[${context}] No reference in declined transaction`)
        
        await supabase.from('webhook_logs').insert({
          webhook_source: 'wompi',
          webhook_event_type: event.event,
          external_id: externalId,
          payload: event,
          processed: false,
          error_message: 'No suscripcion reference',
        })

        return NextResponse.json(
          { success: false, message: 'No reference' },
          { status: 400 }
        )
      }

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
        
        await supabase.from('webhook_logs').insert({
          webhook_source: 'wompi',
          webhook_event_type: event.event,
          external_id: externalId,
          payload: event,
          processed: false,
          error_message: updateError.message,
        })

        return NextResponse.json(
          { success: false, message: 'Update failed' },
          { status: 500 }
        )
      }

      console.log(`[${context}] Suscripcion marked as fallo_pago: ${suscripcion_id.substring(0, 8)}`)

      await supabase.from('notificaciones').insert({
        usuario_id: suscripcion.sponsor_id,
        evento_tipo: 'pago_rechazado',
        titulo: 'Transaccion rechazada',
        mensaje: 'Tu banco rechazo la transaccion. Verifica los datos e intenta nuevamente.',
        leida: false,
      })

      await supabase.from('webhook_logs').insert({
        webhook_source: 'wompi',
        webhook_event_type: event.event,
        external_id: externalId,
        payload: event,
        processed: true,
        processed_at: new Date().toISOString(),
        processor_function: 'POST /api/webhooks/wompi',
      })

      return NextResponse.json(
        { success: true, message: 'Subscription marked as declined' },
        { status: 200 }
      )
    }

    console.warn(`[${context}] Unknown event type: ${event.event}`)
    
    await supabase.from('webhook_logs').insert({
      webhook_source: 'wompi',
      webhook_event_type: event.event,
      external_id: externalId,
      payload: event,
      processed: false,
      error_message: 'Unknown event type',
    })

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
