import type { ReactElement } from 'react';

/**
 * האיורים של הפאזלים.
 *
 * למה איור ולא צילום: פאזל חייב תמיד להתחבר לתמונה שלמה. תמונה
 * שמגיעה מהרשת עלולה לא להגיע — אין קליטה, הערך השתנה, שער האימות
 * פסל מועמד — ואז הילד אוסף תשעה חלקים ומקבל לוח ריק. האיורים
 * נמצאים בתוך החבילה, ולכן הפאזל תמיד מסתדר, גם במטוס.
 *
 * הם מסומנים כאיור ולא כצילום, ולכן אינם נוגדים את הכלל על תמונות
 * עובדתיות. הצילום האמיתי מוויקיפדיה מוצג בנוסף, כשהוא זמין,
 * ומסומן כצילום עם קרדיט וקישור למקור.
 *
 * כל סצנה מצוירת ב-viewBox של 300×200 (יחס 3:2) או 300×300 (3:3)
 * לפי מידות הלוח, כדי שהחיתוך למשבצות ייפול על גבולות נקיים.
 */
export interface SceneProps {
  /** מספר עמודות ושורות של הלוח — קובע את יחס ה-viewBox */
  cols: number;
  rows: number;
}

const SKY = (id: string, from: string, to: string) => (
  <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stopColor={from} />
    <stop offset="100%" stopColor={to} />
  </linearGradient>
);

/** מצדה — צוק מבודד מעל המדבר, בזריחה */
function Masada({ w, h }: { w: number; h: number }) {
  return (
    <>
      <defs>{SKY('sky-masada', '#f7b267', '#f4845f')}</defs>
      <rect width={w} height={h} fill="url(#sky-masada)" />
      <circle cx={w * 0.76} cy={h * 0.24} r={h * 0.11} fill="#ffe9a8" />
      {/* רכסי רקע */}
      <path d={`M0 ${h * 0.62} L${w * 0.22} ${h * 0.48} L${w * 0.4} ${h * 0.6} L${w * 0.62} ${h * 0.44} L${w} ${h * 0.62} L${w} ${h} L0 ${h}Z`} fill="#c96f4a" opacity="0.55" />
      {/* צוק מצדה — מישורי בראשו, תלול בצדדים */}
      <path d={`M${w * 0.24} ${h * 0.95} L${w * 0.34} ${h * 0.52} L${w * 0.66} ${h * 0.5} L${w * 0.78} ${h * 0.95}Z`} fill="#a8552f" />
      <path d={`M${w * 0.34} ${h * 0.52} L${w * 0.66} ${h * 0.5} L${w * 0.64} ${h * 0.56} L${w * 0.36} ${h * 0.58}Z`} fill="#d98b5c" />
      {/* שרידי המבנים בראש הצוק */}
      <rect x={w * 0.42} y={h * 0.44} width={w * 0.07} height={h * 0.08} fill="#e7c39b" />
      <rect x={w * 0.53} y={h * 0.46} width={w * 0.05} height={h * 0.06} fill="#e7c39b" />
      {/* המדבר למרגלות */}
      <path d={`M0 ${h * 0.9} Q${w * 0.5} ${h * 0.82} ${w} ${h * 0.9} L${w} ${h} L0 ${h}Z`} fill="#e0a86b" />
    </>
  );
}

/** ים המלח — מים תכולים, מלח לבן וההרים שמעבר */
function DeadSea({ w, h }: { w: number; h: number }) {
  return (
    <>
      <defs>{SKY('sky-dead', '#bfe6f2', '#f2e2c4')}</defs>
      <rect width={w} height={h} fill="url(#sky-dead)" />
      <path d={`M0 ${h * 0.5} L${w * 0.3} ${h * 0.38} L${w * 0.55} ${h * 0.47} L${w * 0.8} ${h * 0.36} L${w} ${h * 0.48} L${w} ${h * 0.58} L0 ${h * 0.58}Z`} fill="#9c8272" />
      <rect x="0" y={h * 0.58} width={w} height={h * 0.42} fill="#4aa3c4" />
      {/* פסי אור על המים */}
      {[0.66, 0.74, 0.82].map((y, i) => (
        <rect key={y} x={w * (0.08 + i * 0.14)} y={h * y} width={w * 0.34} height={h * 0.015} fill="#bfe8f5" opacity="0.8" />
      ))}
      {/* גושי מלח */}
      <ellipse cx={w * 0.24} cy={h * 0.86} rx={w * 0.13} ry={h * 0.05} fill="#f4f7f7" />
      <ellipse cx={w * 0.62} cy={h * 0.93} rx={w * 0.17} ry={h * 0.05} fill="#eef4f4" />
      <ellipse cx={w * 0.86} cy={h * 0.8} rx={w * 0.09} ry={h * 0.035} fill="#f4f7f7" />
    </>
  );
}

