import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // ✅ FIX #4: Bloquear debug endpoints en producción
  if (process.env.NODE_ENV === 'production') {
    console.warn('[DEBUG] Attempt to access /api/debug/token in production')
    return NextResponse.json(
      {
        error: 'Debug endpoints not available in production',
        environment: process.env.NODE_ENV,
      },
      { status: 403 }
    )
  }

  return NextResponse.json({
    message: 'Check browser localStorage for auth_token',
    instructions: 'Open DevTools → Application → LocalStorage → auth_token should exist',
    environment: 'development',
  });
}
