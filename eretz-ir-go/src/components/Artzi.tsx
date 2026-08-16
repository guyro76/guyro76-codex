import { useCallback, useRef, useState } from 'react';
import { BUCKET_CYCLE, BUCKET_PREFIX, pickLine, type ArtziBucket } from '../data/artziLines';
import { sfx } from '../lib/sound';

/**
 * ארצי — הרובוט של המשחק.
 *
 * עד עכשיו הוא היה שורת טקסט קבועה שאי אפשר היה ללחוץ עליה. עכשיו
 * הוא מגיב: מקפץ, מצייץ, ואומר משהו חדש.
 *
 * מה שהוא אומר עבר שכתוב מלא. במקום בדיחות חלשות הוא מחזיק עצות
 * טקטיות שנגזרות מחוקי הניקוד האמיתיים, עובדות על עברית שרלוונטיות
 * ישירות לבחירת מילים, וידע על העולם שקשור לקטגוריות. הוא גם זוכר
 * מה כבר אמר ולא חוזר על עצמו עד שייגמר המאגר.
 */
export default function Artzi() {
  const said = useRef(new Set<string>());
  const turn = useRef(0);

  const first = (): { bucket: ArtziBucket; line: string } => {
    const bucket = BUCKET_CYCLE[0];
    const line = pickLine(bucket, said.current);
    said.current.add(line);
    return { bucket, line };
  };

  const [{ bucket, line }, setContent] = useState(first);
  const [awake, setAwake] = useState(false);

  const poke = useCallback(() => {
    sfx.power();
    turn.current += 1;
    const next = BUCKET_CYCLE[turn.current % BUCKET_CYCLE.length];
    const text = pickLine(next, said.current);
    said.current.add(text);
    setContent({ bucket: next, line: text });

    // מפעילים מחדש את אנימציית הקפיצה גם בלחיצות רצופות
    setAwake(false);
    requestAnimationFrame(() => setAwake(true));
  }, []);

  return (
    <button
      type="button"
      className="card artzi-card"
      onClick={poke}
      aria-label="ארצי — ללחוץ כדי לשמוע עוד"
      style={{ width: '100%', textAlign: 'start' }}
    >
      <span className={`artzi-face${awake ? ' awake' : ''}`} aria-hidden>
        🤖
      </span>{' '}
      <strong>{BUCKET_PREFIX[bucket]}:</strong> <span aria-live="polite">{line}</span>
      <span className="dim artzi-hint"> · לחצו עליי לעוד</span>
    </button>
  );
}
