/**
 * כדור הארץ מהחלל.
 *
 * הגרסאות הקודמות נראו כמו מדבקה מסתובבת, ובצדק: עיגול עם ציור זז
 * הוא עדיין עיגול. מה שגורם למוח לקרוא כדור הם ארבעה סימנים, וכולם
 * נמצאים כאן:
 *
 *  1. **הכהיית שוליים** — הקצה כהה לאורך כל ההיקף, לא רק בצד אחד.
 *     זה הסימן החזק ביותר, ובלעדיו שום דבר אחר לא עוזר.
 *  2. **קווי אורך שנדחסים בקצוות** — כל מרידיאן הוא אליפסה שרוחבה
 *     נע בין הרוחב המלא לאפס וחזרה, כל אחת בהיסט זמן משלה. זו
 *     תנועה של גוף מסתובב בתלת ממד, ולא הזזה של תמונה.
 *  3. **תאורה קבועה מעל מרקם שזז** — הצל, אור השפה והנצנוץ אינם
 *     מסתובבים. אם הצל מסתובב יחד עם היבשות, הכול קורס לדיסקה.
 *  4. **הפרש מהירויות בין העננים ליבשות** — פרלקסה, שנותנת עומק.
 *
 * היבשות משורטטות בהיטל מלבני (Equirectangular) לפי קווי אורך ורוחב
 * אמיתיים, ולכן צורתן מזוהה. הרצועה ברוחב כפול וזזה בדיוק חצי,
 * כך שהתפר בין שני העותקים לא נראה לעולם.
 *
 * הכול SVG ואנימציות CSS: אין קובץ להוריד, עובד אופליין לגמרי, ולא
 * רץ שום JavaScript בלולאה — חשוב לסוללה של טלפון.
 */

/** רוחב עולם אחד ביחידות ה-viewBox. שני עותקים = 400 */
const WORLD = 200;

/** קווי האורך. כל אחד מקבל היסט זמן, וביחד הם קליפת כדור מסתובבת */
const MERIDIANS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

/**
 * קווי רוחב: מיקום אנכי ורוחב יחסי. הם אינם מסתובבים — קו רוחב על
 * כדור מסתובב נשאר במקומו, וזה בדיוק מה שמבדיל אותו מקו אורך.
 */
const PARALLELS: [number, number][] = [
  [-58, 0.5],
  [-38, 0.78],
  [-19, 0.94],
  [0, 1],
  [19, 0.94],
  [38, 0.78],
  [58, 0.5]
];

