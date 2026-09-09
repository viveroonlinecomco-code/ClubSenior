/**
 * Server-side Supabase client
 * Uses SERVICE_ROLE_KEY for admin operations
 * NEVER expose SERVICE_ROLE_KEY to browser
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://popgpdhtyhckvkjmiknq.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key-for-build';

if (!supabaseUrl.startsWith('https://')) {
  console.warn('⚠️ Invalid Supabase URL during build. Runtime will fail if not configured.');
}

/**
 * Admin client with full database access
 * Used for:
 * - Webhook processing (Wompi)
 * - User management
 * - Audit logging
 * - Backend business logic
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

/**
 * Verify that a JWT token is valid
 * Used by middleware to check session cookies
 */
export async function verifyAuth(token: string) {
  try {
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error) {
      return { user: null, error };
    }

    return { user, error: null };
  } catch (err) {
    return { user: null, error: err };
  }
}

/**
 * Create a user in Supabase Auth
 * Called during onboarding or admin user creation
 */
export async function createAuthUser(email: string) {
  try {
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    });

    if (error) {
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Get current user from JWT token
 */
export async function getCurrentUser(token: string) {
  const { user, error } = await verifyAuth(token);
  return { user, error };
}

/**
 * Log an action to audit_logs table
 * Server-side only for security
 */
export async function createAuditLog(
  actor_id: string | null,
  accion: string,
  resource_type: string,
  resource_id: string,
  metadata?: Record<string, unknown>
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .insert({
        actor_id,
        accion,
        resource_type,
        resource_id,
        metadata: metadata || {},
        created_at: new Date().toISOString(),
      });

    return { data, error };
  } catch (err) {
    console.error('Audit log error:', err);
    return { data: null, error: err };
  }
}

/**
 * Store a webhook event for idempotency
 */
export async function recordWebhookEvent(
  proveedor: 'wompi' | string,
  evento_id_externo: string,
  evento_tipo: string,
  payload: Record<string, unknown>
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('webhook_events')
      .insert({
        proveedor,
        evento_id_externo,
        evento_tipo,
        payload,
        procesado: false,
        intento_numero: 0,
        created_at: new Date().toISOString(),
      })
      .select('id');

    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Mark webhook as processed
 */
export async function markWebhookProcessed(
  webhook_id: string,
  resultado: string,
  error?: string | null
) {
  try {
    const { data, error: updateError } = await supabaseAdmin
      .from('webhook_events')
      .update({
        procesado: true,
        resultado,
        error: error || null,
        fecha_procesamiento: new Date().toISOString(),
      })
      .eq('id', webhook_id);

    return { data, error: updateError };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Get a subscription by ID with RLS enforcement
 * The database RLS policy ensures the user can only see their own data
 */
export async function getSubscriptionById(
  suscripcion_id: string,
  userId: string
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('suscripciones')
      .select('*')
      .eq('id', suscripcion_id)
      .single();

    // Verify user has access to this subscription
    if (
      data &&
      data.sponsor_id !== userId &&
      data.participante_id !== userId
    ) {
      return { data: null, error: new Error('Unauthorized') };
    }

    return { data, error };
  } catch (err) {
    return { data: null, error: err };
  }
}

export default supabaseAdmin;
