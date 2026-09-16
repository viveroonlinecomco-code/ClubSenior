import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/actividades/mis-proximas
 * Returns upcoming activities for user's condominio
 * Requires: x-user-email header
 */
export async function GET(request: NextRequest) {
  try {
    const userEmail = request.headers.get('x-user-email');
    
    if (!userEmail) {
      return NextResponse.json(
        { error: 'Missing x-user-email header' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[MIS-PROXIMAS] Config missing');
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }

    console.log('[MIS-PROXIMAS] Fetching for user:', userEmail);

    // Step 1: Get user's condominio
    const userResponse = await fetch(
      `${supabaseUrl}/rest/v1/usuarios?email=eq.${encodeURIComponent(userEmail)}&select=condominio`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!userResponse.ok) {
      console.error('[MIS-PROXIMAS] User fetch failed');
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const usuarios = await userResponse.json();
    if (!Array.isArray(usuarios) || usuarios.length === 0) {
      console.warn('[MIS-PROXIMAS] User not found:', userEmail);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userCondominio = usuarios[0].condominio;
    console.log('[MIS-PROXIMAS] User condominio:', userCondominio);

    if (!userCondominio) {
      console.warn('[MIS-PROXIMAS] User has no condominio assigned');
      return NextResponse.json({
        success: true,
        data: {
          condominio: null,
          actividades: [],
          meta: {
            count: 0,
            message: 'Usuario sin condominio asignado',
          },
        },
      });
    }

    // Step 2: Get condominio ID from nombre
    const condominioResponse = await fetch(
      `${supabaseUrl}/rest/v1/condominios?nombre=eq.${encodeURIComponent(userCondominio)}&select=id`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!condominioResponse.ok) {
      console.error('[MIS-PROXIMAS] Condominio fetch failed');
      return NextResponse.json({
        success: true,
        data: {
          condominio: userCondominio,
          actividades: [],
          meta: {
            count: 0,
            message: 'Condominio no encontrado en sistema',
          },
        },
      });
    }

    const condominios = await condominioResponse.json();
    if (!Array.isArray(condominios) || condominios.length === 0) {
      console.warn('[MIS-PROXIMAS] Condominio not found:', userCondominio);
      return NextResponse.json({
        success: true,
        data: {
          condominio: userCondominio,
          actividades: [],
          meta: {
            count: 0,
            message: 'No hay condominio registrado en el sistema',
          },
        },
      });
    }

    const condominioId = condominios[0].id;
    console.log('[MIS-PROXIMAS] Condominio ID:', condominioId);

    // Step 3: Get upcoming activities_programadas for this condominio
    const today = new Date().toISOString().split('T')[0];
    const activitiesResponse = await fetch(
      `${supabaseUrl}/rest/v1/actividades_programadas?condominio_id=eq.${condominioId}&fecha=gte.${today}&order=fecha.asc,hora_inicio.asc&select=id,actividad_id,fecha,hora_inicio,hora_fin,notas,condominio_id`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!activitiesResponse.ok) {
      console.error('[MIS-PROXIMAS] Activities programadas fetch failed');
      return NextResponse.json(
        { error: 'Failed to fetch activities' },
        { status: 500 }
      );
    }

    let actividades = await activitiesResponse.json();
    
    // Step 4: Enrich with actividad details (titulo, descripcion, modulo)
    if (Array.isArray(actividades) && actividades.length > 0) {
      const enrichedActividades = await Promise.all(
        actividades.map(async (act) => {
          try {
            const actDetailsResponse = await fetch(
              `${supabaseUrl}/rest/v1/actividades?id=eq.${act.actividad_id}&select=id,titulo,descripcion,modulo`,
              {
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
                },
              }
            );
            if (actDetailsResponse.ok) {
              const details = await actDetailsResponse.json();
              if (Array.isArray(details) && details.length > 0) {
                return { ...act, ...details[0] };
              }
            }
          } catch (err) {
            console.warn('[MIS-PROXIMAS] Error enriching activity:', act.id);
          }
          return act;
        })
      );
      actividades = enrichedActividades;
    }
    
    console.log(`[MIS-PROXIMAS] Found ${actividades.length} activities ✅`);

    return NextResponse.json({
      success: true,
      data: {
        condominio: userCondominio,
        actividades: actividades || [],
        meta: {
          count: (actividades || []).length,
          timestamp: new Date().toISOString(),
        },
      },
    });
  } catch (error: any) {
    console.error('[MIS-PROXIMAS] Exception:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
