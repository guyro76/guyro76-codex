import React, { Component, useEffect, useState, type ReactNode } from 'react';
import { useApp } from './store/appStore';
import { getSetting } from './db/db';
import { loadContentIntoKnowledge, maybeAutoUpdate } from './lib/contentPack';
import { loadUserKnowledge } from './lib/knowledge';
import Splash from './screens/Splash';
import Profiles from './screens/Profiles';
import ProfileEdit from './screens/ProfileEdit';
import Home from './screens/Home';
import ModeSelect from './screens/ModeSelect';
import Categories from './screens/Categories';
import CategoryCreate from './screens/CategoryCreate';
import LetterDraw from './screens/LetterDraw';
import Game from './screens/Game';
import PassDevice from './screens/PassDevice';
import RoundResults from './screens/RoundResults';
import MatchResults from './screens/MatchResults';
import Leaderboard from './screens/Leaderboard';
import Album from './screens/Album';
import Achievements from './screens/Achievements';
import Daily from './screens/Daily';
import Settings from './screens/Settings';
import Parent from './screens/Parent';
import Credits from './screens/Credits';
import Privacy from './screens/Privacy';
import MiniGame from './screens/MiniGame';
import SiteCredit from './components/SiteCredit';
import AppHeader from './components/AppHeader';
import LiveRegion from './components/LiveRegion';
import Login from './screens/Login';
import Globe from './components/Globe';
import Admin from './screens/Admin';
import Account from './screens/Account';
import { authAvailable, useAuth } from './store/authStore';
import MultiplayerInfo from './screens/MultiplayerInfo';
import Blitz from './screens/Blitz';
import Chain from './screens/Chain';

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

  useEffect(() => {
    void initAuth();
  }, [initAuth]);

  useEffect(() => {
    void loadProfiles();
    void loadCustomCategories();
    void getSetting('reducedMotion').then((v) => {
      document.body.classList.toggle('reduced-motion', v === '1');
    });
    void getSetting('bigText').then((v) => {
      document.body.classList.toggle('big-text', v === '1');
    });
    // תוכן שהותקן בעבר נטען למנוע הידע; בדיקת עדכון לכל היותר פעם ביממה
    void loadUserKnowledge();
    void loadContentIntoKnowledge().then(() => maybeAutoUpdate());
  }, [loadProfiles, loadCustomCategories]);

  const screens: Record<string, React.ReactElement> = {
    splash: <Splash />,
    profiles: <Profiles />,
    'profile-edit': <ProfileEdit />,
    home: <Home />,
    'mode-select': <ModeSelect />,
    categories: <Categories />,
    'category-create': <CategoryCreate />,
    'letter-draw': <LetterDraw />,
    game: <Game />,
    'pass-device': <PassDevice />,
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
    account: <Account />
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
      {screens[screen] ?? <Splash />}
      <SiteCredit />
    </ErrorBoundary>
  );
}
