import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '..');
const podium = readFileSync(resolve(root, 'src/components/Podium.tsx'), 'utf8');
const results = readFileSync(resolve(root, 'src/screens/MatchResults.tsx'), 'utf8');
const css = readFileSync(resolve(root, 'src/styles/global.css'), 'utf8');

describe('פודיום הזוכים', () => {
  /**
   * הסדר על הפודיום הוא אולימפי — שני, ראשון, שלישי — ולא סדר
   * קריאה. אם הוא ייגזר מכיוון הדף, בעברית המנצח יזוז מהמרכז.
   */
  it('הסדר נקבע בקוד ולא נגזר מכיוון הדף', () => {
    expect(podium).toContain('[1, 0, 2]');
    expect(css).toContain('direction: ltr');
  });

  it('מקום ראשון גבוה מהשני, והשני מהשלישי', () => {
    const h = (cls: string) => {
      const m = css.match(new RegExp(`\\.place-${cls} \\.podium-step \\{[^}]*height: (\\d+)px`));
      return m ? Number(m[1]) : 0;
    };
    expect(h('1')).toBeGreaterThan(h('2'));
    expect(h('2')).toBeGreaterThan(h('3'));
  });

  /**
   * המדרגה היא רקע בהיר. כלל הברזל דורש עליה כתב כהה ומודגש —
   * מספר לבן על זהב פשוט לא נקרא.
   */
  it('המספר על המדרגה כהה ומודגש מעל הרקע הבהיר', () => {
    const step = css.slice(css.indexOf('.podium-step {'), css.indexOf('.place-1 .podium-step'));
    expect(step).toMatch(/color: #2[0-9a-f]{5}/i);
    expect(step).toMatch(/font-weight: 900/);
  });

  /**
   * פחות משלושה שחקנים זה מצב רגיל לגמרי (דו-קרב), ואסור שייווצרו
   * מדרגות ריקות או קריסה על אינדקס שלא קיים.
   */
  it('מסתדר גם עם פחות משלושה שחקנים', () => {
    expect(podium).toContain('players.slice(0, 3)');
    expect(podium).toContain('filter((i) => i < top.length)');
  });

  /**
   * שלושה מצבים שבהם דירוג הוא שקר: שיתוף פעולה (אין מקומות), משחק
   * יחיד (אין מול מי), ותיקו — שם פודיום היה מציב אחד מהשניים על
   * המדרגה הגבוהה בזמן שהמסך אומר מעליו "שניכם אלופים".
   */
  it('לא מוצג בשיתוף פעולה, במשחק יחיד או בתיקו', () => {
    expect(results).toContain('!game.coop && !isTie && sorted.length > 1 && <Podium');
  });

  /** בחדר רואים את השמות — זו כל הנקודה של פודיום */
  it('מציג שם וניקוד לכל זוכה', () => {
    expect(podium).toContain('p.profile.name');
    expect(podium).toContain('p.totalScore');
  });

  /** משחק של חמישה לא אמור להעלים את הרביעי והחמישי */
  it('מי שמעבר לשלישייה עדיין מופיע ברשימה מתחת', () => {
    expect(results).toContain('`${i + 1}.`');
  });
});
