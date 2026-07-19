# העלאה לחנויות — Google Play ו-App Store

המשחק הוא PWA מלאה, ולכן יש שני מסלולים מקבילים. `capacitor.config.json` כבר כלול בפרויקט.

## שלב 0 — פריסת גרסת web (נדרש לשני המסלולים)

```bash
npm run build          # יוצר dist/
# פרסו את dist/ לדומיין HTTPS קבוע, למשל Vercel/Netlify:
npx vercel deploy dist --prod
```

## מסלול A — Google Play דרך TWA (הקל ביותר, מומלץ להתחלה)

Trusted Web Activity עוטף את ה-PWA הפרוסה באפליקציית אנדרואיד אמיתית:

```bash
npm i -g @bubblewrap/cli
bubblewrap init --manifest https://YOUR-DOMAIN/manifest.webmanifest
bubblewrap build       # מפיק app-release-signed.apk / .aab
```

- ההתאמות שכבר קיימות בפרויקט: manifest מלא, אייקון maskable 512, Service Worker, Offline.
- נדרש: חשבון Google Play Console (25$ חד-פעמי), קובץ `assetlinks.json` בדומיין (bubblewrap מייצר אותו).
- דירוג תוכן: האפליקציה מתאימה ל"מיועד לילדים ולכל המשפחה" — אין פרסומות, אין רכישות, אין איסוף מידע.

## מסלול B — Capacitor (App Store + Google Play מאותו קוד)

```bash
npm i -D @capacitor/cli @capacitor/core @capacitor/ios @capacitor/android
npx cap add android && npx cap add ios
npm run build && npx cap sync
npx cap open android   # Android Studio -> Build AAB
npx cap open ios       # Xcode -> Archive (נדרש Mac + Apple Developer, 99$/שנה)
```

`capacitor.config.json` כבר מוגדר (`com.eretzir.go`). ב-Capacitor האפליקציה רצה עם הקבצים המקומיים — עובדת גם בלי אינטרנט מהתקנה ראשונה.

## דרישות חנות שכדאי להכין מראש

| דרישה | סטטוס |
|---|---|
| מדיניות פרטיות (URL ציבורי) | יש מסך פרטיות באפליקציה — יש לפרסם עותק גם כעמוד web |
| הצהרת בטיחות ילדים (Play Families / Apple Kids) | אין איסוף מידע, אין צ'אט, אין פרסומות — עומד בדרישות |
| צילומי מסך (טלפון + טאבלט) | להפיק מ-`npm run preview` |
| אייקון 512×512 + Feature Graphic 1024×500 | `public/icons/icon-512.png` קיים; Feature Graphic להכין בהמשך |
| Data Safety Form (Google) | "No data collected" — הכול מקומי במכשיר |

## מונטיזציה עתידית (אם תרצו)

המבנה תומך בהוספת "חבילת פרימיום" בלי שרת: דגל `premium` ב-settings שנפתח דרך רכישה ב-Capacitor (`@capacitor-community/in-app-purchases`) או Play Billing ב-TWA. מועמדים טבעיים לפרימיום: ערכות נושא, אווטארים נוספים, קלפי כוח מורחבים וחבילות תוכן מיוחדות. חשוב: לפי כללי החנויות לילדים, רכישות חייבות שער הורים (Parental Gate) — מסך ההורה עם ה-PIN הקיים משמש בדיוק לזה.