/** הכנרת — אגם בין גבעות ירוקות, סירת דיג */
function Kinneret({ w, h }: { w: number; h: number }) {
  return (
    <>
      <defs>{SKY('sky-kin', '#7fc7e8', '#cfe9d6')}</defs>
      <rect width={w} height={h} fill="url(#sky-kin)" />
      <circle cx={w * 0.2} cy={h * 0.18} r={h * 0.07} fill="#fff4c2" />
      <path d={`M0 ${h * 0.52} Q${w * 0.2} ${h * 0.38} ${w * 0.45} ${h * 0.5} Q${w * 0.7} ${h * 0.6} ${w} ${h * 0.44} L${w} ${h * 0.6} L0 ${h * 0.6}Z`} fill="#6f9e63" />
      <path d={`M${w * 0.5} ${h * 0.5} Q${w * 0.75} ${h * 0.4} ${w} ${h * 0.46} L${w} ${h * 0.6} L${w * 0.5} ${h * 0.6}Z`} fill="#57834c" />
      <rect x="0" y={h * 0.6} width={w} height={h * 0.4} fill="#2f86b5" />
      {[0.7, 0.78, 0.87].map((y, i) => (
        <rect key={y} x={w * (0.05 + i * 0.2)} y={h * y} width={w * 0.4} height={h * 0.012} fill="#9fd8ef" opacity="0.75" />
      ))}
      {/* סירה */}
      <path d={`M${w * 0.56} ${h * 0.74} L${w * 0.74} ${h * 0.74} L${w * 0.7} ${h * 0.8} L${w * 0.6} ${h * 0.8}Z`} fill="#4a3423" />
      <path d={`M${w * 0.65} ${h * 0.74} L${w * 0.65} ${h * 0.6} L${w * 0.73} ${h * 0.74}Z`} fill="#fdfcf7" />
    </>
  );
}

/** מכתש רמון — מבט מהמצפה: דופן מדורגת בחזית ומישור מכתש שמשתפל אל האופק */
function Ramon({ w, h }: { w: number; h: number }) {
  return (
    <>
      <defs>{SKY('sky-ramon', '#7fa8cc', '#f0d5ab')}</defs>
      <rect width={w} height={h} fill="url(#sky-ramon)" />
      {/* הדופן הרחוקה של המכתש — קשת שמקיפה את האופק */}
      <path
        d={`M0 ${h * 0.46} Q${w * 0.5} ${h * 0.3} ${w} ${h * 0.46} L${w} ${h * 0.56} Q${w * 0.5} ${h * 0.42} 0 ${h * 0.56}Z`}
        fill="#8a5a3c"
      />
      {/* קרקעית המכתש, בהירה ופתוחה */}
      <path d={`M0 ${h * 0.56} Q${w * 0.5} ${h * 0.42} ${w} ${h * 0.56} L${w} ${h} L0 ${h}Z`} fill="#e3bd8c" />
      {/* גבעות בתוך המכתש, קטנות ורחוקות */}
      <path d={`M${w * 0.16} ${h * 0.68} L${w * 0.27} ${h * 0.58} L${w * 0.38} ${h * 0.68}Z`} fill="#c08a5c" />
      <path d={`M${w * 0.56} ${h * 0.7} L${w * 0.68} ${h * 0.58} L${w * 0.8} ${h * 0.7}Z`} fill="#b57c4f" />
      {/* ערוצי נחלים */}
      <path d={`M${w * 0.1} ${h} Q${w * 0.35} ${h * 0.82} ${w * 0.52} ${h * 0.72}`} stroke="#c9a173" strokeWidth={h * 0.02} fill="none" />
      <path d={`M${w * 0.9} ${h} Q${w * 0.7} ${h * 0.84} ${w * 0.58} ${h * 0.74}`} stroke="#c9a173" strokeWidth={h * 0.02} fill="none" />
      {/* המצוק שעליו עומדים — שכבות סלע בחזית התמונה */}
      <path d={`M0 ${h * 0.84} L${w * 0.34} ${h * 0.9} L${w * 0.34} ${h} L0 ${h}Z`} fill="#8f5836" />
      <path d={`M0 ${h * 0.9} L${w * 0.34} ${h * 0.95} L${w * 0.34} ${h} L0 ${h}Z`} fill="#71432a" />
    </>
  );
}

