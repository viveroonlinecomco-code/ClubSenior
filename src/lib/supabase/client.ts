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
  return supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  });
}

/**
 * Verify OTP and get session
 */
export async function verifyOtp(email: string, token: string) {
  return supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });
}

/**
 * Sign out current user
 */
export async function signOut() {
  return supabase.auth.signOut();
}

/**
 * Get current session
 */
export async function getSession() {
  return supabase.auth.getSession();
}

/**
 * Get current user
 */
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Subscribe to auth state changes
 */
export function onAuthStateChange(
  callback: (event: string, session: unknown) => void
) {
  return supabase.auth.onAuthStateChange((event, session) => {
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
