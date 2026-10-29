// Public, read-only Supabase Auth health diagnostic.
// Prints flags only; never prints keys, tokens, user details or provider secrets.
import {SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY} from '../src/lib/supabasePublicConfig.ts';
const url = new URL('/auth/v1/settings', SUPABASE_URL).toString();
try {
  const response = await fetch(url, { headers: { apikey: SUPABASE_PUBLISHABLE_KEY }, signal: AbortSignal.timeout(12000) });
  if (!response.ok) {
    console.error('AUTH_DIAGNOSTIC: service refused settings request; HTTP ' + response.status);
    process.exitCode = 1;
  } else {
    const settings = await response.json();
    const flags = {
      auth_service_reachable: true,
      google_provider_enabled: settings.external?.google === true,
      email_provider_enabled: settings.external?.email === true,
      signup_disabled: settings.disable_signup === true,
      email_confirmation_required: settings.mailer_autoconfirm === false
    };
    console.log('AUTH_DIAGNOSTIC ' + JSON.stringify(flags));
    if (!flags.google_provider_enabled || !flags.email_provider_enabled) {
      console.log('AUTH_CONFIGURATION_PENDING: provider(s) not enabled. Check Supabase Auth > Providers; do not replace settings for other projects.');
    }
  }
} catch(err) {
  console.error('AUTH_DIAGNOSTIC: ' + (err instanceof Error ? err.message : 'request failed'));
  process.exitCode = 1;
}
