/**
 * Client-side Supabase client
 * Uses PUBLISHABLE_KEY (safe for browser)
 * Handles authentication and realtime subscriptions
 */

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let supabase: any = null;

// Only initialize if we have valid credentials
if (supabaseUrl && supabaseUrl.startsWith('https://') && supabaseAnonKey) {
  supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
} else {
  // Return a dummy object that will fail gracefully if used
  if (typeof window !== 'undefined') {
    console.warn('⚠️ Supabase credentials not configured. Auth features will not work.');
  }
  
  supabase = {
    auth: {
      signInWithOtp: () => Promise.reject(new Error('Supabase not configured')),
      verifyOtp: () => Promise.reject(new Error('Supabase not configured')),
      signOut: () => Promise.reject(new Error('Supabase not configured')),
      getUser: () => Promise.reject(new Error('Supabase not configured')),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => {
      throw new Error('Supabase not configured');
    },
  };
}

export { supabase };

/**
 * Sign in with email (passwordless OTP)
 */
export async function signInWithEmail(email: string) {
  if (!supabase?.auth?.signInWithOtp) {
    return {
      error: {
        message: 'Email verification not available. Please try again in a moment.',
        status: 500,
      },
      data: null,
    };
  }
  
  try {
    return await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });
  } catch (error: any) {
    return {
      error: {
        message: error?.message || 'Error sending verification code. Please try again.',
        status: 500,
      },
      data: null,
    };
  }
}

/**
 * Verify OTP and get session
 */
export async function verifyOtp(email: string, token: string) {
  if (!supabase?.auth?.verifyOtp) {
    return {
      error: {
        message: 'Verification not available. Please try again in a moment.',
        status: 500,
      },
      data: null,
    };
  }

  try {
    return await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
  } catch (error: any) {
    return {
      error: {
        message: error?.message || 'Invalid verification code. Please try again.',
        status: 500,
      },
      data: null,
    };
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  if (!supabase?.auth?.signOut) {
    return { error: null };
  }

  try {
    return await supabase.auth.signOut();
  } catch (error) {
    return { error: null };
  }
}

/**
 * Get current session
 */
export async function getSession() {
  if (!supabase?.auth?.getSession) {
    return {
      data: { session: null },
      error: null,
    };
  }

  try {
    return await supabase.auth.getSession();
  } catch (error) {
    return {
      data: { session: null },
      error: null,
    };
  }
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  if (!supabase?.auth?.getUser) {
    return null;
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    return null;
  }
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: unknown) => void
) {
  return supabase.auth.onAuthStateChange((event: string, session: unknown) => {
    callback(event, session);
  });
}

/**
 * Realtime subscription helper
 * Example: subscribeToSuscripcion(suscripcion_id, (payload) => {...})
 */
export function subscribeToTable(
  table: string,
  filter: { column: string; value: string },
  callback: (payload: Record<string, unknown>) => void
) {
  return supabase
    .channel(`${table}-${filter.value}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table,
        filter: `${filter.column}=eq.${filter.value}`,
      },
      callback
    )
    .subscribe();
}

export default supabase;