export default function Globe({ size = 220 }: { size?: number }) {
  return (
    <div className="globe-wrap" style={{ width: size, height: size }} role="img" aria-label="כדור הארץ מסתובב">
      <svg viewBox="0 0 200 200" width={size} height={size} aria-hidden focusable="false">
        <defs>
          <clipPath id="g-clip">
            <circle cx="100" cy="100" r="80" />
          </clipPath>

          {/* אוקיינוס: כחול עמוק, בהיר בנקודה שאליה מגיע האור */}
          <radialGradient id="g-ocean" cx="33%" cy="27%" r="82%">
            <stop offset="0%" stopColor="#7fd0ff" />
            <stop offset="26%" stopColor="#2f8fdd" />
            <stop offset="60%" stopColor="#14539f" />
            <stop offset="88%" stopColor="#07285e" />
            <stop offset="100%" stopColor="#03122f" />
          </radialGradient>

          <linearGradient id="g-land" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a8e6a0" />
            <stop offset="38%" stopColor="#4cb96a" />
            <stop offset="72%" stopColor="#2c8a4e" />
            <stop offset="100%" stopColor="#1c6b3e" />
          </linearGradient>

          {/* מדבריות — בלעדיהן היבשות נראות כמו כתם ירוק אחיד */}
          <linearGradient id="g-sand" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e8cf94" />
            <stop offset="100%" stopColor="#c9a86a" />
          </linearGradient>

          {/*
           * הכהיית השוליים. שימו לב שהמרכז שקוף לגמרי והקצה כמעט אטום:
           * זה מה שהופך דיסקה שטוחה לכדור.
           */}
          <radialGradient id="g-limb" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000516" stopOpacity="0" />
            <stop offset="62%" stopColor="#000516" stopOpacity="0" />
            <stop offset="84%" stopColor="#000516" stopOpacity="0.28" />
            <stop offset="95%" stopColor="#00030f" stopOpacity="0.62" />
            <stop offset="100%" stopColor="#000209" stopOpacity="0.9" />
          </radialGradient>

          {/* הטרמינטור: המעבר אל הצד שאינו מואר, קבוע במקומו */}
          <radialGradient id="g-shade" cx="30%" cy="24%" r="86%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0" />
            <stop offset="46%" stopColor="#000814" stopOpacity="0.06" />
            <stop offset="74%" stopColor="#000814" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00030d" stopOpacity="0.8" />
          </radialGradient>

          {/*
           * אור שפה. הטבעת עצמה אחידה, והבהירות שלה נחתכת במסכה
           * לינארית מכיוון האור. קודם היא הוגדרה כגרדיאנט רדיאלי
           * מוסט, וזה הדליק סהרון לבן דווקא בצד החשוך — בדיוק ההפך
           * ממה שקורה כשהשמש מגיעה משמאל למעלה.
           */}
          <radialGradient id="g-rim" cx="50%" cy="50%" r="50%">
            <stop offset="92%" stopColor="#cdeeff" stopOpacity="0" />
            <stop offset="98%" stopColor="#dcf4ff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#f4fcff" stopOpacity="0.95" />
          </radialGradient>

          <linearGradient id="g-lit" x1="0.16" y1="0.06" x2="0.86" y2="0.96">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="46%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="82%" stopColor="#ffffff" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <mask id="g-lit-mask">
            <rect x="0" y="0" width="200" height="200" fill="url(#g-lit)" />
          </mask>

          {/* עננים רכים. בלי הטשטוש הם נקראים כדיסקות אפורות ולא כעננים */}
          <filter id="g-cloud-blur" x="-25%" y="-60%" width="150%" height="220%">
            <feGaussianBlur stdDeviation="2.6" />
          </filter>

          {/* קרח קוטבי שנמוג פנימה, במקום פס לבן חד לרוחב */}
          <linearGradient id="g-ice-n" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f2faff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#f2faff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="g-ice-s" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#f2faff" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#f2faff" stopOpacity="0" />
          </linearGradient>

          {/* ההילה האטמוספרית מחוץ לדיסקה */}
          <radialGradient id="g-glow" cx="50%" cy="50%" r="50%">
            <stop offset="76%" stopColor="#57bdff" stopOpacity="0" />
            <stop offset="86%" stopColor="#5fc4ff" stopOpacity="0.34" />
            <stop offset="94%" stopColor="#7fd4ff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#7fd4ff" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="g-spec" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* הילה אטמוספרית */}
        <circle cx="100" cy="100" r="99" fill="url(#g-glow)" />

        {/* גוף הכדור */}
        <circle cx="100" cy="100" r="80" fill="url(#g-ocean)" />

        <g clipPath="url(#g-clip)">
          {/* יבשות + עננים מסתובבים */}
          <g className="globe-land">
            {[0, WORLD].map((dx) => (
              <Continents key={dx} dx={dx} />
            ))}
          </g>

          <g className="globe-clouds" filter="url(#g-cloud-blur)">
            {[0, WORLD].map((dx) => (
              <Clouds key={dx} dx={dx} />
            ))}
          </g>

          {/* קווי רוחב — קבועים, כי הם אינם משתנים בסיבוב */}
          <g fill="none" stroke="#ffffff" strokeWidth="0.4" opacity="0.13">
            {PARALLELS.map(([offset, width]) => (
              <ellipse
                key={offset}
                cx="100"
                cy={100 + offset}
                rx={80 * width}
                ry={Math.max(2, 80 * width * 0.16)}
              />
            ))}
          </g>

          {/* קווי אורך — כל אחד נדחס לאפס ונפתח, בהיסט זמן משלו */}
          <g className="globe-meridians" fill="none" stroke="#ffffff" strokeWidth="0.45" opacity="0.16">
            {MERIDIANS.map((i) => (
              <ellipse
                key={i}
                cx="100"
                cy="100"
                rx="80"
                ry="80"
                style={{ animationDelay: `${(-26 / MERIDIANS.length) * i}s` }}
              />
            ))}
          </g>

          {/* הצללה — קבועה מעל כל מה שמסתובב */}
          <circle cx="100" cy="100" r="80" fill="url(#g-shade)" />
          <circle cx="100" cy="100" r="80" fill="url(#g-limb)" />

          {/* נצנוץ השמש על האוקיינוס */}
          <ellipse cx="66" cy="60" rx="26" ry="17" fill="url(#g-spec)" transform="rotate(-26 66 60)" />
        </g>

        {/* אור השפה, מעל הכול — ורק בצד שאליו מגיעה השמש */}
        <circle cx="100" cy="100" r="80" fill="url(#g-rim)" mask="url(#g-lit-mask)" />
      </svg>
    </div>
  );
}

/**
 * היבשות בהיטל מלבני. עולם אחד תופס 200 יחידות לרוחב ו-160 לגובה,
 * כלומר x = (קו אורך + 180) / 360 × 200, ו-y = (90 − קו רוחב) / 180 × 160 + 20.
 * הצורות מקורבות בכוונה — הן צריכות להיות מזוהות בקוטר 200 פיקסלים,
 * לא מדויקות קרטוגרפית.
 */
