import React, { Component, Suspense, lazy, useEffect, useState, type ReactNode } from 'react';
import { useApp } from './store/appStore';
import { getSetting, repairPhotoAvatars } from './db/db';
import { applySkin, savedSkinId } from './data/skins';
import { loadContentIntoKnowledge, maybeAutoUpdate } from './lib/contentPack';
import { loadUserKnowledge } from './lib/knowledge';
import Splash from './screens/Splash';
import Home from './screens/Home';
import ModeSelect from './screens/ModeSelect';
import Categories from './screens/Categories';
import LetterDraw from './screens/LetterDraw';
import Game from './screens/Game';
import RoundResults from './screens/RoundResults';
import MatchResults from './screens/MatchResults';
import SiteCredit from './components/SiteCredit';
import AppHeader from './components/AppHeader';
import LiveRegion from './components/LiveRegion';
import Login from './screens/Login';
import Globe from './components/Globe';
import { useChallenge } from './store/challengeStore';

/**
 * מסכים שנטענים לפי דרישה.
 *
 * כל שלושים המסכים היו בחבילה אחת של 927KB, וילד על טלפון אנדרואיד
 * זול חיכה לכולם — כולל מסך הניהול, מפת העולם ומשחקי הביניים —
 * לפני שראה את כפתור "בואו נשחק". מה שנשאר למעלה הוא לולאת המשחק
 * עצמה: פתיחה, בית, בחירת מצב, קטגוריות, אות, לוח ותוצאות. השאר
 * נטען ברגע שנכנסים אליו.
 *
 * זה לא פוגע בעבודה בלי רשת: ה-Service Worker מכניס את כל החלקים
 * למטמון מראש, ולכן מהפעם השנייה הם מקומיים בדיוק כמו קודם.
 */
const ProfileEdit = lazy(() => import('./screens/ProfileEdit'));
const CategoryCreate = lazy(() => import('./screens/CategoryCreate'));
const PassDevice = lazy(() => import('./screens/PassDevice'));
const BotTurn = lazy(() => import('./screens/BotTurn'));
const Puzzles = lazy(() => import('./screens/Puzzles'));
const Leaderboard = lazy(() => import('./screens/Leaderboard'));
const Album = lazy(() => import('./screens/Album'));
const Achievements = lazy(() => import('./screens/Achievements'));
const Daily = lazy(() => import('./screens/Daily'));
const Settings = lazy(() => import('./screens/Settings'));
const Parent = lazy(() => import('./screens/Parent'));
const Credits = lazy(() => import('./screens/Credits'));
const Privacy = lazy(() => import('./screens/Privacy'));
const MultiplayerInfo = lazy(() => import('./screens/MultiplayerInfo'));
const Blitz = lazy(() => import('./screens/Blitz'));
const Chain = lazy(() => import('./screens/Chain'));
const MiniGame = lazy(() => import('./screens/MiniGame'));
const Admin = lazy(() => import('./screens/Admin'));
const Account = lazy(() => import('./screens/Account'));
const Pricing = lazy(() => import('./screens/Pricing'));
const ChallengeScreen = lazy(() => import('./screens/Challenge'));

/**
 * מה מוצג בזמן שחלק נטען.
 *
 * מכוון להיות **בלתי מורגש** ולא "מסך טעינה": ברשת רגילה החלק מגיע
 * במילישניות, ומהפעם השנייה הוא מהמטמון. מסך גדול שמהבהב לרגע גרוע
 * יותר מכלום — ולכן זו רק שורה שקטה, ועם `role="status"` כדי שגם
 * קורא מסך ידע שמשהו קורה.
 */
/**
 * חימום החלקים אחרי שהמשחק כבר מוכן.
 *
 * הפיצול חוסך זמן עד שהמסך הראשון מגיב — אבל בלי החימום, הלחיצה
 * הראשונה על "הגדרות" או על "אוסף המילים" מציגה לרגע "רגע…" בזמן
 * שהחלק יורד. אחרי שהאפליקציה כבר אינטראקטיבית אין למה לחכות, ולכן
 * החלקים נמשכים בזמן סרק — לא בטעינה ולא בלחיצה.
 *
 * `requestIdleCallback` ולא `setTimeout` קבוע: כך זה קורה כשהדפדפן
 * פנוי, ולא באמצע אנימציית הכניסה של המסך הראשון.
 */
