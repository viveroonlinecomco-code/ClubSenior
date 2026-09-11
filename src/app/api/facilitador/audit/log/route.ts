import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/facilitador/audit/log
 * Registra evento en audit_log
 */
export async function POST(request: NextRequest) {
  try {
    const {
      accion,
      tabla_afectada,
      registro_id,
      datos_previos,
      datos_nuevos,
      detalles,
      resultado = 'EXITOSO',
    } = await request.json();

    // Obtener datos del facilitador desde token
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    let usuario_email = 'unknown';
    let usuario_id = null;

    if (token) {
      try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8');
        const [email] = decoded.split('|');
        usuario_email = email;
      } catch {
        // Token inválido, pero continuamos
      }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    console.log('[AUDIT] Registrando:', { accion, tabla_afectada, usuario_email });

    // Registrar en audit_log
    const auditData = {
      usuario_email,
      usuario_tipo: 'FACILITADOR',
      accion,
      tabla_afectada,
      registro_id: registro_id || null,
      datos_previos: datos_previos || null,
      datos_nuevos: datos_nuevos || null,
      resultado,
      detalles: detalles || null,
      ip_address: request.headers.get('x-forwarded-for') || 'unknown',
      user_agent: request.headers.get('user-agent') || null,
    };

    const response = await fetch(`${supabaseUrl}/rest/v1/audit_log`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(auditData),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[AUDIT] Failed to log:', error);
      // No fallar si el log falla
    }

    console.log('[AUDIT] ✅ Registered:', accion);

    return NextResponse.json({
      success: true,
      message: 'Evento registrado en auditoría',
    });

  } catch (error: any) {
    console.error('[AUDIT] Error:', error.message);
    // No fallar, la auditoría es complementaria
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
