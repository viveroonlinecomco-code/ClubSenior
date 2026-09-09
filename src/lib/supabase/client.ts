/**
 * Client-side Supabase client
 * Uses PUBLISHABLE_KEY (safe for browser)
 * Handles authentication and realtime subscriptions
 */

import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'placeholder-key';

if (!supabaseUrl.startsWith('https://')) {
  console.warn('⚠️ Invalid Supabase URL during build. Runtime will fail if not configured.');
}

/**
 * Browser-safe Supabase client
 * Can only read/write data based on:
 * 1. Supabase Auth (JWT from session)
 * 2. Row Level Security (RLS) policies
 *
 * NEVER use for admin operations - use server.ts for that
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

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