function warmScreens(): void {
  const load = () => {
    void import('./screens/Album');
    void import('./screens/Settings');
    void import('./screens/Achievements');
    void import('./screens/Daily');
    void import('./screens/Leaderboard');
    void import('./screens/Puzzles');
    void import('./screens/ProfileEdit');
  };
  const idle = (window as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
  if (idle) idle(load);
  else setTimeout(load, 1500);
}

function ScreenLoading() {
  return (
    <div className="screen center" role="status">
      <p className="dim">רגע…</p>
    </div>
  );
}

import { authAvailable, useAuth } from './store/authStore';
import { listenForAuthDeepLink } from './lib/supabase';

/** מסך שגיאה ידידותי — Error Boundary */
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false };
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="screen center">
          <h1>אופס! משהו השתבש 🙈</h1>
          <p className="dim">אל דאגה — הפרופילים והמילים שלכם שמורים.</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            נטען מחדש
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener('online', up);
    window.addEventListener('offline', down);
    return () => {
      window.removeEventListener('online', up);
      window.removeEventListener('offline', down);
    };
  }, []);
  if (online) return null;
  return (
    <div
      role="status"
      style={{
        background: 'rgba(255,215,92,0.15)',
        borderBottom: '1px solid rgba(255,215,92,0.4)',
        padding: '6px 14px',
        textAlign: 'center',
        fontSize: '0.9rem'
      }}
    >
      📴 מצב Offline — המשחק המקומי עובד כרגיל; אימות תשובות חדשות יושלם כשיחזור החיבור
    </div>
  );
}

