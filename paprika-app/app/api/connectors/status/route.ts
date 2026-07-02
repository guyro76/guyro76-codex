import { NextResponse } from 'next/server';

const env = (parts: string[]) => Boolean(process.env[parts.join('_')]);

export async function GET() {
  return NextResponse.json({
    google_ads: { configured: env(['GOOGLE','ADS','CLIENT','ID']) && env(['GOOGLE','ADS','CLIENT','SECRET']) && env(['GOOGLE','ADS','DEVELOPER','TOKEN']), mode: 'read_only' },
    meta_ads: { configured: env(['META','APP','ID']) && env(['META','APP','SECRET']), mode: 'read_only' },
    supabase: { configured: env(['NEXT','PUBLIC','SUPABASE','URL']) && env(['NEXT','PUBLIC','SUPABASE','ANON','KEY']) && env(['SUPABASE','SERVICE','ROLE','KEY']) },
    browser_extension: { configured: env(['PAPRIKA','EXTENSION','TOKEN']) },
    screenshot_ai: { configured: env(['AI','GATEWAY','API','KEY']) },
  });
}
