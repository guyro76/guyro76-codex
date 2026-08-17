import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/db/db', () => ({ getSetting: () => Promise.resolve(null) }));

let mode: 'all' | 'sfx' | 'none' = 'all';
vi.mock('../src/lib/sound', () => ({
  getAudioMode: () => mode,
  onAudioModeChange: () => () => {}
}));

const { canSpeak, letterSpeech, setReadAloud, speak, stopSpeaking } = await import('../src/lib/speak');

class FakeSynth {
  spoken: string[] = [];
  cancelled = 0;
  speak(u: { text: string }) {
    this.spoken.push(u.text);
  }
  cancel() {
    this.cancelled++;
  }
  getVoices() {
    return [{ lang: 'he-IL', name: 'Carmit' }];
  }
}

let synth: FakeSynth;

beforeEach(() => {
  synth = new FakeSynth();
  mode = 'all';
  const w = globalThis as unknown as Record<string, unknown>;
  w.window = { speechSynthesis: synth };
  w.SpeechSynthesisUtterance = class {
    text: string;
    lang = '';
    rate = 1;
    pitch = 1;
    voice: unknown = null;
    constructor(text: string) {
      this.text = text;
    }
  };
  setReadAloud(false);
});

describe('הקראה בקול', () => {
  it('שם האות ולא התו הבודד', () => {
    expect(letterSpeech('א')).toBe('אלף');
    expect(letterSpeech('ש')).toBe('שין');
    // אות שאינה במפה נאמרת כמות שהיא ולא מפילה כלום
    expect(letterSpeech('ם')).toBe('ם');
  });

  it('לכל אות משחק יש שם קריא', () => {
    const letters = 'אבגדהוזחטיכלמנסעפצקרשת'.split('');
    for (const l of letters) expect(letterSpeech(l)).not.toBe(l);
  });

  it('כשההקראה כבויה — שקט מוחלט', () => {
    speak('שלום');
    expect(synth.spoken).toEqual([]);
  });

  it('כשההקראה דלוקה — הטקסט נאמר', () => {
    setReadAloud(true);
    speak('ארץ');
    expect(synth.spoken).toEqual(['ארץ']);
  });

  it('השתקה מלאה גוברת על ההקראה', () => {
    setReadAloud(true);
    mode = 'none';
    speak('ארץ');
    expect(synth.spoken).toEqual([]);
  });

  it('מצב "בלי מוזיקה" עדיין מקריא — ההקראה היא נגישות ולא רעש רקע', () => {
    setReadAloud(true);
    mode = 'sfx';
    speak('חי');
    expect(synth.spoken).toEqual(['חי']);
  });

  it('הקראה חדשה מבטלת את הקודמת', () => {
    setReadAloud(true);
    speak('ארץ');
    speak('עיר');
    expect(synth.cancelled).toBeGreaterThanOrEqual(2);
    expect(synth.spoken).toEqual(['ארץ', 'עיר']);
  });

  it('טקסט ריק לא מפעיל כלום', () => {
    setReadAloud(true);
    speak('   ');
    expect(synth.spoken).toEqual([]);
  });

  it('כיבוי ההקראה משתיק מיד', () => {
    setReadAloud(true);
    setReadAloud(false);
    expect(synth.cancelled).toBeGreaterThan(0);
  });

  it('canSpeak ו-stopSpeaking לא מתפוצצים כשאין תמיכה', () => {
    (globalThis as unknown as Record<string, unknown>).window = {};
    expect(canSpeak()).toBe(false);
    expect(() => stopSpeaking()).not.toThrow();
    expect(() => speak('בדיקה')).not.toThrow();
  });
});

/**
 * הבטחת הפרטיות של הפיצ'ר: מוקראים רק טקסטים של המשחק. תשובה
 * שהילד הקליד לא נאמרת ברמקול — לא בבית, ולא בכיתה.
 */
describe('מה שהילד כותב לא מוקרא', () => {
  const srcDir = resolve(__dirname, '../src');

  const walk = (dir: string): string[] =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory()
        ? walk(resolve(dir, e.name))
        : /\.tsx?$/.test(e.name)
          ? [resolve(dir, e.name)]
          : []
    );

  it('אף קריאה ל-speak לא מקבלת טקסט של המשתמש', () => {
    /**
     * שמות משתנים שמכילים קלט חופשי.
     *
     * `category.name` מותר במכוון — זו התווית שהמשחק מציג ממילא,
     * וההקראה שלה היא כל מטרת הפיצ'ר. מה שאסור הוא מה שהוקלד:
     * תשובה, טיוטה, ערך של שדה, ושמות של אנשים.
     */
    const forbidden =
      /\bspeak\([^)]*\b(text|answer|draft|value|input|displayName|fullName|profile\.name)\b/;
    const offenders: string[] = [];

    for (const file of walk(srcDir)) {
      if (file.endsWith('lib/speak.ts')) continue;
      const body = readFileSync(file, 'utf8');
      for (const [i, line] of body.split('\n').entries()) {
        if (forbidden.test(line)) offenders.push(`${file}:${i + 1}`);
      }
    }

    expect(offenders, `הקראה של קלט משתמש ב:\n${offenders.join('\n')}`).toEqual([]);
  });

  it('השדה שבו מקלידים תשובה לא מפעיל הקראה', () => {
    const card = readFileSync(resolve(srcDir, 'components/CategoryCard.tsx'), 'utf8');
    const inputBlock = card.slice(card.indexOf('<input'), card.indexOf('</div>', card.indexOf('<input')));
    expect(inputBlock).not.toContain('speak');
  });
});
