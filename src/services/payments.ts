/**
 * Payment service
 * Handles payment processing and subscription state transitions
 */

import { supabaseAdmin } from '@/lib/supabase/server';
import { createAuditLog, markWebhookProcessed } from '@/lib/supabase/server';
import { getPaymentStatus } from '@/lib/wompi';
import { sendPaymentConfirmationEmail, sendPaymentFailedEmail } from '@/services/notifications';

interface WompiWebhookData {
  id: string;
  status: 'APPROVED' | 'PENDING' | 'FAILED';
  reference: string;
  amount_in_cents: number;
}

/**
 * Process Wompi webhook event
 * Updates payment and subscription state atomically
 */
export async function processPaymentWebhook(
  webhookId: string,
  data: WompiWebhookData
): Promise<{ success: boolean; error?: string; subscription_id?: string }> {
  try {
    // 1. Check for duplicate webhook (idempotency)
    const { data: existingEvent, error: checkError } = await supabaseAdmin
      .from('webhook_events')
      .select('id, procesado')
      .eq('evento_id_externo', webhookId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 = not found (OK)
      return { success: false, error: 'Error checking webhook status' };
    }

    if (existingEvent) {
      if (existingEvent.procesado) {
        // Already processed - return success but don't reprocess
        console.log(`Webhook ${webhookId} already processed`);
        return { success: true };
      }
      // Webhook exists but not processed yet - continue processing
    }

    // 2. Record webhook event for idempotency
    const { error: recordError } = await supabaseAdmin
      .from('webhook_events')
      .insert({
        evento_id_externo: webhookId,
        tipo: 'WOMPI_PAYMENT',
        datos: data,
        procesado: false,
      });

    if (recordError) {
      console.error('Error recording webhook:', recordError);
      return { success: false, error: 'Error recording webhook' };
    }

    // 3. Find payment by reference
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('pagos')
      .select('id, suscripcion_id, estado, monto_cop')
      .eq('referencia_wompi', data.reference)
      .single();

    if (paymentError) {
      console.error('Payment not found:', paymentError);
      return { success: false, error: 'Payment not found' };
    }

    // 4. Get subscription to check current state
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('suscripciones')
      .select('id, estado, sponsor_id, participante_id')
      .eq('id', payment.suscripcion_id)
      .single();

    if (subError) {
      return { success: false, error: 'Subscription not found' };
    }

    // 5. Validate state transition
    if (subscription.estado !== 'PAYMENT_PENDING') {
      console.warn(
        `Invalid state transition: ${subscription.estado} → ${data.status}`
      );
      return { success: false, error: 'Invalid subscription state' };
    }

    // 6. Process payment based on Wompi status
    const paymentStatus = getPaymentStatus(data.status);

    if (paymentStatus === 'APPROVED') {
      // Update payment to APPROVED
      const { error: updatePaymentError } = await supabaseAdmin
        .from('pagos')
        .update({
          estado: 'APPROVED',
          referencia_wompi: data.reference,
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.id);

      if (updatePaymentError) {
        return { success: false, error: 'Error updating payment' };
      }

      // Update subscription to ACTIVE
      const { error: updateSubError } = await supabaseAdmin
        .from('suscripciones')
        .update({
          estado: 'ACTIVE',
          fecha_inicio: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', subscription.id);

      if (updateSubError) {
        return { success: false, error: 'Error updating subscription' };
      }

      // Audit log
      await createAuditLog(
        subscription.sponsor_id,
        'PAYMENT_APPROVED',
        'SUSCRIPCION',
        subscription.id,
        {
          payment_id: payment.id,
          amount: data.amount_in_cents / 100, // Convert to COP
          reference: data.reference,
        }
      );

      // Send confirmation email
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('email, full_name')
        .eq('id', subscription.sponsor_id)
        .single();

      const { data: participant } = await supabaseAdmin
        .from('participantes')
        .select('nombre')
        .eq('id', subscription.participante_id)
        .single();

      if (profile && participant) {
        await sendPaymentConfirmationEmail(
          profile.email,
          profile.full_name,
          participant.nombre,
          'Mensual', // Plan name - could be more dynamic
          data.amount_in_cents / 100,
          subscription.id
        );
      }
    } else if (paymentStatus === 'FAILED') {
      // Update payment to FAILED
      const { error: updatePaymentError } = await supabaseAdmin
        .from('pagos')
        .update({
          estado: 'FAILED',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.id);

      if (updatePaymentError) {
        return { success: false, error: 'Error updating payment' };
      }

      // Subscription stays in PAYMENT_PENDING (can retry)
      // Could also transition to CANCELLED after max retries

      // Audit log
      await createAuditLog(
        subscription.sponsor_id,
        'PAYMENT_FAILED',
        'SUSCRIPCION',
        subscription.id,
        {
          payment_id: payment.id,
          reference: data.reference,
        }
      );

      // Send failure email
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('email, full_name')
        .eq('id', subscription.sponsor_id)
        .single();

      const { data: participant } = await supabaseAdmin
        .from('participantes')
        .select('nombre')
        .eq('id', subscription.participante_id)
        .single();

      if (profile && participant) {
        const retryUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/retry-payment?subscription=${subscription.id}`;
        await sendPaymentFailedEmail(
          profile.email,
          profile.full_name,
          participant.nombre,
          retryUrl
        );
      }
    }

    // 7. Mark webhook as processed
    const { error: markError } = await markWebhookProcessed(
      webhookId,
      'APPROVED', // resultado
      paymentStatus === 'FAILED' ? 'Payment failed' : undefined
    );
    if (markError) {
      console.error('Error marking webhook processed:', markError);
      // Don't fail the request - webhook is already processed in DB
    }

    return {
      success: true,
      subscription_id: subscription.id,
    };
  } catch (err) {
    console.error('Error processing payment webhook:', err);
    return { success: false, error: 'Internal server error' };
  }
}

/**
 * Get payment status by subscription ID
 */
export async function getSubscriptionPaymentStatus(subscriptionId: string): Promise<{
  status: 'PENDING' | 'APPROVED' | 'FAILED' | 'UNKNOWN';
  payment_id?: string;
  reference?: string;
}> {
  try {
    const { data: payment, error } = await supabaseAdmin
      .from('pagos')
      .select('id, estado, referencia_wompi')
      .eq('suscripcion_id', subscriptionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      return { status: 'UNKNOWN' };
    }

    return {
      status: payment.estado as 'PENDING' | 'APPROVED' | 'FAILED',
      payment_id: payment.id,
      reference: payment.referencia_wompi,
    };
  } catch (err) {
    console.error('Error getting payment status:', err);
    return { status: 'UNKNOWN' };
  }
}

/**
 * Get subscription by payment reference
 */
export async function getSubscriptionByPaymentReference(reference: string): Promise<{
  subscription_id?: string;
  sponsor_id?: string;
} | null> {
  try {
    const { data: payment, error } = await supabaseAdmin
      .from('pagos')
      .select('suscripcion_id')
      .eq('referencia_wompi', reference)
      .single();

    if (error) {
      return null;
    }

    const { data: subscription, error: subError } = await supabaseAdmin
      .from('suscripciones')
      .select('id, sponsor_id')
      .eq('id', payment.suscripcion_id)
      .single();

    if (subError) {
      return null;
    }

    return {
      subscription_id: subscription.id,
      sponsor_id: subscription.sponsor_id,
    };
  } catch (err) {
    console.error('Error getting subscription:', err);
    return null;
  }
}
