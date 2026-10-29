import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;
  const code = new URL(request.url).searchParams.get('code');
  if (!code) return NextResponse.redirect(origin + '/?auth=missing_code');
  const jar = await cookies();
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    cookies: {
      getAll() { return jar.getAll(); },
      setAll(values) { values.forEach(({ name, value, options }) => jar.set(name, value, options)); }
    }
  });
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return NextResponse.redirect(origin + (error ? '/?auth=failed' : '/'));
}
