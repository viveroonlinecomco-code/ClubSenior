import { NextRequest, NextResponse } from 'next/server';

/**
 * DEBUG ENDPOINT - Ver qué data trae de Supabase
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    console.log('[DEBUG] SUPABASE_URL:', supabaseUrl);
    console.log('[DEBUG] SUPABASE_KEY exists:', !!supabaseKey);

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        error: 'Missing Supabase config',
        supabaseUrl: supabaseUrl ? 'EXISTS' : 'MISSING',
        supabaseKey: supabaseKey ? 'EXISTS' : 'MISSING',
      }, { status: 500 });
    }

    // Try to fetch actividades
    const url = `${supabaseUrl}/rest/v1/actividades?limit=10`;
    console.log('[DEBUG] Fetching:', url);

    const response = await fetch(url, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    console.log('[DEBUG] Response status:', response.status);
    const text = await response.text();
    console.log('[DEBUG] Response body:', text);

    if (!response.ok) {
      return NextResponse.json({
        error: 'Supabase request failed',
        status: response.status,
        body: text,
      }, { status: response.status });
    }

    const data = JSON.parse(text);
    return NextResponse.json({
      success: true,
      count: data.length,
      data: data,
    });

  } catch (error: any) {
    console.error('[DEBUG] Error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack,
    }, { status: 500 });
  }
}
