import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'Check browser localStorage for auth_token',
    instructions: 'Open DevTools → Application → LocalStorage → auth_token should exist',
  });
}
