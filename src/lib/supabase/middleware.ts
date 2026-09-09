/**
 * Supabase session management for Next.js middleware
 * Handles token refresh and session validation
 */

import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';

export async function updateSession(request: NextRequest) {
  const supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          const cookies: Array<{ name: string; value: string }> = [];
          request.cookies.getAll().forEach((cookie) => {
            cookies.push({
              name: cookie.name,
              value: cookie.value,
            });
          });
          return cookies;
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Get current session
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // If there's an error or no user, session might be expired
  if (error || !user) {
    return supabaseResponse;
  }

  // Set user info in response header for use in middleware
  supabaseResponse.headers.set(
    'x-supabase-user',
    JSON.stringify({
      id: user.id,
      email: user.email,
    })
  );

  return supabaseResponse;
}
