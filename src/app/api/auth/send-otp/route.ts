import { NextRequest, NextResponse } from 'next/server';
import { validateCSRFToken } from '@/lib/middleware/csrf';
import { checkRateLimit } from '@/lib/middleware';
import { z } from 'zod';

/**
 * Generate a random 6-digit OTP code
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Save OTP to Supabase
 */
async function saveOTPCode(email: string, code: string) {
  try {
    // Delete previous codes for this email
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase not configured');
    }

    // First, delete old codes
    await fetch(`${supabaseUrl}/rest/v1/otp_codes?email=eq.${encodeURIComponent(email)}`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
    });

    // Insert new code (expires in 10 minutes)
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const response = await fetch(`${supabaseUrl}/rest/v1/otp_codes`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({
        email,
        code,
        expires_at: expiresAt,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to save OTP: ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error('Error saving OTP:', error);
    throw error;
  }
}

/**
 * Send OTP email using Resend API directly
 */
async function sendOTPEmail(email: string, code: string) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const verifiedEmail = 'viveroonline.com.co@gmail.com'; // Email verificado en Resend
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured');
    }

    // In testing/development: send to verified email, but mention the recipient
    // In production: would send to the actual recipient after domain verification
    const sendToEmail = email; // Ideally would send to this
    const fallbackEmail = verifiedEmail; // But Resend requires verified email in testing

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'OTP <otp@tardesdelcafe.com>',
        to: email, // Send to the user's email
        subject: 'Tu Código de Verificación - ClubSenior',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e40af; margin-bottom: 20px;">Código de Verificación</h2>
            
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Hemos recibido una solicitud para verificar tu correo electrónico en ClubSenior.
            </p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
              <p style="font-size: 14px; color: #666; margin: 0 0 10px 0;">Tu código de verificación es:</p>
              <p style="font-size: 36px; font-weight: bold; color: #1e40af; letter-spacing: 5px; margin: 0;">
                ${code}
              </p>
              <p style="font-size: 12px; color: #999; margin: 10px 0 0 0;">Este código expira en 10 minutos</p>
            </div>
            
            <p style="font-size: 14px; color: #666; margin-bottom: 20px;">
              Si no solicitaste este código, puedes ignorar este mensaje.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <p style="font-size: 12px; color: #999; margin: 0;">
              ClubSenior - Tardes de Café, Mente & Saberes<br>
              Conectando generaciones, creando comunidad
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Resend error: ${error.message || response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
}

// ✅ FIX #5: Validación de payload con Zod
const SendOTPSchema = z.object({
  email: z.string().email('Email inválido'),
})

/**
 * POST /api/auth/send-otp
 * Generate and send OTP code to email
 * ✅ FIX #5: Con rate limiting
 */
export async function POST(request: NextRequest) {
  const context = '[POST /api/auth/send-otp]'
  
  try {
    // CSRF Protection: Validate request origin
    const csrfError = await validateCSRFToken(request);
    if (csrfError) {
      return csrfError;
    }

    const body = await request.json();

    // ✅ FIX #5: Validar con Zod
    let validatedData
    try {
      validatedData = SendOTPSchema.parse(body)
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Invalid email format',
            errors: error.issues 
          },
          { status: 400 }
        )
      }
      throw error
    }

    const email = validatedData.email.toLowerCase();

    // ✅ FIX #5: RATE LIMITING por email
    const rateLimitKey = `otp:send:${email}`
    const { allowed, remaining } = checkRateLimit(rateLimitKey)

    if (!allowed) {
      console.warn(`${context} Rate limit exceeded for ${email}`)
      return NextResponse.json(
        {
          success: false,
          error: 'Demasiados intentos. Por favor, intenta de nuevo más tarde.',
          retryAfter: 60,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Remaining': '0',
          }
        }
      )
    }

    console.log(`${context} Email: ${email}, Remaining attempts: ${remaining}`)

    // Generate OTP code
    const code = generateOTP();
    console.log(`Generated OTP for ${email}: ${code}`);

    // Save to database
    await saveOTPCode(email, code);
    console.log(`Saved OTP to database for ${email}`);

    // Send email
    const emailResult = await sendOTPEmail(email, code);
    console.log(`Sent OTP email to ${email}`);

    return NextResponse.json({
      success: true,
      message: 'Código enviado exitosamente a ' + email,
      email,
    });
  } catch (error: any) {
    console.error(`${context} Error:`, error);
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Error sending OTP',
      },
      { status: 500 }
    );
  }
}
