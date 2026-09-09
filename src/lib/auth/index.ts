/**
 * Authentication service
 * Handles email OTP (passwordless) flow
 */

import { supabase } from '@/lib/supabase/client';
import { createAuditLog } from '@/lib/supabase/server';

/**
 * Step 1: Send OTP to email
 */
export async function sendOTP(email: string) {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Audit log
    await createAuditLog(
      null, // No user yet (unauthenticated)
      'LOGIN_OTP_SENT',
      'USER',
      email,
      { email }
    );

    return {
      success: true,
      message: 'OTP enviado a tu email',
    };
  } catch (err) {
    console.error('Error sending OTP:', err);
    return { success: false, error: 'Error enviando OTP' };
  }
}

/**
 * Step 2: Verify OTP and get session
 */
export async function verifyOTP(email: string, token: string) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      // Audit log
      await createAuditLog(
        data.user.id,
        'LOGIN_OTP_VERIFIED',
        'USER',
        data.user.id,
        { email }
      );
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  } catch (err) {
    console.error('Error verifying OTP:', err);
    return { success: false, error: 'Error verificando OTP' };
  }
}

/**
 * Step 3: Get current user
 */
export async function getCurrentUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      return { user: null, error: error.message };
    }

    return { user, error: null };
  } catch (err) {
    console.error('Error getting current user:', err);
    return { user: null, error: 'Error obteniendo usuario' };
  }
}

/**
 * Step 4: Sign out
 */
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('Error signing out:', err);
    return { success: false, error: 'Error cerrando sesión' };
  }
}

/**
 * Get auth state change subscription
 */
export function onAuthStateChange(
  callback: (event: string, session: unknown) => void
) {
  return supabase.auth.onAuthStateChange((event: string, session: unknown) => {
    callback(event, session);
  });
}
