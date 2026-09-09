/**
 * Email notifications service
 * Sends emails for payment confirmations, etc.
 * 
 * Currently uses Resend (configured via RESEND_API_KEY)
 * Fallback to console logging for development
 */

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send payment confirmation email
 */
export async function sendPaymentConfirmationEmail(
  sponsorEmail: string,
  sponsorName: string,
  participantName: string,
  planName: string,
  amount: number,
  subscriptionId: string
): Promise<{ success: boolean; error?: string }> {
  const htmlContent = `
    <h2>¡Pago confirmado!</h2>
    <p>Hola ${sponsorName},</p>
    <p>Tu pago para ${participantName} ha sido confirmado exitosamente.</p>
    
    <h3>Detalles de tu suscripción:</h3>
    <ul>
      <li><strong>Plan:</strong> ${planName}</li>
      <li><strong>Monto:</strong> $${amount.toLocaleString('es-CO')} COP</li>
      <li><strong>ID de suscripción:</strong> ${subscriptionId}</li>
    </ul>
    
    <p>La primera sesión de ${participantName} comenzará dentro de 3 días.</p>
    <p>Recibirás un email con los detalles de hora y ubicación.</p>
    
    <p>Si tienes preguntas, contáctanos a info@tardesdecafe.com</p>
    
    <p>¡Bienvenido a Tardes de Café, Mente & Saberes!</p>
  `;

  return sendEmail({
    to: sponsorEmail,
    subject: '✓ Pago confirmado - Tardes de Café',
    html: htmlContent,
    text: `Pago confirmado para ${participantName}. Plan: ${planName}. Monto: $${amount}. ID: ${subscriptionId}`,
  });
}

/**
 * Send payment failed email
 */
export async function sendPaymentFailedEmail(
  sponsorEmail: string,
  sponsorName: string,
  participantName: string,
  retryUrl?: string
): Promise<{ success: boolean; error?: string }> {
  const htmlContent = `
    <h2>Tu pago no se pudo procesar</h2>
    <p>Hola ${sponsorName},</p>
    <p>Lamentablemente, tu pago para ${participantName} no pudo procesarse.</p>
    
    <p>Esto puede ser por:</p>
    <ul>
      <li>Fondos insuficientes</li>
      <li>Tarjeta expirada</li>
      <li>Límite de transacciones alcanzado</li>
    </ul>
    
    <p>Por favor, intenta nuevamente con otra tarjeta o banco.</p>
    
    ${
      retryUrl
        ? `<p><a href="${retryUrl}" style="background-color: #3B82F6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reintentar pago</a></p>`
        : ''
    }
    
    <p>Si el problema persiste, contáctanos a info@tardesdecafe.com</p>
  `;

  return sendEmail({
    to: sponsorEmail,
    subject: '⚠️ Tu pago no se pudo procesar - Tardes de Café',
    html: htmlContent,
  });
}

/**
 * Send session reminder email
 */
export async function sendSessionReminderEmail(
  sponsorEmail: string,
  sponsorName: string,
  participantName: string,
  sessionDate: string,
  sessionTime: string,
  location: string
): Promise<{ success: boolean; error?: string }> {
  const htmlContent = `
    <h2>Recordatorio de sesión</h2>
    <p>Hola ${sponsorName},</p>
    <p>Te recordamos que ${participantName} tiene su próxima sesión:</p>
    
    <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
      <p><strong>📅 Fecha:</strong> ${sessionDate}</p>
      <p><strong>🕐 Hora:</strong> ${sessionTime}</p>
      <p><strong>📍 Ubicación:</strong> ${location}</p>
    </div>
    
    <p>Por favor, asegúrate de que ${participantName} llegue a tiempo.</p>
    
    <p>¡Esperamos verte!</p>
  `;

  return sendEmail({
    to: sponsorEmail,
    subject: `📅 Recordatorio de sesión - ${participantName}`,
    html: htmlContent,
  });
}

/**
 * Generic email sender
 * Uses Resend API if configured, otherwise logs to console
 */
async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; error?: string }> {
  try {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      // Development mode - log to console
      console.log('[EMAIL NOTIFICATION]', {
        to: payload.to,
        subject: payload.subject,
        preview: payload.html.substring(0, 100) + '...',
      });

      return { success: true };
    }

    // Production mode - use Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Tardes de Café <noreply@tardesdecafe.com>',
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Resend API error:', error);
      return { success: false, error: 'Failed to send email' };
    }

    return { success: true };
  } catch (err) {
    console.error('Error sending email:', err);
    return { success: false, error: 'Error sending email' };
  }
}
