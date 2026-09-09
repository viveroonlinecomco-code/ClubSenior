/**
 * Facilitators and Activities Management
 */

// Dynamic import to avoid build-time initialization
let supabaseAdminInstance: any = null;

async function getSupabaseAdmin() {
  if (!supabaseAdminInstance) {
    const { supabaseAdmin } = await import("@/lib/supabase/server");
    supabaseAdminInstance = supabaseAdmin;
  }
  return supabaseAdminInstance;
}

/**
 * Create new facilitator
 */
export async function createFacilitador(
  email: string,
  fullName: string,
  phone: string,
  especialidad?: string
) {
  try {
    // Create profile
    const { data, error } = await (await getSupabaseAdmin())
      .from('profiles')
      .insert({
        email,
        full_name: fullName,
        phone,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating facilitador:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Exception creating facilitador:', err);
    return { data: null, error: err };
  }
}

/**
 * Get all facilitators
 */
export async function getAllFacilitadores() {
  try {
    const { data, error } = await (await getSupabaseAdmin())
      .from('profiles')
      .select()
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching facilitadores:', error);
      return { data: [], error };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Exception fetching facilitadores:', err);
    return { data: [], error: err };
  }
}

/**
 * Create activity
 */
export async function createActividad(
  nombre: string,
  descripcion: string,
  tipo: 'EJERCICIO' | 'TALLER' | 'ENTRETENIMIENTO' | 'EDUCACION',
  horarioInicio: string,
  horarioFin: string,
  frecuencia: 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO',
  facilitadorId: string,
  condominioId: string,
  capacidadMaxima: number
) {
  try {
    const { data, error } = await (await getSupabaseAdmin())
      .from('actividades')
      .insert({
        nombre,
        descripcion,
        tipo,
        horario_inicio: horarioInicio,
        horario_fin: horarioFin,
        frecuencia,
        facilitador_id: facilitadorId,
        condominio_id: condominioId,
        capacidad_maxima: capacidadMaxima,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating actividad:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Exception creating actividad:', err);
    return { data: null, error: err };
  }
}

/**
 * Get activities by condominio
 */
export async function getActividadesByCondominio(condominioId: string) {
  try {
    const { data, error } = await (await getSupabaseAdmin())
      .from('actividades')
      .select(
        `
        id,
        nombre,
        descripcion,
        tipo,
        horario_inicio,
        horario_fin,
        frecuencia,
        capacidad_maxima,
        facilitador_id,
        perfiles:facilitador_id (
          full_name,
          email
        )
      `
      )
      .eq('condominio_id', condominioId)
      .order('frecuencia', { ascending: true });

    if (error) {
      console.error('Error fetching actividades:', error);
      return { data: [], error };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Exception fetching actividades:', err);
    return { data: [], error: err };
  }
}

/**
 * Record attendance
 */
export async function recordAsistencia(
  actividadId: string,
  participanteId: string,
  asistio: boolean
) {
  try {
    const { data, error } = await (await getSupabaseAdmin())
      .from('asistencias')
      .insert({
        actividad_id: actividadId,
        participante_id: participanteId,
        asistio,
      })
      .select()
      .single();

    if (error) {
      console.error('Error recording asistencia:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Exception recording asistencia:', err);
    return { data: null, error: err };
  }
}

/**
 * Generate weekly report
 */
export async function generateWeeklyReport(
  participanteId: string,
  semanaInicio: string,
  semanaFin: string,
  observaciones: string,
  calificacion: number
) {
  try {
    // Count activities and attendance
    const { data: asistencias, error: asError } = await (await getSupabaseAdmin())
      .from('asistencias')
      .select()
      .eq('participante_id', participanteId);

    const actividadesRealizadas = asistencias?.length || 0;
    const asistenciasCount = asistencias?.filter((a: any) => a.asistio).length || 0;
    const inasistenciasCount = actividadesRealizadas - asistenciasCount;

    // Create report
    const { data, error } = await (await getSupabaseAdmin())
      .from('reportes_semanales')
      .insert({
        participante_id: participanteId,
        semana_inicio: semanaInicio,
        semana_fin: semanaFin,
        actividades_realizadas: actividadesRealizadas,
        asistencias: asistenciasCount,
        inasistencias: inasistenciasCount,
        observaciones,
        calificacion_general: calificacion,
        resumen: observaciones,
      })
      .select()
      .single();

    if (error) {
      console.error('Error generating report:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Exception generating report:', err);
    return { data: null, error: err };
  }
}

/**
 * Get activity participants for attendance tracking
 */
export async function getActivityParticipants(actividadId: string) {
  try {
    const { data, error } = await (await getSupabaseAdmin())
      .from('participantes')
      .select(
        `
        id,
        nombre,
        edad,
        asistencias!inner (
          asistio
        )
      `
      )
      .eq('asistencias.actividad_id', actividadId);

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: [], error: null };
      }
      console.error('Error fetching participants:', error);
      return { data: [], error };
    }

    return { data, error: null };
  } catch (err: any) {
    console.error('Exception fetching participants:', err);
    return { data: [], error: err };
  }
}
