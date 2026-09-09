/**
 * GET /api/dashboard/data
 * Get all dashboard data for authenticated user
 * Includes subscription, reports, attendance
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getSuscripcionForSponsor,
  getPaymentHistoryForSponsor,
  getWeeklyReportsForParticipante,
  getAttendanceStatsForParticipante,
} from '@/lib/supabase/database';
import { supabaseAdmin } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const {
      data: { user },
    } = await supabaseAdmin.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'No user found. Please authenticate first.' },
        { status: 401 }
      );
    }

    // Get subscription
    const suscripcionResult = await getSuscripcionForSponsor(user.id);
    const suscripcion = suscripcionResult.data;

    if (!suscripcion) {
      return NextResponse.json({
        user: { id: user.id, email: user.email },
        suscripcion: null,
        reportes: [],
        asistencias: null,
        pagos: [],
      });
    }

    // Get payment history
    const pagosResult = await getPaymentHistoryForSponsor(user.id);

    // Get weekly reports (if participante exists)
    let reportes = [];
    let asistencias = null;
    if (suscripcion.participante_id) {
      const reportesResult = await getWeeklyReportsForParticipante(suscripcion.participante_id);
      reportes = reportesResult.data || [];

      const asistenciasResult = await getAttendanceStatsForParticipante(
        suscripcion.participante_id
      );
      asistencias = asistenciasResult.stats;
    }

    return NextResponse.json({
      user: { id: user.id, email: user.email },
      suscripcion,
      reportes,
      asistencias,
      pagos: pagosResult.data || [],
    });
  } catch (error: any) {
    console.error('Error in dashboard data:', error);
    return NextResponse.json(
      { error: 'Server error', details: error.message },
      { status: 500 }
    );
  }
}
