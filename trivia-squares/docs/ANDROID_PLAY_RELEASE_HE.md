# טריוויה ריבועים — הכנה לגוגל פליי (Android, TWA)

עודכן: 3 בנובמבר 2026. מצב: **מוכן טכנית, ממתין להחלטה ולתשלום של גיא (25$)**. שום דבר לא הוגש ולא שולם.

## מה כבר מוכן באתר (תנאי TWA)
| דרישה | מצב |
|---|---|
| HTTPS ודומיין קבוע | ✓ trivia-squares.vercel.app |
| מניפסט: שם, צבעים, `display:standalone`, `start_url`, `scope` | ✓ `src/app/manifest.ts` (צבעים תואמים לעיצוב החדש) |
| אייקונים 192 ו-512, כולל maskable | ✓ `public/icon-192.png`, `public/icon-512.png` |
| Service worker ופתיחה בלי רשת | ✓ `public/sw.js` (דפים: רשת קודם; קבצי בנייה, גופנים ותמונות: מטמון) |
| תמונת שיתוף, robots, sitemap | ✓ `public/og-image.png`, `/robots.txt`, `/sitemap.xml` |
| ביצועים במובייל (Lighthouse) | נמדד לפני התיקונים: 75. נמדד אחרי: ראו RELEASE_LOG |
| `/.well-known/assetlinks.json` | **ממתין**: נוצר רק אחרי שיש מפתח חתימה (שלב 3 למטה). קובץ שגוי גרוע מקובץ חסר. |

## הדרך החינמית לבניית החבילה
1. **PWABuilder** (כלי חינמי של מיקרוסופט): https://www.pwabuilder.com → להזין את כתובת האתר → Package for stores → Android.
   - Package ID מוצע: `app.vercel.trivia_squares` (אפשר לשנות; אחרי ההעלאה הראשונה לא ניתן לשנות).
   - App name: טריוויה ריבועים · Launcher name: טריוויה.
   - Signing key: "Create new". **לשמור את קובץ המפתח והסיסמאות במקום בטוח מחוץ לריפו** — בלי המפתח אי אפשר לעדכן את האפליקציה לעולם.
2. מורידים את ה-zip. בתוכו `assetlinks.json` עם טביעת האצבע של המפתח.
3. שולחים לי את `assetlinks.json` (לא את המפתח!) — אני מוסיף אותו ל-`public/.well-known/assetlinks.json` ובודק שהוא מוגש נכון.
   - אם משתמשים ב-Play App Signing, צריך להוסיף גם את טביעת האצבע ש-Play Console מציגה (App integrity).
4. **Play Console** (25$ חד-פעמי — דורש את האישור שלך): חשבון אישי דורש תעודה מזהה ואימות במכשיר אנדרואיד.
5. **בדיקה סגורה: 12 בודקים, 14 יום ברציפות** — חובה לחשבונות אישיים חדשים לפני פרסום לכולם.
6. טפסים בקונסולה: דירוג תוכן (IARC), קהל יעד, בטיחות נתונים (למטה), מדיניות פרטיות: https://trivia-squares.vercel.app/privacy

## בטיחות נתונים (טיוטה לטופס)
- נאסף רק בהתחברות מרצון: כתובת מייל ומזהה משתמש (Supabase Auth), כינוי, צבע וסמל, התקדמות במשחק ופרסים וירטואליים.
- ערעורים ודיווחים על שאלות: מזהה אקראי של המכשיר, השאלה והתשובה שנבחרה. בלי פרטים מזהים.
- אין פרסומות באנדרואיד (לפי אפשרות ג' במסמך מודל ההכנסה), אין מכירת נתונים, אין שיתוף עם צד שלישי מעבר לספקי התשתית (Supabase, Vercel).
- הצפנה בתעבורה: כן (HTTPS). מחיקת נתונים: דרך `/account/privacy`.

## קהל יעד — החלטה שלך
המשחק כולל נושאים כמו סרטי דיסני ומתאים למשפחות. אם מסמנים ילדים כחלק מקהל היעד, חלה מדיניות המשפחות של גוגל (פרסומות רק מספקים מאושרים, בלי פרסום מותאם). ההמלצה: 13+ עם הצהרה כנה, ובלי פרסומות באנדרואיד.

## טקסטים לחנות
### תיאור קצר (עד 80 תווים)
- he: מחברים נקודות, עונים על שאלות טריוויה וכובשים ריבועים. 200 שלבים ב-6 שפות.
- en: Connect the dots, answer trivia and capture squares. 200 stages, 6 languages.
- ru: Соединяйте точки, отвечайте на вопросы и захватывайте клетки. 200 этапов.
- fr: Reliez les points, répondez aux questions et gagnez des cases. 200 niveaux.
- ar: صِل النقاط، أجب عن أسئلة المعلومات واستولِ على المربعات. 200 مرحلة.
- es: Une los puntos, responde preguntas y conquista casillas. 200 niveles, 6 idiomas.

### תיאור מלא — עברית
כל קו הוא שאלת טריוויה. מחברים שתי נקודות סמוכות, עונים נכון, והקו נשאר על הלוח. סוגרים ריבוע — הוא שלכם.

• 200 שלבים ב-40 פרקים, מלוח 3×3 ועד 6×6
• שאלות במגוון נושאים: גאוגרפיה של ישראל, גיבורי התנ״ך, ספרות, מוזיקה, סדרות, מדע, ספורט ועוד
• משחק לבד, נגד המחשב, נגד חבר מרחוק או שניים על אותו מכשיר
• משחקי ביניים בין השלבים: גלגל מזל, כרטיס גירוד ועוד
• טעיתם אבל בטוחים שצדקתם? ערערו על התשובה. אם הערעור מתקבל, הקו חוזר אליכם ומקבלים 25 קרדיטים
• 6 שפות: עברית, אנגלית, רוסית, צרפתית, ערבית וספרדית
• משחקים גם בלי חיבור לרשת

### Full description — English
Every line is a trivia question. Connect two neighbouring dots, answer correctly and the line stays on the board. Close a square and it is yours.

• 200 stages in 40 chapters, from 3×3 up to 6×6 boards
• Questions across many topics: geography, history, literature, music, TV series, science, sports and more
• Play solo, against the computer, with a friend online or two players on one device
• Mini-games between stages: a prize wheel, a scratch card and more
• Sure you were right? Appeal the answer. If the appeal is accepted, you get the line back plus 25 credits
• 6 languages: Hebrew, English, Russian, French, Arabic and Spanish
• Works offline too

## צילומי מסך לחנות
טלפון (לפחות 2, עד 8): `docs/store/phone-*.png`. מחשב/טאבלט: `docs/store/tablet-*.png`. נוצרים מהאתר החי אחרי כל פריסה.
