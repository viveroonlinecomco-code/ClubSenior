import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log('[ADMIN LOGOUT] Cerrando sesión');

    // ✅ Simplemente retornar success
    // El JWT se expira en el cliente
    return NextResponse.json({
      success: true,
      message: 'Sesión cerrada',
    });
  } catch (error: any) {
    console.error('[ADMIN LOGOUT] Error:', error.message);
    return NextResponse.json(
      { error: 'Error al logout' },
      { status: 500 }
    );
  }
}
