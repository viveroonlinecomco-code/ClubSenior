/**
 * Client-side Supabase client
 * Uses PUBLISHABLE_KEY (safe for browser)
 * Handles authentication and realtime subscriptions
 * 
 * IMPORTANT: Uses lazy initialization to avoid evaluating env vars at build time
 */

import { createBrowserClient } from '@supabase/ssr';

let supabase: any = null;
let initialized = false;

/**
 * Get or initialize Supabase client
 * Only evaluates env vars when first called (runtime, not build time)
 */
function getSupabaseClient() {
  if (initialized) {
    return supabase;
  }

  initialized = true;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Only initialize if we have valid credentials
  if (supabaseUrl && supabaseUrl.startsWith('https://') && supabaseAnonKey) {
    console.log('✅ Initializing Supabase client with credentials');
    supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
  } else {
    // Return a dummy object that will fail gracefully if used
    if (typeof window !== 'undefined') {
      console.warn('⚠️ Supabase credentials not configured:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseAnonKey,
        urlValid: supabaseUrl?.startsWith('https://'),
      });
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

  return supabase;
}

// Export lazy getter
export const supabase = new Proxy({} as any, {
  get: (target, prop) => {
    const client = getSupabaseClient();
    return client[prop];
  }
});

/**
 * Sign in with email (passwordless OTP)
 */
export async function signInWithEmail(email: string) {
  const client = getSupabaseClient();
  
  if (!client?.auth?.signInWithOtp) {
    return {
      error: {
        message: 'Email verification not available. Please try again in a moment.',
        status: 500,
      },
      data: null,
    };
  }
  
  try {
    return await client.auth.signInWithOtp({
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
  const client = getSupabaseClient();
  
  if (!client?.auth?.verifyOtp) {
    return {
      error: {
        message: 'Verification not available. Please try again in a moment.',
        status: 500,
      },
      data: null,
    };
  }

  try {
    return await client.auth.verifyOtp({
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
  const client = getSupabaseClient();
  
  if (!client?.auth?.signOut) {
    return { error: null };
  }

  try {
    return await client.auth.signOut();
  } catch (error) {
    return { error: null };
  }
}

/**
 * Get current session
 */
export async function getSession() {
  const client = getSupabaseClient();
  
  if (!client?.auth?.getSession) {
    return {
      data: { session: null },
      error: null,
    };
  }

  try {
    return await client.auth.getSession();
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
  const client = getSupabaseClient();
  
  if (!client?.auth?.getUser) {
    return null;
  }

  try {
    const {
      data: { user },
    } = await client.auth.getUser();
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
  const client = getSupabaseClient();
  return client.auth.onAuthStateChange((event: string, session: unknown) => {
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
  const client = getSupabaseClient();
  return client
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

export default getSupabaseClient;
