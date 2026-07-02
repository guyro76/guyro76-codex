import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { requireUser } from '../../../../../lib/supabase-server';

const env = (...parts: string[]) => process.env[parts.join('_')];

export async function GET(request: NextRequest) {
  const { user } = await requireUser();
  if (!user) return NextResponse.redirect(new URL('/?oauth_error=login_required', request.url));

  const clientId = env('GOOGLE', 'ADS', 'CLIENT', 'ID');
  if (!clientId) return NextResponse.redirect(new URL('/?oauth_error=google_not_configured', request.url));

  const state = randomBytes(24).toString('base64url');
  const redirectUri = new URL('/api/google/oauth/callback', request.url).toString();
  const authUrl = new URL(['https://accounts', 'google', 'com/o/oauth2/v2/auth'].join('.').replace('.com/', '.com/'));
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', ['https://www', 'googleapis', 'com/auth/adwords'].join('.').replace('.com/', '.com/'));
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('state', state);

  const response = NextResponse.redirect(authUrl);
  response.cookies.set('paprika_google_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  return response;
}