export default function App() {
  const screen = useApp((s) => s.screen);
  const loadProfiles = useApp((s) => s.loadProfiles);
  const loadCustomCategories = useApp((s) => s.loadCustomCategories);
  const authReady = useAuth((s) => s.ready);
  const session = useAuth((s) => s.session);
  const initAuth = useAuth((s) => s.init);
  const navigate = useApp((s) => s.navigate);
  const captureChallenge = useChallenge((s) => s.captureFromUrl);

  useEffect(() => {
    void initAuth();
  }, [initAuth]);

  /**
   * חזרה מהתחברות באפליקציה עטופה.
   *
   * בדפדפן supabase-js קורא את הכתובת לבד. באפליקציה הספק מחזיר
   * לסכמת ה-URL של האפליקציה, והיא מתעוררת עם כתובת שאיש לא קורא —
   * בלי המאזין הזה ההתחברות פשוט "לא קורית". בדפדפן זה לא עושה כלום.
   */
  useEffect(() => {
    let stop: (() => void) | undefined;
    void listenForAuthDeepLink().then((off) => {
      stop = off;
    });
    return () => stop?.();
  }, []);

  /**
   * אתגר שהגיע מקישור של חבר.
   *
   * נקרא פעם אחת בטעינה, לפני שהילד רואה משהו — כדי שהקישור ינחת
   * ישר על מסך האתגר ולא על מסך הפתיחה. בבנייה עם שער כניסה המסך
   * ימתין מאחורי ההתחברות, וזה בסדר: אחריה הוא עדיין כאן.
   */
  useEffect(() => {
    const take = () => {
      if (captureChallenge()) navigate('challenge');
    };
    take();
    /**
     * גם אחרי הטעינה: אפליקציה מותקנת שכבר פתוחה יכולה לקבל קישור
     * חדש בלי טעינה מחדש (הדבקה בשורת הכתובת, או קישור שנפתח לתוך
     * חלון קיים). בלי המאזין הזה הילד היה רואה את המסך שבו היה,
     * והקישור פשוט לא היה עושה כלום.
     */
    window.addEventListener('hashchange', take);
    return () => window.removeEventListener('hashchange', take);
  }, [captureChallenge, navigate]);

  useEffect(() => {
    // התיקון רץ לפני הטעינה, כדי שפרופיל פגום לא יוצג אפילו לרגע
    void repairPhotoAvatars().then(() => loadProfiles());
    void loadCustomCategories();
    // הערכה מוחלת מיד מהאחסון המהיר, ורק אחר כך מסתנכרנת עם מסד
    // הנתונים — כך אין הבהוב של ערכת ברירת המחדל בטעינה
    applySkin(savedSkinId());
    void getSetting('skin').then((v) => v && applySkin(v));
    void getSetting('reducedMotion').then((v) => {
      document.body.classList.toggle('reduced-motion', v === '1');
    });
    void getSetting('bigText').then((v) => {
      document.body.classList.toggle('big-text', v === '1');
    });
    // תוכן שהותקן בעבר נטען למנוע הידע; בדיקת עדכון לכל היותר פעם ביממה
    void loadUserKnowledge();
    void loadContentIntoKnowledge().then(() => maybeAutoUpdate());
    warmScreens();
  }, [loadProfiles, loadCustomCategories]);

  /**
   * מסך חדש מתחיל מלמעלה.
   *
   * המשחק מחליף מסכים בתוך אותו דף, והדפדפן שומר את מיקום הגלילה.
   * ילד שגלל למטה כדי למלא את הקטגוריה האחרונה ולחץ "סיימתי" נחת
   * במסך התוצאות **באמצע** — 388 פיקסלים למטה, מעל הניקוד שלו ומעל
   * הכותרת. זה נמדד, לא שוער.
   *
   * גלילה מיידית ולא חלקה: היא קורית בין מסכים ולא בתוך מסך, ואין
   * מה להנפיש כשהתוכן ממילא התחלף.
   */
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [screen]);

  const screens: Record<string, React.ReactElement> = {
    splash: <Splash />,
    'profile-edit': <ProfileEdit />,
    home: <Home />,
    'mode-select': <ModeSelect />,
    categories: <Categories />,
    'category-create': <CategoryCreate />,
    'letter-draw': <LetterDraw />,
    game: <Game />,
    'pass-device': <PassDevice />,
    'bot-turn': <BotTurn />,
    puzzles: <Puzzles />,
    'round-results': <RoundResults />,
    'match-results': <MatchResults />,
    leaderboard: <Leaderboard />,
    album: <Album />,
    achievements: <Achievements />,
    daily: <Daily />,
    settings: <Settings />,
    parent: <Parent />,
    credits: <Credits />,
    privacy: <Privacy />,
    'multiplayer-info': <MultiplayerInfo />,
    blitz: <Blitz />,
    chain: <Chain />,
    'mini-game': <MiniGame />,
    admin: <Admin />,
    account: <Account />,
    pricing: <Pricing />,
    challenge: <ChallengeScreen />
  };

  /**
   * שער הכניסה. הוא נסגר רק כשההתחברות מוגדרת בסביבה — בלי הגדרות
   * ענן (פיתוח מקומי, בדיקות) המשחק נפתח ישר, כפי שתמיד עבד.
   * כל עוד לא ידוע אם קיים סשן שמור, מציגים את כדור הארץ במקום
   * להבהב מסך התחברות למי שכבר מחובר.
   */
  const gated = authAvailable();
  if (gated && !authReady) {
    return (
      <ErrorBoundary>
        <div className="screen center">
          <Globe />
          <p className="dim" style={{ marginTop: 18 }}>רגע, בודקים אם אתם כבר מחוברים…</p>
        </div>
        <SiteCredit />
      </ErrorBoundary>
    );
  }
  if (gated && !session) {
    return (
      <ErrorBoundary>
        <LiveRegion />
        <Login />
        <SiteCredit />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <OfflineBanner />
      <AppHeader />
      <LiveRegion />
      <Suspense fallback={<ScreenLoading />}>{screens[screen] ?? <Splash />}</Suspense>
      <SiteCredit />
    </ErrorBoundary>
  );
}
