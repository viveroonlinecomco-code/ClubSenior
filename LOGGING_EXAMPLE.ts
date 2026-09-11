// Example: src/app/api/auth/send-otp/route-with-logging.ts
// This shows how to integrate logging into existing endpoints

import { NextRequest, NextResponse } from 'next/server';
import { createLogger } from '@/lib/logger';
import { logAuthAction, logEmailSent, logRateLimitCheck } from '@/lib/loggers';
import { checkRateLimit } from '@/lib/middleware/rate-limit';
import { SendOTPSchema } from '@/lib/validation/schemas';

const authLogger = createLogger('AUTH-SEND-OTP');

/**
 * POST /api/auth/send-otp
 * Send OTP code to user email
 *
 * @param request - Next.js request object
 * @returns JSON response with success status
 *
 * Logging points:
 * - Request received
 * - Rate limit check
 * - Validation result
 * - Email sent/failed
 * - Response sent
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const clientIp = request.headers.get('x-forwarded-for') || 'unknown';

  try {
    authLogger.info({ ip: clientIp }, 'OTP send request received');

    // Parse request body
    const body = await request.json();
    const { email } = body;

    // Check rate limiting
    const rateLimitKey = `otp:send:${email}`;
    const allowed = checkRateLimit(rateLimitKey, 3, 900); // 3 attempts per 15 minutes

    logRateLimitCheck({
      key: rateLimitKey,
      attempts: 1,
      limit: 3,
      blocked: !allowed,
      ip: clientIp,
    });

    if (!allowed) {
      authLogger.warn({ email, ip: clientIp }, 'Rate limit exceeded for OTP send');

      return NextResponse.json(
        { error: 'Too many attempts. Please try again later.' },
        { status: 429, headers: { 'Retry-After': '900' } }
      );
    }

    // Validate input
    const validation = SendOTPSchema.safeParse({ email });

    if (!validation.success) {
      authLogger.warn(
        {
          email,
          errors: validation.error.flatten().fieldErrors,
          ip: clientIp,
        },
        'Invalid email format for OTP'
      );

      logAuthAction({
        email,
        action: 'OTP_SEND',
        success: false,
        error: 'Invalid email format',
        duration: Date.now() - startTime,
      });

      return NextResponse.json(
        {
          error: 'Invalid email format',
          fields: validation.error.flatten().fieldErrors,
        },
        { status: 422 }
      );
    }

    // Generate OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    authLogger.debug({ email, code: otpCode.substring(0, 3) + '***' }, 'OTP code generated');

    // Store OTP in database
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase not configured');
    }

    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const otpResponse = await fetch(`${supabaseUrl}/rest/v1/otp_codes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        email,
        code: otpCode,
        expires_at: expiresAt.toISOString(),
      }),
    });

    if (!otpResponse.ok) {
      throw new Error('Failed to store OTP in database');
    }

    authLogger.debug({ email }, 'OTP stored in database');

    // Send email via Resend
    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'ClubSenior <noreply@clubsenior.com.co>',
        to: email,
        subject: `Tu código de verificación: ${otpCode}`,
        html: `
          <h1>ClubSenior</h1>
          <p>Tu código de verificación es: <strong>${otpCode}</strong></p>
          <p>Este código expira en 10 minutos.</p>
        `,
      }),
    });

    const emailSuccess = resendResponse.ok;

    logEmailSent({
      to: email,
      subject: 'Código de verificación ClubSenior',
      template: 'otp-verification',
      success: emailSuccess,
      provider: 'resend',
      error: emailSuccess ? undefined : await resendResponse.text(),
    });

    if (!emailSuccess) {
      throw new Error('Failed to send email');
    }

    authLogger.info({ email, duration: Date.now() - startTime }, 'OTP sent successfully');

    logAuthAction({
      email,
      action: 'OTP_SEND',
      success: true,
      duration: Date.now() - startTime,
    });

    return NextResponse.json({
      success: true,
      message: 'OTP sent to your email',
      // In development only, return code for testing
      ...(process.env.NODE_ENV === 'development' && { code: otpCode }),
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;

    authLogger.error(
      {
        error: error.message,
        stack: error.stack,
        ip: clientIp,
        duration,
      },
      'Error sending OTP'
    );

    logAuthAction({
      email: body?.email || 'unknown',
      action: 'OTP_SEND',
      success: false,
      error: error.message,
      duration,
    });

    return NextResponse.json(
      { error: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}
