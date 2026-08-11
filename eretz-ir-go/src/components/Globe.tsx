/**
 * כדור הארץ המסתובב של מסך הכניסה.
 *
 * הכול SVG בתוך הקוד: אין קובץ תמונה להוריד, זה עובד גם אופליין,
 * והסיבוב הוא אנימציית CSS אחת ולא לולאת JavaScript — כך שהוא לא
 * גוזל סוללה ולא נתקע כשהלשונית ברקע.
 *
 * היבשות מצוירות פעמיים בזו אחר זו ברצועה כפולת רוחב, והרצועה נעה
 * בדיוק חצי מרוחבה — כך התפר בין הסוף להתחלה בלתי נראה והסיבוב
 * נראה אינסופי.
 */
export default function Globe({ size = 190 }: { size?: number }) {
  return (
    <div
      className="globe-wrap"
      style={{ width: size, height: size }}
      role="img"
      aria-label="כדור הארץ מסתובב"
    >
      <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden focusable="false">
        <defs>
          <clipPath id="globe-clip">
            <circle cx="50" cy="50" r="46" />
          </clipPath>

          {/* האוקיינוס */}
          <radialGradient id="ocean" cx="35%" cy="30%" r="80%">
            <stop offset="0%" stopColor="#7fd4ff" />
            <stop offset="55%" stopColor="#3aa7f0" />
            <stop offset="100%" stopColor="#1c4fb8" />
          </radialGradient>

          {/* הצללה שנותנת נפח לכדור */}
          <radialGradient id="shade" cx="32%" cy="28%" r="78%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.42" />
            <stop offset="45%" stopColor="#ffffff" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#04122e" stopOpacity="0.55" />
          </radialGradient>

          <linearGradient id="land" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7ef2a8" />
            <stop offset="100%" stopColor="#31b96b" />
          </linearGradient>
        </defs>

        {/* הילה */}
        <circle cx="50" cy="50" r="49" fill="#7fd4ff" opacity="0.16" />
        <circle cx="50" cy="50" r="46" fill="url(#ocean)" />

        <g clipPath="url(#globe-clip)">
          <g className="globe-spin">
            {[0, 100].map((shift) => (
              <g key={shift} transform={`translate(${shift} 0)`} fill="url(#land)">
                {/* אפריקה + אירופה */}
                <path d="M18 30 q8-6 15-2 q6 3 3 9 q-2 5 2 8 q5 4 2 11 q-3 8-9 12 q-6 4-9-3 q-3-8-1-16 q1-7-4-11 q-4-4 1-8z" />
                {/* אסיה */}
                <path d="M44 22 q14-5 25 2 q8 5 3 11 q-6 6-16 5 q-8-1-12 4 q-4 4-7 0 q-4-6 1-12 q3-6 6-10z" />
                {/* אוסטרליה */}
                <path d="M62 62 q9-4 14 2 q4 6-3 9 q-8 4-12-2 q-3-6 1-9z" />
                {/* אמריקה */}
                <path d="M84 26 q10-3 14 4 q3 6-3 10 q-5 3-4 9 q1 8-5 14 q-5 5-8-2 q-2-7 2-13 q3-6-1-11 q-4-5 5-11z" />
              </g>
            ))}
          </g>
        </g>

        {/* ברק וצל מעל הכול, כדי שהכדור ייראה עגול ולא שטוח */}
        <circle cx="50" cy="50" r="46" fill="url(#shade)" />
        <circle cx="50" cy="50" r="46" fill="none" stroke="#bfe9ff" strokeOpacity="0.5" strokeWidth="0.8" />
      </svg>
    </div>
  );
}
