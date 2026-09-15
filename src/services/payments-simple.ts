/**
 * Payment processing service
 * Handles Wompi webhook events and updates subscription state
 */

interface WompiPaymentData {
  id: string;
  reference: string;
  amount_in_cents: number;
  status: 'APPROVED' | 'PENDING' | 'FAILED';
  status_message: string;
  created_at: string;
  payment_method: {
    type: string;
  };
  merchant: {
    id: string;
  };
}

interface ProcessResult {
  success: boolean;
  subscription_id?: string;
  error?: string;
}

export async function processPaymentWebhook(
  eventId: string,
  paymentData: WompiPaymentData
): Promise<ProcessResult> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const resendKey = process.env.RESEND_API_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[PAYMENT] Missing Supabase config');
      return { success: false, error: 'Server configuration error' };
    }

    console.log('[PAYMENT] Processing webhook:', {
      eventId,
      reference: paymentData.reference,
      status: paymentData.status,
    });

    // 1. Check for duplicate (idempotency)
    const checkResponse = await fetch(
      `${supabaseUrl}/rest/v1/pagos?wompi_id=eq.${encodeURIComponent(paymentData.id)}&select=id`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const existingPagos = await checkResponse.json();
    if (Array.isArray(existingPagos) && existingPagos.length > 0) {
      console.log('[PAYMENT] Payment already processed:', paymentData.id);
      return { success: true };
    }

    // 2. Parse reference to get subscription_id
    // Reference format: "{suscripcion_id}-{timestamp}"
    const refParts = paymentData.reference.split('-');
    if (refParts.length < 1) {
      console.error('[PAYMENT] Invalid reference format:', paymentData.reference);
      return { success: false, error: 'Invalid reference format' };
    }

    const subscriptionId = refParts[0];

    // 3. Create payment record
    const pagoRecord = {
      wompi_id: paymentData.id,
      suscripcion_id: subscriptionId,
      monto_cop: Math.round(paymentData.amount_in_cents / 100),
      estado: paymentData.status,
      metodo_pago: paymentData.payment_method.type,
      referencia_wompi: paymentData.reference,
      respuesta_wompi: JSON.stringify(paymentData),
    };

    const createResponse = await fetch(`${supabaseUrl}/rest/v1/pagos`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pagoRecord),
    });

    if (!createResponse.ok) {
      const error = await createResponse.text();
      console.error('[PAYMENT] Failed to create record:', error);
      return { success: false, error: 'Failed to create payment record' };
    }

    console.log('[PAYMENT] Record created:', paymentData.id);

    // 4. Update subscription based on payment status
    if (paymentData.status === 'APPROVED') {
      // Activate subscription
      const updateResponse = await fetch(
        `${supabaseUrl}/rest/v1/suscripciones?id=eq.${encodeURIComponent(subscriptionId)}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            estado: 'ACTIVE',
          }),
        }
      );

      if (!updateResponse.ok) {
        console.error('[PAYMENT] Failed to activate subscription');
        return { success: false, error: 'Failed to activate subscription' };
      }

      console.log('[PAYMENT] ✅ Subscription ACTIVE:', subscriptionId);

      // Send confirmation email
      if (resendKey) {
        try {
          await sendPaymentConfirmationEmail(resendKey, subscriptionId, paymentData);
        } catch (err) {
          console.error('[PAYMENT] Email error (non-critical):', err);
        }
      }

      return { success: true, subscription_id: subscriptionId };
    } else if (paymentData.status === 'FAILED') {
      // Mark as failed
      const updateResponse = await fetch(
        `${supabaseUrl}/rest/v1/suscripciones?id=eq.${encodeURIComponent(subscriptionId)}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            estado: 'PAYMENT_FAILED',
          }),
        }
      );

      console.log('[PAYMENT] ❌ Subscription PAYMENT_FAILED:', subscriptionId);
      return { success: true, subscription_id: subscriptionId };
    } else {
      // PENDING or other
      console.log('[PAYMENT] ⏳ Subscription status PENDING:', subscriptionId);
      return { success: true, subscription_id: subscriptionId };
    }
  } catch (error: any) {
    console.error('[PAYMENT] Error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send payment confirmation email
 */
async function sendPaymentConfirmationEmail(
  resendKey: string,
  subscriptionId: string,
  paymentData: WompiPaymentData
) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase config');
  }

  // Get user email from subscription
  const subsResponse = await fetch(
    `${supabaseUrl}/rest/v1/suscripciones?id=eq.${encodeURIComponent(subscriptionId)}&select=usuario_id`,
    {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    }
  );

  const suscripciones = await subsResponse.json();
  if (!Array.isArray(suscripciones) || suscripciones.length === 0) {
    throw new Error('Subscription not found');
  }

  const usuarioId = suscripciones[0].usuario_id;

  const userResponse = await fetch(
    `${supabaseUrl}/rest/v1/usuarios?id=eq.${encodeURIComponent(usuarioId)}&select=email`,
    {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    }
  );

  const usuarios = await userResponse.json();
  if (!Array.isArray(usuarios) || usuarios.length === 0) {
    throw new Error('User not found');
  }

  const email = usuarios[0].email;

  // Send via Resend
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Grupo Plateado <noreply@resend.dev>',
      to: email,
      subject: '✅ Pago Confirmado - Grupo Plateado',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0;">
            <h1 style="margin: 0; font-size: 24px;">✅ ¡Pago Confirmado!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
            <p style="font-size: 16px; color: #374151;">Hola,</p>
            
            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              Tu pago ha sido procesado exitosamente. Tu suscripción ya está activa.
            </p>

            <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2563eb;">
              <p style="margin: 10px 0; font-size: 14px;"><strong>Referencia:</strong> ${paymentData.reference}</p>
              <p style="margin: 10px 0; font-size: 14px;"><strong>Monto:</strong> $${(paymentData.amount_in_cents / 100).toLocaleString('es-CO')}</p>
              <p style="margin: 10px 0; font-size: 14px;"><strong>Método:</strong> ${paymentData.payment_method.type}</p>
              <p style="margin: 10px 0; font-size: 14px;"><strong>Fecha:</strong> ${new Date(paymentData.created_at).toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <p style="font-size: 16px; color: #374151; line-height: 1.6;">
              Puedes acceder a tu dashboard en cualquier momento para ver tus participantes, 
              reportes semanales y más.
            </p>

            <p style="font-size: 16px; color: #374151; line-height: 1.6; margin-top: 20px;">
              ¡Gracias por ser parte de <strong>Grupo Plateado</strong>!
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
            
            <p style="font-size: 12px; color: #6b7280; text-align: center;">
              Grupo Plateado - Tardes de Café, Mente & Saberes<br>
              Conectando generaciones, creando comunidad
            </p>
          </div>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend error: ${response.status}`);
  }

  console.log('[EMAIL] ✅ Confirmation sent to:', email);
}
