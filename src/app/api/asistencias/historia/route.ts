import { NextRequest, NextResponse } from 'next/server';
import { jwtDecode } from 'jwt-decode';

/**
 * GET /api/asistencias/historia
 * Obtiene el historial de asistencias del usuario autenticado
 * NOTA: Por ahora retorna datos hardcodeados mientras verificamos Supabase
 */
export async function GET(request: NextRequest) {
  try {
    // MOCK DATA - Retorna datos de prueba directamente
    const mockData = {
      activitiesEnrolled: 8,
      activitiesAttended: 6,
      attendanceRate: 75,
      lastParticipation: 'Hace 2 días',
      byPilar: [
        { name: 'Físicas', attended: 3 },
        { name: 'Cognitivas', attended: 2 },
        { name: 'Sociales', attended: 1 },
        { name: 'Tertulias', attended: 0 },
      ],
      contribution: {
        storiesShared: 0,
        newConnections: 0,
        legacyProjects: 0,
      },
    };

    console.log('[ASISTENCIAS] Returning mock data');
    
    return NextResponse.json(mockData);

  } catch (error: any) {
    console.error('[ASISTENCIAS] Error:', error.message);
    return NextResponse.json(
      { error: 'Failed to fetch asistencias' },
      { status: 500 }
    );
  }
}
