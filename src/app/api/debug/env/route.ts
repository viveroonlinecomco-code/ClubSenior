import { NextResponse } from 'next/server';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  const debug = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    
    // Verificar variables públicas (NEXT_PUBLIC_* llegan al cliente)
    variables: {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl 
        ? {
            status: '✅ SET',
            value: supabaseUrl,
            valid: supabaseUrl.startsWith('https://'),
          }
        : { status: '❌ NOT SET', value: null, valid: false },
      
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: supabaseKey
        ? {
            status: '✅ SET',
            value: `${supabaseKey.substring(0, 20)}...${supabaseKey.substring(supabaseKey.length - 10)}`,
            length: supabaseKey.length,
          }
        : { status: '❌ NOT SET', value: null },
      
      SUPABASE_SERVICE_ROLE_KEY: serviceRoleKey
        ? { status: '✅ SET', length: serviceRoleKey.length }
        : { status: '❌ NOT SET' },
      
      NEXT_PUBLIC_APP_URL: appUrl
        ? { status: '✅ SET', value: appUrl }
        : { status: '❌ NOT SET', value: null },
    },
    
    // Estado de configuración
    configuration: {
      supabaseConfigured: !!(supabaseUrl && supabaseKey && supabaseUrl.startsWith('https://')),
      message: supabaseUrl && supabaseKey && supabaseUrl.startsWith('https://')
        ? '✅ Supabase should be properly configured'
        : '❌ Supabase is NOT configured - missing or invalid variables',
    },

    // Información de debug
    debug: {
      supabaseUrlType: typeof supabaseUrl,
      supabaseKeyType: typeof supabaseKey,
      supabaseKeyLength: supabaseKey?.length || 0,
    }
  };

  return NextResponse.json(debug, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
      'Pragma': 'no-cache',
    }
  });
}
