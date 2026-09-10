/**
 * GET /api/dashboard/data
 * Get dashboard data for authenticated user
 * Uses token from Authorization header (passed from frontend localStorage)
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[DASHBOARD] No auth header');
      return NextResponse.json(
        { error: 'No authentication token' },
        { status: 401 }
      );
    }

    // Extract email from token (base64 encoded)
    const token = authHeader.substring(7);
    let email: string;
    
    try {
      email = Buffer.from(token, 'base64').toString('utf-8');
    } catch (err) {
      console.error('[DASHBOARD] Invalid token format');
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    if (!email) {
      console.log('[DASHBOARD] Token decoded to empty email');
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    console.log('[DASHBOARD] Authenticated:', email);

    // MVP: Return minimal dashboard data
    // TODO: Fetch real data from participantes/suscripciones when needed
    return NextResponse.json({
      success: true,
      email,
      user: { email },
      suscripcion: null,
      reportes: [],
      asistencias: null,
      pagos: [],
      message: 'Welcome to your dashboard!',
    });

  } catch (error: any) {
    console.error('[DASHBOARD] Error:', error.message);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}
