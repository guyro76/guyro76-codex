/**
 * שכבת Multiplayer Provider ניתנת להחלפה.
 * המשחק המקומי (solo/duel/coop על אותו מכשיר) עובד תמיד דרך ה-store,
 * ללא שום Provider. משחק מרחוק מחייב CloudRoomProvider עם Backend.
 */

export interface RoomInfo {
  code: string; // קוד חדר קצר (4-6 תווים)
  hostNickname: string;
}

export interface RoomEvent {
  type: 'player-joined' | 'round-started' | 'player-finished' | 'round-results' | 'player-left';
  payload: unknown;
}

export interface MultiplayerProvider {
  readonly kind: 'local' | 'same-device' | 'cloud';
  createRoom(nickname: string): Promise<RoomInfo>;
  joinRoom(code: string, nickname: string): Promise<RoomInfo>;
  send(event: RoomEvent): Promise<void>;
  onEvent(handler: (ev: RoomEvent) => void): () => void;
  leave(): Promise<void>;
}

/** משחק על מכשיר אחד — אין תקשורת, הכול ב-store */
export class SameDeviceProvider implements MultiplayerProvider {
  readonly kind = 'same-device' as const;
  private handlers: ((ev: RoomEvent) => void)[] = [];

  async createRoom(nickname: string): Promise<RoomInfo> {
    return { code: 'LOCAL', hostNickname: nickname };
  }
  async joinRoom(_code: string, nickname: string): Promise<RoomInfo> {
    return { code: 'LOCAL', hostNickname: nickname };
  }
  async send(event: RoomEvent): Promise<void> {
    for (const h of this.handlers) h(event);
  }
  onEvent(handler: (ev: RoomEvent) => void): () => void {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter((h) => h !== handler);
    };
  }
  async leave(): Promise<void> {
    this.handlers = [];
  }
}

/**
 * CloudRoomProvider — שלד מוכן לחיבור Supabase Realtime.
 * מופעל רק כאשר קיימים משתני סביבה (ראו env.example); אין מפתחות בקוד.
 */
export function cloudConfigured(): boolean {
  return Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
}
