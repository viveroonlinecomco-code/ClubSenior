/**
 * Onboarding service
 * Handles signup flow: data collection, legal acceptance, payment initiation
 */

import { supabaseAdmin } from '@/lib/supabase/server';
import { createAuditLog } from '@/lib/supabase/server';
import {
  OnboardingStep1Input,
  OnboardingStep2Input,
  OnboardingStep3Input,
} from '@/schemas';

/**
 * Step 1: Create subscription and collect data
 */
export async function createSubscriptionDraft(
  data: OnboardingStep1Input,
  userId: string
) {
  try {
    // Create or update profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email: data.sponsor_email,
        phone: data.sponsor_phone,
        full_name: data.sponsor_full_name,
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      return { success: false, error: profileError.message };
    }

    // Create family relationship
    const { error: participanteError } = await supabaseAdmin
      .from('participantes')
      .insert({
        id: userId, // Participante uses same ID as their profile
        condominio_id: data.condominio_id,
        nombre: data.participante_nombre,
        edad: data.participante_edad,
        genero: data.participante_genero || null,
        tiene_autonomia_motriz: data.tiene_autonomia_motriz,
        notas: data.notas || null,
      });

    if (participanteError) {
      return { success: false, error: participanteError.message };
    }

    // Create family relationship
    const { error: relationshipError } = await supabaseAdmin
      .from('family_relationships')
      .insert({
        sponsor_id: userId,
        participante_id: userId, // For now, same person (can link to other profiles later)
        parentesco: data.parentesco,
        es_pagador: true,
      });

    if (relationshipError) {
      return { success: false, error: relationshipError.message };
    }

    // Create subscription in STARTED state
    const { data: subscriptionData, error: subscriptionError } =
      await supabaseAdmin
        .from('suscripciones')
        .insert({
          participante_id: userId,
          plan_id: (
            await supabaseAdmin
              .from('planes')
              .select('id')
              .eq('nombre', 'Mensual ViveroOnline')
              .single()
          ).data?.id,
          sponsor_id: userId,
          estado: 'DATA_COMPLETED',
        })
        .select()
        .single();

    if (subscriptionError) {
      return { success: false, error: subscriptionError.message };
    }

    // Audit log
    await createAuditLog(
      userId,
      'ONBOARDING_DATA_COMPLETED',
      'SUSCRIPCION',
      subscriptionData.id,
      { participante_nombre: data.participante_nombre }
    );

    return {
      success: true,
      subscription: subscriptionData,
    };
  } catch (err) {
    console.error('Error creating subscription:', err);
    return { success: false, error: 'Error desconocido' };
  }
}

/**
 * Step 2: Accept legal documents
 */
export async function acceptLegalDocuments(
  data: OnboardingStep2Input,
  userId: string
) {
  try {
    // Get active contract versions
    const { data: contracts, error: contractError } = await supabaseAdmin
      .from('contratos')
      .select('id, version, hash_documento')
      .in('id', data.contrato_ids)
      .eq('activo', true);

    if (contractError) {
      return { success: false, error: contractError.message };
    }

    // Create signatures for each contract
    for (const contract of contracts || []) {
      const { error: signError } = await supabaseAdmin
        .from('firmas')
        .insert({
          contrato_id: contract.id,
          usuario_id: userId,
          version_documento: contract.version,
          hash_documento: contract.hash_documento,
          timestamp: new Date().toISOString(),
          ip_address: data.ip_address || null,
          user_agent: data.user_agent || null,
          otp_verificado: true, // Because user came from OTP login
          aceptado: data.aceptado,
        });

      if (signError) {
        return { success: false, error: signError.message };
      }
    }

    // Update subscription state
    const { error: updateError } = await supabaseAdmin
      .from('suscripciones')
      .update({ estado: 'LEGAL_ACCEPTED' })
      .eq('sponsor_id', userId)
      .eq('estado', 'DATA_COMPLETED');

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Audit log
    await createAuditLog(
      userId,
      'LEGAL_ACCEPTED',
      'SUSCRIPCION',
      userId,
      { contracts_count: contracts?.length }
    );

    return { success: true };
  } catch (err) {
    console.error('Error accepting legal documents:', err);
    return { success: false, error: 'Error desconocido' };
  }
}

/**
 * Step 3: Create payment and transition to PAYMENT_PENDING
 */
export async function initiatePayment(
  data: OnboardingStep3Input,
  userId: string
) {
  try {
    // Get subscription
    const { data: subscription, error: subError } = await supabaseAdmin
      .from('suscripciones')
      .select('*')
      .eq('sponsor_id', userId)
      .eq('estado', 'LEGAL_ACCEPTED')
      .single();

    if (subError) {
      return { success: false, error: 'Suscripción no encontrada' };
    }

    // Create payment record
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from('pagos')
      .insert({
        suscripcion_id: subscription.id,
        monto_cop: data.monto_cop,
        referencia_wompi: `pago_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        estado: 'PENDING',
      })
      .select()
      .single();

    if (paymentError) {
      return { success: false, error: paymentError.message };
    }

    // Update subscription to PAYMENT_PENDING
    const { error: updateError } = await supabaseAdmin
      .from('suscripciones')
      .update({ estado: 'PAYMENT_PENDING' })
      .eq('id', subscription.id);

    if (updateError) {
      return { success: false, error: updateError.message };
    }

    // Audit log
    await createAuditLog(
      userId,
      'PAYMENT_INITIATED',
      'PAGO',
      payment.id,
      { monto: data.monto_cop, reference: payment.referencia_wompi }
    );

    return {
      success: true,
      payment,
      wompi_reference: payment.referencia_wompi,
    };
  } catch (err) {
    console.error('Error initiating payment:', err);
    return { success: false, error: 'Error desconocido' };
  }
}
