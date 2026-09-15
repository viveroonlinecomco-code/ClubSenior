/**
 * Email notifications using Resend
 * Make sure to configure RESEND_API_KEY in environment variables
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const APP_URL = process.env.NEXT_PUBLIC_APP_URL;

if (!RESEND_API_KEY) {
  console.warn('⚠️ RESEND_API_KEY not configured - emails will not be sent');
}

/**
 * Send welcome email after signup
 */
export async function sendWelcomeEmail(email: string, fullName: string) {
  if (!RESEND_API_KEY) {
    console.warn('Email not sent: RESEND_API_KEY not configured');
    return { success: false, error: 'Email service not configured' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Grupo Plateado <servicioalcliente@tardesdelcafe.com>',
        to: email,
        subject: '¡Bienvenido a Grupo Plateado!',
        html: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"><h1 style="color: #2563eb;">¡Bienvenido a Grupo Plateado!</h1><p>Hola ${fullName},</p><p>Tu registro en Grupo Plateado ha sido completado exitosamente. Ahora puedes acceder a todas nuestras actividades y servicios.</p><h2 style="color: #1e40af; margin-top: 30px;">¿Qué viene ahora?</h2><ul style="line-height: 1.8;"><li>Explora nuestras actividades semanales</li><li>Conecta con otros miembros de la comunidad</li><li>Accede a reportes de progreso</li><li>Participa en talleres y charlas</li></ul><p style="margin-top: 30px;"><a href="${APP_URL}/familia" style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block;">Ir a mi Dashboard</a></p><hr style="margin: 40px 0; border: none; border-top: 1px solid #e5e7eb;"><p style="color: #666; font-size: 12px;">Si tienes preguntas, contáctanos: <a href="mailto:servicioalcliente@tardesdelcafe.com">servicioalcliente@tardesdelcafe.com</a></p></div>`,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Resend error:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Exception sending welcome email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmationEmail(
  email: string,
  fullName: string,
  monto: number,
  referencia: string,
  planNombre: string
) {
  if (!RESEND_API_KEY) return { success: false };

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Grupo Plateado <servicioalcliente@tardesdelcafe.com>',
        to: email,
        subject: '✅ Pago confirmado - Grupo Plateado',
        html: `<div style="font-family: Arial, sans-serif;"><h1 style="color: #16a34a;">✅ Pago Confirmado</h1><p>Tu pago de $${monto.toLocaleString('es-CO')} para ${planNombre} ha sido aprobado. Referencia: ${referencia}</p></div>`,
      }),
    });

    return { success: true };
  } catch (error: any) {
    console.error('Exception sending payment email:', error);
    return { success: false };
  }
}

/**
 * Send weekly report email
 */
export async function sendWeeklyReportEmail(
  email: string,
  fullName: string,
  nombreParticipante: string,
  resumen: string,
  calificacion: number
) {
  if (!RESEND_API_KEY) return { success: false };

  try {
    const stars = '⭐'.repeat(calificacion);

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Grupo Plateado <servicioalcliente@tardesdelcafe.com>',
        to: email,
        subject: `📊 Reporte Semanal de ${nombreParticipante}`,
        html: `<div style="font-family: Arial, sans-serif;"><h1>📊 Reporte Semanal</h1><p>${resumen}</p><p>Calificación: ${stars}</p></div>`,
      }),
    });

    return { success: true };
  } catch (error: any) {
    console.error('Exception sending report email:', error);
    return { success: false };
  }
}
