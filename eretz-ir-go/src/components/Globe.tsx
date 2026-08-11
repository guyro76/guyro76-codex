/**
 * כדור הארץ מהחלל.
 *
 * מה שגורם לעיגול להיקרא ככדור הוא לא הציור אלא התאורה: שכבות
 * ההצללה **קבועות** בזמן שהמרקם מסתובב תחתיהן. אם הצל מסתובב יחד עם
 * היבשות, המוח קורא את זה כמדבקה מסתובבת ולא ככוכב לכת.
 *
 * הרכבה, מלמטה למעלה:
 *  1. הילה אטמוספרית רכה מסביב לדיסקה
 *  2. אוקיינוס עם עומק
 *  3. רצועת יבשות מסתובבת
 *  4. רצועת עננים מסתובבת לאט יותר — ההפרש במהירות הוא מה שיוצר
 *     תחושת נפח (פרלקסה) ולא שתי שכבות שטוחות
 *  5. טרמינטור: החושך שנשאר במקומו בצד שאינו מואר
 *  6. אור שפה דק בקצה המואר — האטמוספרה שתופסת את האור
 *  7. נצנוץ ספקולרי על האוקיינוס
 *
 * הכול SVG ואנימציות CSS: אין קובץ להוריד, עובד אופליין, ולא רץ
 * שום JavaScript בלולאה.
 */
export default function Globe({ size = 200 }: { size?: number }) {
  return (
    <div className="globe-wrap" style={{ width: size, height: size }} role="img" aria-label="כדור הארץ מסתובב">
      <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden focusable="false">
        <defs>
          <clipPath id="g-clip">
            <circle cx="60" cy="60" r="48" />
          </clipPath>

          {/* אוקיינוס: בהיר במקום שאליו מגיע האור, כהה מאוד בהיפוכו */}
          <radialGradient id="g-ocean" cx="34%" cy="28%" r="86%">
            <stop offset="0%" stopColor="#8fd8ff" />
            <stop offset="30%" stopColor="#3f9fe8" />
            <stop offset="68%" stopColor="#1459b6" />
            <stop offset="100%" stopColor="#062a63" />
          </radialGradient>

          <linearGradient id="g-land" x1="0" y1="0" x2="0.3" y2="1">
            <stop offset="0%" stopColor="#8ef0a6" />
            <stop offset="45%" stopColor="#3fbe6d" />
            <stop offset="100%" stopColor="#1d7a47" />
          </linearGradient>

          {/* הטרמינטור — הצל שנשאר במקומו ונותן את כל תחושת הכדוריות */}
          <radialGradient id="g-shade" cx="32%" cy="26%" r="82%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0" />
            <stop offset="52%" stopColor="#000814" stopOpacity="0.12" />
            <stop offset="78%" stopColor="#000814" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#00050f" stopOpacity="0.88" />
          </radialGradient>

          {/* אור שפה: טבעת דקה שבוהקת רק בצד המואר */}
          <radialGradient id="g-rim" cx="50%" cy="50%" r="50%">
            <stop offset="88%" stopColor="#bfe9ff" stopOpacity="0" />
            <stop offset="97%" stopColor="#cdefff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#eaf8ff" stopOpacity="0.9" />
          </radialGradient>

          {/* ההילה האטמוספרית מחוץ לדיסקה */}
          <radialGradient id="g-glow" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="#4fb8ff" stopOpacity="0" />
            <stop offset="86%" stopColor="#59c2ff" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#7fd4ff" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="g-spec" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. הילה */}
        <circle cx="60" cy="60" r="59" fill="url(#g-glow)" />

        {/* 2. אוקיינוס */}
        <circle cx="60" cy="60" r="48" fill="url(#g-ocean)" />

        <g clipPath="url(#g-clip)">
          {/* 3. יבשות — הרצועה כפולת רוחב זזה בדיוק חצי, כך שהתפר נעלם */}
          <g className="globe-land">
            {[0, 120].map((dx) => (
              <g key={dx} transform={`translate(${dx} 0)`} fill="url(#g-land)">
                {/* אירופה */}
                <path d="M30 30 q7-4 13-1 q5 3 1 7 q-5 4-11 2 q-5-2-3-8z" />
                {/* אפריקה */}
                <path d="M31 42 q10-3 15 3 q4 6-1 12 q-3 8-8 14 q-4 6-7-1 q-3-9 0-17 q1-7-3-11z" />
                {/* אסיה */}
                <path d="M50 26 q16-6 28 2 q9 6 2 12 q-8 6-18 4 q-9-2-13 3 q-5 5-7-1 q-3-9 3-15z" />
                {/* הודו */}
                <path d="M62 44 q7-2 9 3 q1 6-4 10 q-4 3-6-2 q-2-7 1-11z" />
                {/* אוסטרליה */}
                <path d="M78 66 q10-4 15 3 q3 7-4 10 q-9 3-13-3 q-3-7 2-10z" />
                {/* צפון אמריקה */}
                <path d="M96 28 q12-4 17 4 q3 7-4 11 q-6 3-5 9 q0 6-5 8 q-5 1-7-5 q-2-8 2-14 q3-7-2-10z" />
                {/* דרום אמריקה */}
                <path d="M104 56 q8-2 10 5 q1 8-3 15 q-3 7-6 12 q-3 4-5-2 q-2-8 1-15 q2-7-1-11z" />
              </g>
            ))}
          </g>

          {/* 4. עננים — לאט יותר מהיבשות, וזה מה שנותן עומק */}
          <g className="globe-clouds" fill="#ffffff" opacity="0.34">
            {[0, 120].map((dx) => (
              <g key={dx} transform={`translate(${dx} 0)`}>
                <ellipse cx="22" cy="36" rx="14" ry="4.5" />
                <ellipse cx="46" cy="52" rx="17" ry="4" />
                <ellipse cx="70" cy="32" rx="12" ry="4" />
                <ellipse cx="88" cy="60" rx="16" ry="4.5" />
                <ellipse cx="106" cy="44" rx="11" ry="3.6" />
                <ellipse cx="58" cy="76" rx="15" ry="4" />
              </g>
            ))}
          </g>

          {/* 5. טרמינטור — לא מסתובב */}
          <circle cx="60" cy="60" r="48" fill="url(#g-shade)" />

          {/* 7. נצנוץ על האוקיינוס, בזווית האור */}
          <ellipse cx="42" cy="40" rx="15" ry="10" fill="url(#g-spec)" transform="rotate(-28 42 40)" />
        </g>

        {/* 6. אור השפה */}
        <circle cx="60" cy="60" r="48" fill="url(#g-rim)" />
      </svg>
    </div>
  );
}