/** עין גדי — מפל ונחל בלב המדבר */
function EinGedi({ w, h }: { w: number; h: number }) {
  return (
    <>
      <defs>{SKY('sky-gedi', '#a9d8ec', '#e3cfa4')}</defs>
      <rect width={w} height={h} fill="url(#sky-gedi)" />
      <path d={`M0 ${h * 0.3} L${w * 0.45} ${h * 0.22} L${w} ${h * 0.34} L${w} ${h} L0 ${h}Z`} fill="#c19a6b" />
      <path d={`M${w * 0.3} ${h * 0.3} L${w * 0.62} ${h * 0.26} L${w * 0.62} ${h} L${w * 0.3} ${h}Z`} fill="#a87f52" />
      {/* המפל */}
      <rect x={w * 0.44} y={h * 0.3} width={w * 0.07} height={h * 0.52} fill="#dff2fb" />
      <ellipse cx={w * 0.475} cy={h * 0.84} rx={w * 0.16} ry={h * 0.07} fill="#5ab4d6" />
      {/* צמחייה */}
      <circle cx={w * 0.2} cy={h * 0.72} r={h * 0.11} fill="#4f8f45" />
      <circle cx={w * 0.32} cy={h * 0.8} r={h * 0.08} fill="#63a556" />
      <circle cx={w * 0.76} cy={h * 0.7} r={h * 0.12} fill="#4f8f45" />
      <circle cx={w * 0.88} cy={h * 0.8} r={h * 0.08} fill="#63a556" />
    </>
  );
}

/** ראש הנקרה — צוק הגיר הלבן יורד לים, ובתוכו קשת הנקרה */
function RoshHanikra({ w, h }: { w: number; h: number }) {
  return (
    <>
      <defs>{SKY('sky-nikra', '#57b0d8', '#c9ecf6')}</defs>
      <rect width={w} height={h} fill="url(#sky-nikra)" />
      {/* הים ממלא את התחתית */}
      <rect x="0" y={h * 0.52} width={w} height={h * 0.48} fill="#1d78a3" />
      {/* גוש הגיר: אנכי מצד אחד ומשתפל אל הים */}
      <path
        d={`M0 ${h * 0.08} L${w * 0.5} ${h * 0.16} Q${w * 0.68} ${h * 0.4} ${w * 0.6} ${h * 0.9} L0 ${h * 0.92}Z`}
        fill="#efe9da"
      />
      {/* פאה מוארת */}
      <path d={`M0 ${h * 0.08} L${w * 0.5} ${h * 0.16} Q${w * 0.56} ${h * 0.3} ${w * 0.52} ${h * 0.4} L0 ${h * 0.36}Z`} fill="#fcfaf3" />
      {/* קשת הנקרה — פתח גבוה שהים נכנס דרכו */}
      <path d={`M${w * 0.12} ${h * 0.92} L${w * 0.12} ${h * 0.66} Q${w * 0.27} ${h * 0.42} ${w * 0.42} ${h * 0.66} L${w * 0.42} ${h * 0.92}Z`} fill="#0e3d55" />
      <path d={`M${w * 0.18} ${h * 0.92} L${w * 0.18} ${h * 0.7} Q${w * 0.27} ${h * 0.54} ${w * 0.36} ${h * 0.7} L${w * 0.36} ${h * 0.92}Z`} fill="#2f9dc4" />
      {/* קצף בקו המים */}
      {[0.66, 0.78, 0.9].map((y, i) => (
        <rect key={y} x={w * (0.62 + i * 0.06)} y={h * y} width={w * 0.34} height={h * 0.014} fill="#bfe9f7" opacity="0.9" />
      ))}
      <ellipse cx={w * 0.6} cy={h * 0.9} rx={w * 0.12} ry={h * 0.02} fill="#cdeefb" opacity="0.85" />
    </>
  );
}

