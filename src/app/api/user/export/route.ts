/**
 * API Endpoint: GET /api/user/export
 * 
 * Exporta TODOS los datos del usuario en formato JSON
 * Cumple con GDPR Art. 20 (Right to Portability)
 * Cumple con Ley 1581 Art. 12 (Acceso a datos personales)
 * 
 * Uso:
 * curl -H "Authorization: Bearer {token}" \
 *      https://clubsenior.com.co/api/user/export
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { withJWTAuth } from '@/lib/middleware';

interface ExportData {
  exportedAt: string;
  version: string;
  usuario: any;
  suscripciones: any[];
  participantes: any[];
  actividades: any[];
  asistencias: any[];
  reportes: any[];
  audit_logs: any[];
}

export async function GET(request: NextRequest) {
  return withJWTAuth(request, async (req, userId) => {
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      console.log(`[EXPORT] Starting data export for user: ${userId}`);

      // Fetch user data
      const { data: usuario, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('[EXPORT] Error fetching user:', userError);
        return NextResponse.json(
          { error: 'No se encontró usuario' },
          { status: 404 }
        );
      }

      // Fetch suscripciones
      const { data: suscripciones, error: subError } = await supabase
        .from('suscripciones')
        .select('*')
        .eq('usuario_id', userId);

      // Fetch participantes
      const { data: participantes, error: partError } = await supabase
        .from('participantes')
        .select('*')
        .eq('usuario_id', userId);

      // Fetch actividades (donde el usuario es facilitador)
      const { data: actividades, error: actError } = await supabase
        .from('actividades')
        .select('*')
        .eq('facilitador_id', userId);

      // Fetch asistencias
      const { data: asistencias, error: attError } = await supabase
        .from('asistencias')
        .select('*')
        .in('participante_id', participantes?.map(p => p.id) || []);

      // Fetch reportes
      const { data: reportes, error: repError } = await supabase
        .from('reportes_semanales')
        .select('*')
        .in('participante_id', participantes?.map(p => p.id) || []);

      // Fetch audit logs (donde usuario es actor)
      const { data: auditLogs, error: auditError } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('usuario_email', usuario?.email)
        .limit(1000); // Limitar para performance

      // Compilar exportación
      const exportData: ExportData = {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        usuario: usuario ? sanitizeUserData(usuario) : null,
        suscripciones: suscripciones || [],
        participantes: participantes?.map(p => sanitizeParticipantData(p)) || [],
        actividades: actividades || [],
        asistencias: asistencias || [],
        reportes: reportes || [],
        audit_logs: auditLogs?.map(log => sanitizeAuditLog(log)) || [],
      };

      // Log de exportación para auditoría
      await supabase
        .from('audit_logs')
        .insert({
          usuario_email: usuario?.email,
          usuario_id: userId,
          accion: 'DATA_EXPORT',
          tabla_afectada: 'usuarios',
          valores_anteriores: null,
          valores_nuevos: { export_requested: true },
          timestamp: new Date().toISOString(),
        });

      console.log(`[EXPORT] Export completed for user: ${userId}`);

      // Retornar JSON con headers para descarga
      return NextResponse.json(exportData, {
        headers: {
          'Content-Disposition': `attachment; filename="clubsenior-data-${new Date().toISOString().split('T')[0]}.json"`,
          'Content-Type': 'application/json; charset=utf-8',
        },
      });
    } catch (error: any) {
      console.error('[EXPORT] Error:', error);
      return NextResponse.json(
        { error: 'Error al exportar datos' },
        { status: 500 }
      );
    }
  });
}

/**
 * Sanitizar datos de usuario (remover campos sensibles si es necesario)
 */
function sanitizeUserData(usuario: any) {
  // Mantener toda la información del usuario que recolectamos
  return {
    id: usuario.id,
    email: usuario.email,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    telefono: usuario.telefono,
    ciudad: usuario.ciudad,
    condominio_id: usuario.condominio_id,
    created_at: usuario.created_at,
    updated_at: usuario.updated_at,
    // No incluir hashedPassword o tokens
  };
}

/**
 * Sanitizar datos de participante
 */
function sanitizeParticipantData(participant: any) {
  return {
    id: participant.id,
    nombre: participant.nombre,
    edad: participant.edad,
    genero: participant.genero,
    notas: participant.notas,
    estado: participant.estado,
    usuario_id: participant.usuario_id,
    created_at: participant.created_at,
    updated_at: participant.updated_at,
  };
}

/**
 * Sanitizar audit logs (remover info sensible)
 */
function sanitizeAuditLog(log: any) {
  return {
    id: log.id,
    usuario_email: log.usuario_email,
    accion: log.accion,
    tabla_afectada: log.tabla_afectada,
    // Incluir valores pero no información de otros usuarios
    timestamp: log.timestamp,
  };
}