function Continents({ dx }: { dx: number }) {
  return (
    <g transform={`translate(${dx} 0)`}>
      <g fill="url(#g-land)">
        {/* גרינלנד */}
        <path d="M68 30 q12-6 20 1 q6 6 1 12 q-6 7-14 6 q-9-1-10-9 q-1-7 3-10z" />
        {/* צפון אמריקה */}
        <path d="M10 40 q16-9 34-6 q14 2 22 8 q7 5 1 10 q-8 6-12 13 q-3 7-8 10 q-4 3-6 9 q-2 6-6 4 q-5-3-4-10 q1-9-4-14 q-6-6-14-8 q-8-2-8-9 q0-5 5-7z" />
        {/* מרכז אמריקה */}
        <path d="M52 82 q7-2 9 4 q2 5-3 7 q-6 1-8-4 q-1-5 2-7z" />
        {/* דרום אמריקה */}
        <path d="M60 90 q12-4 18 4 q5 7 1 15 q-3 8-4 16 q-1 9-6 17 q-4 6-6-1 q-2-10 0-19 q1-9-4-15 q-5-6-4-12 q0-4 5-5z" />
        {/* אירופה */}
        <path d="M96 40 q10-5 20-2 q9 2 12 8 q3 5-3 8 q-7 3-12 8 q-5 5-10 2 q-6-4-9-11 q-3-8 2-13z" />
        {/* אפריקה */}
        <path d="M92 68 q14-5 26 0 q10 4 12 12 q2 8-4 14 q-4 5-6 13 q-2 9-7 18 q-4 8-8 1 q-4-9-3-19 q1-10-6-16 q-8-6-8-15 q0-6 4-8z" />
        {/* אסיה */}
        <path d="M126 36 q22-9 44-3 q20 5 28 14 q6 7-2 12 q-11 6-24 5 q-13-1-20 6 q-6 6-14 4 q-9-2-12-11 q-3-10-6-16 q-3-7 6-11z" />
        {/* הודו */}
        <path d="M146 62 q10-3 13 4 q2 8-5 15 q-6 6-9-1 q-3-9-1-14 q0-3 2-4z" />
        {/* דרום מזרח אסיה והאיים */}
        <path d="M166 82 q9-3 12 3 q2 6-4 9 q-7 2-10-3 q-2-6 2-9z" />
        {/* אוסטרליה */}
        <path d="M164 110 q14-6 22 3 q6 8-3 14 q-12 6-19-1 q-6-8 0-16z" />
        {/* ניו זילנד */}
        <path d="M190 130 q5-1 6 3 q1 5-3 7 q-4 1-5-4 q-1-5 2-6z" />
      </g>

      {/* מדבריות: סהרה, ערב ואוסטרליה הפנימית */}
      <g fill="url(#g-sand)" opacity="0.6">
        <path d="M96 70 q16-4 28 1 q7 3 5 9 q-3 6-14 7 q-13 1-20-4 q-5-4-4-9 q0-3 5-4z" />
        <path d="M130 70 q9-2 12 3 q2 6-4 9 q-7 2-10-3 q-2-6 2-9z" />
        <path d="M168 114 q10-3 13 3 q2 6-5 8 q-8 2-10-4 q-1-5 2-7z" />
      </g>

      {/* כיפות הקרח — נמוגות פנימה כדי שלא ייראו כמכסה לבן */}
      <rect x="0" y="20" width="200" height="16" fill="url(#g-ice-n)" />
      <rect x="0" y="162" width="200" height="18" fill="url(#g-ice-s)" />
    </g>
  );
}

/** שכבת עננים דלילה. איננה מדויקת — היא רק צריכה לזוז אחרת מהיבשות */
function Clouds({ dx }: { dx: number }) {
  return (
    <g transform={`translate(${dx} 0)`} fill="#ffffff">
      <g opacity="0.34">
        <ellipse cx="18" cy="50" rx="13" ry="4" />
        <ellipse cx="30" cy="54" rx="10" ry="3.4" />
        <ellipse cx="68" cy="86" rx="15" ry="4" />
        <ellipse cx="82" cy="90" rx="11" ry="3.2" />
        <ellipse cx="114" cy="44" rx="12" ry="4" />
        <ellipse cx="126" cy="48" rx="9" ry="3" />
        <ellipse cx="152" cy="94" rx="14" ry="4" />
        <ellipse cx="166" cy="98" rx="10" ry="3.2" />
        <ellipse cx="184" cy="62" rx="10" ry="3.4" />
        <ellipse cx="46" cy="124" rx="14" ry="4" />
        <ellipse cx="60" cy="128" rx="10" ry="3" />
        <ellipse cx="136" cy="138" rx="12" ry="3.6" />
      </g>
      <g opacity="0.2">
        <ellipse cx="44" cy="70" rx="10" ry="3" />
        <ellipse cx="98" cy="110" rx="12" ry="3.2" />
        <ellipse cx="172" cy="36" rx="9" ry="2.8" />
        <ellipse cx="8" cy="100" rx="11" ry="3" />
        <ellipse cx="190" cy="118" rx="10" ry="3" />
      </g>
    </g>
  );
}
