/**
 * Database functions for user and subscription management
 * All functions use Supabase server client (service role key)
 */

import { supabaseAdmin } from './server';

/**
 * Create user profile after OTP verification
 * Called after user verifies email in /verificar-otp
 */
export async function createUserProfile(
  userId: string,
  email: string,
  fullName: string,
  phone?: string
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: userId,
        email,
        full_name: fullName,
        phone,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Exception creating profile:', err);
    return { data: null, error: err };
  }
}

/**
 * Create participante (adult senior)
 */
export async function createParticipante(
  profileId: string,
  condominioId: string,
  nombre: string,
  edad: number,
  genero: string = 'otro',
  tieneAutonomiaMotriz: boolean = true,
  notas?: string
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('participantes')
      .insert({
        id: profileId,
        condominio_id: condominioId,
        nombre,
        edad,
        genero,
        tiene_autonomia_motriz: tieneAutonomiaMotriz,
        notas,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating participante:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Exception creating participante:', err);
    return { data: null, error: err };
  }
}

/**
 * Get or create default condominio
 */
export async function getOrCreateDefaultCondominio(ciudad: string) {
  try {
    // Try to find existing condominio
    const { data: existing } = await supabaseAdmin
      .from('condominios')
      .select()
      .eq('nombre', 'Residencial Bogotá')
      .eq('ciudad', ciudad)
      .single();

    if (existing) {
      return { data: existing, error: null };
    }

    // Create default condominio
    const { data, error } = await supabaseAdmin
      .from('condominios')
      .insert({
        nombre: 'Residencial Bogotá',
        ubicacion: 'Sabana de Bogotá',
        ciudad,
        contacto_admin_nombre: 'Administración',
        contacto_admin_email: 'admin@club-senior.co',
        contacto_admin_phone: '+57 300 1234567',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating condominio:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Exception in getOrCreateDefaultCondominio:', err);
    return { data: null, error: err };
  }
}

/**
 * Create subscription after step 3 completion
 */
export async function createSuscripcion(
  participanteId: string,
  planId: string,
  sponsorId: string,
  estado: string = 'DATA_COMPLETED'
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('suscripciones')
      .insert({
        participante_id: participanteId,
        plan_id: planId,
        sponsor_id: sponsorId,
        estado,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating suscripcion:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Exception creating suscripcion:', err);
    return { data: null, error: err };
  }
}

/**
 * Get plan by nombre
 */
export async function getPlanByNombre(nombre: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('planes')
      .select()
      .eq('nombre', nombre)
      .single();

    if (error) {
      console.error('Error getting plan:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Exception getting plan:', err);
    return { data: null, error: err };
  }
}

/**
 * Get all plans
 */
export async function getAllPlanes() {
  try {
    const { data, error } = await supabaseAdmin
      .from('planes')
      .select()
      .eq('activo', true)
      .order('precio_cop', { ascending: true });

    if (error) {
      console.error('Error getting planes:', error);
      return { data: [], error };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Exception getting planes:', err);
    return { data: [], error: err };
  }
}

/**
 * Get subscription for sponsor (dashboard)
 */
export async function getSuscripcionForSponsor(sponsorId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('suscripciones')
      .select(
        `
        id,
        estado,
        fecha_inicio,
        fecha_fin,
        participante_id,
        plan_id,
        planes:plan_id (
          nombre,
          descripcion,
          precio_cop,
          duracion_dias
        ),
        participantes:participante_id (
          nombre,
          edad,
          genero
        )
      `
      )
      .eq('sponsor_id', sponsorId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      // No subscription found is not an error
      if (error.code === 'PGRST116') {
        return { data: null, error: null };
      }
      console.error('Error getting suscripcion:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Exception getting suscripcion:', err);
    return { data: null, error: err };
  }
}

/**
 * Get payment history for sponsor
 */
export async function getPaymentHistoryForSponsor(sponsorId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('pagos')
      .select(
        `
        id,
        monto_cop,
        estado,
        created_at,
        suscripcion_id,
        suscripciones:suscripcion_id (
          sponsor_id
        )
      `
      )
      .eq('suscripciones.sponsor_id', sponsorId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error getting payment history:', error);
      return { data: [], error };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Exception getting payment history:', err);
    return { data: [], error: err };
  }
}

/**
 * Get weekly reports for participante
 */
export async function getWeeklyReportsForParticipante(
  participanteId: string,
  limit: number = 4
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('reportes_semanales')
      .select()
      .eq('participante_id', participanteId)
      .order('semana_inicio', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting weekly reports:', error);
      return { data: [], error };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Exception getting weekly reports:', err);
    return { data: [], error: err };
  }
}

/**
 * Get attendance stats for participante
 */
export async function getAttendanceStatsForParticipante(participanteId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('asistencias')
      .select('asistio')
      .eq('participante_id', participanteId);

    if (error) {
      console.error('Error getting attendance stats:', error);
      return { stats: null, error };
    }

    const total = data?.length || 0;
    const asistencias = data?.filter((a: any) => a.asistio).length || 0;
    const tasa = total > 0 ? Math.round((asistencias / total) * 100) : 0;

    return {
      stats: {
        total,
        asistencias,
        inasistencias: total - asistencias,
        tasa,
      },
      error: null,
    };
  } catch (err: any) {
    console.error('Exception getting attendance stats:', err);
    return { stats: null, error: err };
  }
}

/**
 * Update subscription status (admin/backend only)
 */
export async function updateSuscripcionStatus(
  suscripcionId: string,
  estado: string
) {
  try {
    const { data, error } = await supabaseAdmin
      .from('suscripciones')
      .update({ estado })
      .eq('id', suscripcionId)
      .select()
      .single();

    if (error) {
      console.error('Error updating suscripcion:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Exception updating suscripcion:', err);
    return { data: null, error: err };
  }
}