/** עכו — חומות הים והכיפות של העיר העתיקה */
function Akko({ w, h }: { w: number; h: number }) {
  return (
    <>
      <defs>{SKY('sky-akko', '#f6c98a', '#f0e0c0')}</defs>
      <rect width={w} height={h} fill="url(#sky-akko)" />
      <rect x="0" y={h * 0.72} width={w} height={h * 0.28} fill="#2f86a8" />
      {/* חומה */}
      <rect x="0" y={h * 0.52} width={w} height={h * 0.22} fill="#cbae83" />
      {[...Array(9)].map((_, i) => (
        <rect key={i} x={(w / 9) * i + w * 0.01} y={h * 0.47} width={w * 0.07} height={h * 0.06} fill="#cbae83" />
      ))}
      {/* כיפה ומינרט */}
      <ellipse cx={w * 0.36} cy={h * 0.42} rx={w * 0.11} ry={h * 0.11} fill="#4f9d8f" />
      <rect x={w * 0.25} y={h * 0.42} width={w * 0.22} height={h * 0.1} fill="#e6d4b0" />
      <rect x={w * 0.62} y={h * 0.2} width={w * 0.05} height={h * 0.32} fill="#e6d4b0" />
      <path d={`M${w * 0.62} ${h * 0.2} L${w * 0.645} ${h * 0.12} L${w * 0.67} ${h * 0.2}Z`} fill="#4f9d8f" />
      {/* סירות בנמל */}
      <path d={`M${w * 0.14} ${h * 0.84} L${w * 0.3} ${h * 0.84} L${w * 0.27} ${h * 0.89} L${w * 0.17} ${h * 0.89}Z`} fill="#3d2c1c" />
      <path d={`M${w * 0.7} ${h * 0.9} L${w * 0.88} ${h * 0.9} L${w * 0.85} ${h * 0.95} L${w * 0.73} ${h * 0.95}Z`} fill="#3d2c1c" />
    </>
  );
}

/** קיסריה — עמודים רומיים מול הים */
function Caesarea({ w, h }: { w: number; h: number }) {
  return (
    <>
      <defs>{SKY('sky-caes', '#8ecae6', '#ffe3b0')}</defs>
      <rect width={w} height={h} fill="url(#sky-caes)" />
      <rect x="0" y={h * 0.6} width={w} height={h * 0.4} fill="#2e8fb0" />
      <rect x="0" y={h * 0.78} width={w} height={h * 0.22} fill="#e3ca9a" />
      {/* שורת עמודים */}
      {[0.12, 0.3, 0.48, 0.66, 0.84].map((x) => (
        <g key={x}>
          <rect x={w * x} y={h * 0.34} width={w * 0.06} height={h * 0.44} fill="#efe3cb" />
          <rect x={w * (x - 0.012)} y={h * 0.3} width={w * 0.084} height={h * 0.05} fill="#dcccae" />
        </g>
      ))}
      {/* אדריכל עליון */}
      <rect x={w * 0.06} y={h * 0.24} width={w * 0.88} height={h * 0.06} fill="#dcccae" />
    </>
  );
}

const SCENES: Record<string, (p: { w: number; h: number }) => ReactElement> = {
  masada: Masada,
  'dead-sea': DeadSea,
  kinneret: Kinneret,
  ramon: Ramon,
  'ein-gedi': EinGedi,
  'rosh-hanikra': RoshHanikra,
  akko: Akko,
  caesarea: Caesarea
};

export function hasScene(puzzleId: string): boolean {
  return puzzleId in SCENES;
}

/**
 * הסצנה כולה כ-SVG אחד. הלוח חותך אותה למשבצות בעזרת מיקום רקע,
 * ולכן היא חייבת להיות תמונה אחת רציפה ולא אוסף של תאים.
 */
export default function PuzzleScene({ puzzleId, cols, rows }: { puzzleId: string } & SceneProps) {
  const Scene = SCENES[puzzleId];
  if (!Scene) return null;
  const w = cols * 100;
  const h = rows * 100;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100%" preserveAspectRatio="none" aria-hidden>
      <Scene w={w} h={h} />
    </svg>
  );
}
