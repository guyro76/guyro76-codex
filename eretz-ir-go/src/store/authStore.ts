import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { authConfigured, availableProviders, redirectTo, supabase } from '../lib/supabase';
import { TIERS, effectiveTier, tierAfterExpiry, type Role, type Tier, type TierSpec } from '../lib/tiers';

/** מה שקוד הזמנה מבטיח, עוד לפני שנרשמים */
export interface InvitePreview {
  ok: boolean;
  message: string;
  tier?: Tier;
  days?: number;
}

export interface Account {
  id: string;
  email: string | null;
  displayName: string | null;
  role: Role;
  tier: Tier;
  tierExpiresAt: string | null;
}

interface AuthState {
  /** null עד שסיימנו לבדוק אם יש סשן שמור — כדי לא להבהב מסך התחברות */
  ready: boolean;
  session: Session | null;
  account: Account | null;
  error: string | null;
  busy: boolean;
  /** אילו ספקים חיצוניים באמת פעילים בשרת */
  providers: { google: boolean; apple: boolean };

  init: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (email: string, password: string, name: string, inviteCode?: string) => Promise<boolean>;
  /** בדיקת קוד הזמנה לפני שיש חשבון — למסך הכניסה */
  previewInvite: (code: string) => Promise<InvitePreview>;
  signOut: () => Promise<void>;
  refreshAccount: () => Promise<void>;
  redeemCode: (code: string) => Promise<{ ok: boolean; message: string }>;
  clearError: () => void;
}

/** מיפוי שגיאות Supabase לעברית — ילד או הורה לא צריך לקרוא אנגלית טכנית */
function humanError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return 'המייל או הסיסמה אינם נכונים';
  if (m.includes('user already registered')) return 'המייל הזה כבר רשום — אפשר פשוט להתחבר';
  if (m.includes('password should be at least')) return 'הסיסמה קצרה מדי (לפחות 6 תווים)';
  if (m.includes('unable to validate email')) return 'כתובת המייל אינה תקינה';
  if (m.includes('email not confirmed')) return 'צריך לאשר את המייל לפני הכניסה';
  if (m.includes('provider is not enabled')) return 'שיטת ההתחברות הזו עדיין לא הופעלה';
  if (m.includes('failed to fetch') || m.includes('network')) return 'אין חיבור לרשת כרגע';
  return 'משהו השתבש בהתחברות — ננסה שוב?';
}

export const useAuth = create<AuthState>((set, get) => ({
  ready: false,
  session: null,
  account: null,
  error: null,
  busy: false,
  providers: { google: false, apple: false },

  init: async () => {
    const client = supabase();
    if (!client) {
      // בלי הגדרות ענן פשוט אין התחברות — והמשחק המקומי עובד כרגיל
      set({ ready: true });
      return;
    }
    void availableProviders().then((providers) => set({ providers }));
    const { data } = await client.auth.getSession();
    set({ session: data.session });
    if (data.session) await get().refreshAccount();
    set({ ready: true });

    client.auth.onAuthStateChange((_event, session) => {
      set({ session });
      if (session) void get().refreshAccount();
      else set({ account: null });
    });
  },

  refreshAccount: async () => {
    const client = supabase();
    if (!client) return;
    const { data, error } = await client.rpc('my_account');
    if (error || !data || (Array.isArray(data) && data.length === 0)) return;
    const row = (Array.isArray(data) ? data[0] : data) as {
      id: string;
      email: string | null;
      display_name: string | null;
      role: Role;
      tier: Tier;
      tier_expires_at: string | null;
    };
    set({
      account: {
        id: row.id,
        email: row.email,
        displayName: row.display_name,
        role: row.role,
        tier: tierAfterExpiry(row.tier, row.tier_expires_at),
        tierExpiresAt: row.tier_expires_at
      }
    });
  },

  signInWithGoogle: async () => {
    const client = supabase();
    if (!client) return;
    set({ busy: true, error: null });
    const { error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectTo() }
    });
    if (error) set({ error: humanError(error.message), busy: false });
  },

  signInWithApple: async () => {
    const client = supabase();
    if (!client) return;
    set({ busy: true, error: null });
    const { error } = await client.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: redirectTo() }
    });
    if (error) set({ error: humanError(error.message), busy: false });
  },

  signInWithEmail: async (email, password) => {
    const client = supabase();
    if (!client) return false;
    set({ busy: true, error: null });
    const { error } = await client.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      set({ error: humanError(error.message), busy: false });
      return false;
    }
    await get().refreshAccount();
    set({ busy: false });
    return true;
  },

  signUpWithEmail: async (email, password, name, inviteCode) => {
    const client = supabase();
    if (!client) return false;
    set({ busy: true, error: null });
    const { error } = await client.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name.trim() }, emailRedirectTo: redirectTo() }
    });
    if (error) {
      set({ error: humanError(error.message), busy: false });
      return false;
    }
    // קוד שנבדק במסך הכניסה ממומש עכשיו, כשכבר יש חשבון לשייך אליו.
    // כישלון כאן לא מפיל את ההרשמה: עדיף חשבון בלי שדרוג מאשר ילד
    // שנתקע במסך הכניסה. הקוד נשאר תקף וניתן לממש אותו מהחשבון.
    if (inviteCode?.trim()) await get().redeemCode(inviteCode.trim());
    await get().refreshAccount();
    set({ busy: false });
    return true;
  },

  previewInvite: async (code) => {
    const client = supabase();
    if (!client) return { ok: false, message: 'אין חיבור לשרת' };
    const trimmed = code.trim();
    if (!trimmed) return { ok: false, message: 'צריך להקליד קוד' };
    const { data, error } = await client.rpc('preview_invitation', { invite_code: trimmed });
    if (error) return { ok: false, message: humanError(error.message) };
    const row = (Array.isArray(data) ? data[0] : data) as InvitePreview | undefined;
    return row ?? { ok: false, message: 'לא התקבלה תשובה מהשרת' };
  },

  signOut: async () => {
    const client = supabase();
    if (!client) return;
    await client.auth.signOut();
    set({ session: null, account: null });
  },

  redeemCode: async (code) => {
    const client = supabase();
    if (!client) return { ok: false, message: 'אין חיבור לשרת' };
    const { data, error } = await client.rpc('redeem_invitation', { invite_code: code });
    if (error) return { ok: false, message: humanError(error.message) };
    const row = (Array.isArray(data) ? data[0] : data) as { ok: boolean; message: string } | undefined;
    if (!row) return { ok: false, message: 'לא התקבלה תשובה מהשרת' };
    if (row.ok) await get().refreshAccount();
    return { ok: row.ok, message: row.message };
  },

  clearError: () => set({ error: null })
}));

/** היכולות בפועל של המשתמש הנוכחי. בלי חשבון — החבילה החינמית. */
export function useCapabilities(): TierSpec {
  const account = useAuth((s) => s.account);
  if (!account) return TIERS.free;
  return effectiveTier(account.tier, account.role);
}

/** האם יש בכלל התחברות בסביבה הזו */
export const authAvailable = authConfigured;
