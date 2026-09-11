import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/signin-register
 * Registra un usuario básico cuando usa /signin directamente
 * Sin datos de /inscribir - solo email y token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Email required' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase not configured');
    }

    console.log(`[SIGNIN-REGISTER] Creating basic user for: ${email}`);

    // Check if user already exists
    const checkResponse = await fetch(
      `${supabaseUrl}/rest/v1/usuarios?email=eq.${encodeURIComponent(email)}`,
      {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const existingUsers = await checkResponse.json();

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      console.log(`[SIGNIN-REGISTER] User already exists: ${email}`);
      
      // User already exists - generate token for existing user
      const user = existingUsers[0];
      
      // Generate simple token (Base64 for compatibility)
      const token = Buffer.from(`${user.id}:${email}`).toString('base64');

      return NextResponse.json({
        success: true,
        message: 'Usuario encontrado',
        email,
        token,
        userId: user.id,
      });
    }

    // Create new basic user
    const createResponse = await fetch(
      `${supabaseUrl}/rest/v1/usuarios`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          email,
          nombre: email.split('@')[0], // Default name from email
          telefono: null,
          condominio_id: null,
          rol: 'familia',
          activo: true,
          created_at: new Date().toISOString(),
        }),
      }
    );

    if (!createResponse.ok) {
      const error = await createResponse.json();
      console.error(`[SIGNIN-REGISTER] Failed to create user:`, error);
      throw new Error(`Failed to create user: ${error.message || createResponse.statusText}`);
    }

    const [createdUser] = await createResponse.json();

    console.log(`[SIGNIN-REGISTER] User created successfully: ${email}`);

    // Generate simple token (Base64 for compatibility with existing auth-guard)
    const token = Buffer.from(`${createdUser.id}:${email}`).toString('base64');

    return NextResponse.json({
      success: true,
      message: 'Usuario registrado exitosamente',
      email,
      token,
      userId: createdUser.id,
    });
  } catch (error: any) {
    console.error('[SIGNIN-REGISTER] Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Error registering user',
      },
      { status: 500 }
    );
  }
}
