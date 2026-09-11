import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';
import { CreateActivitySchema } from '@/lib/validation/schemas';

export async function POST(request: NextRequest) {
  try {
    const { facilitador_id, nombre, descripcion, fecha, hora_inicio, duracion_minutos, ubicacion, capacidad_max } = await request.json();
    const token = request.headers.get('Authorization')?.substring(7);

    if (!token || !facilitador_id) {
      return NextResponse.json(
        { error: 'Missing token or facilitador_id' },
        { status: 400 }
      );
    }

    // Verify token
    const decoded = jwtDecode<any>(token);
    if (!decoded || decoded.facilitadorId !== facilitador_id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate input
    const validation = CreateActivitySchema.safeParse({
      nombre,
      descripcion,
      fecha,
      hora_inicio,
      duracion_minutos,
      ubicacion,
      capacidad_max,
      condominio_id: 'temp',
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', fields: validation.error.flatten().fieldErrors },
        { status: 422 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const headers = new Headers({
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    });

    // Get facilitador's condominio
    const facResponse = await fetch(
      `${supabaseUrl}/rest/v1/facilitadores?id=eq.${facilitador_id}&select=condominio_id`,
      { method: 'GET', headers }
    );
    const facilitadores = await facResponse.json();

    if (!facilitadores.length) {
      return NextResponse.json(
        { error: 'Facilitador not found' },
        { status: 404 }
      );
    }

    const condominio_id = facilitadores[0].condominio_id;

    // Create activity
    const activityData = {
      nombre,
      descripcion: descripcion || null,
      fecha,
      hora_inicio,
      duracion_minutos: duracion_minutos || 120,
      condominio_id,
      ubicacion: ubicacion || null,
      capacidad_max: capacidad_max || null,
      estado: 'PROGRAMADA',
    };

    const createResponse = await fetch(
      `${supabaseUrl}/rest/v1/actividades`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(activityData),
      }
    );

    if (!createResponse.ok) {
      const error = await createResponse.text();
      console.error('[CREATE-ACTIVITY] Error:', error);
      return NextResponse.json(
        { error: 'Failed to create activity' },
        { status: createResponse.status }
      );
    }

    const newActivity = await createResponse.json();

    // Log in audit
    try {
      await fetch(`${supabaseUrl}/rest/v1/audit_log`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          usuario_id: facilitador_id,
          usuario_email: decoded.email,
          usuario_tipo: 'FACILITADOR',
          accion: 'CREATE_ACTIVITY',
          tabla_afectada: 'actividades',
          registro_id: newActivity[0]?.id,
          resultado: 'EXITOSO',
          detalles: `Facilitador creó actividad: ${nombre}`,
          ip_address: request.headers.get('x-forwarded-for') || 'unknown',
          user_agent: request.headers.get('user-agent'),
        }),
      });
    } catch (auditError) {
      console.error('[CREATE-ACTIVITY] Audit error:', auditError);
    }

    return NextResponse.json({
      success: true,
      message: 'Activity created successfully',
      activity: newActivity[0],
    });
  } catch (error: any) {
    console.error('[CREATE-ACTIVITY] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
