import { NextResponse } from 'next/server';

export async function GET() {
  const checks = {
    api: 'ok',
    env: {
      supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      resendKey: !!process.env.RESEND_API_KEY,
    },
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(checks);
}
