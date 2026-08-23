import { useState } from 'react';
import Avatar from '../components/Avatar';
import { useApp } from '../store/appStore';
import { useGame } from '../store/gameStore';
import TopBar from '../components/TopBar';
import type { GameMode } from '../types';
import { getSetting, setSetting } from '../db/db';
import { CATEGORIES, CLASSIC_CATEGORY_IDS } from '../data/categories';

export interface ModeDraft {
  mode: GameMode;
  rounds: number;
  seconds: number;
  powerCards: boolean;
  choiceMode: boolean;
}

const DEFAULT_DRAFT: ModeDraft = {
  mode: 'solo',
  rounds: 3,
  seconds: 180,
  powerCards: false,
  choiceMode: false
};

/**
 * טיוטת ההגדרות נשמרת קודם כול בזיכרון, ורק אחר כך (ובלי להמתין) לדיסק.
 * המעבר בין המסכים לא תלוי ב-IndexedDB: באייפון כתיבה עלולה להיתקע,
 * וכשהמעבר המתין לה הלחיצה על "משחק יחיד" פשוט לא עשתה כלום.
 * השמירה לדיסק היא רק כדי שהבחירה תשרוד רענון של הדף.
 */
let draftCache: ModeDraft | null = null;

export function saveModeDraft(draft: ModeDraft): void {
  draftCache = draft;
  void setSetting('modeDraft', JSON.stringify(draft));
}

export async function loadModeDraft(): Promise<ModeDraft> {
  if (draftCache) return draftCache;
  try {
    const raw = await getSetting('modeDraft');
    const parsed = raw ? (JSON.parse(raw) as Partial<ModeDraft>) : {};
    draftCache = {
      mode: parsed.mode ?? DEFAULT_DRAFT.mode,
      rounds: parsed.rounds ?? DEFAULT_DRAFT.rounds,
      seconds: parsed.seconds ?? DEFAULT_DRAFT.seconds,
      powerCards: parsed.powerCards ?? DEFAULT_DRAFT.powerCards,
      choiceMode: parsed.choiceMode ?? DEFAULT_DRAFT.choiceMode
    };
  } catch {
    draftCache = { ...DEFAULT_DRAFT };
  }
  return draftCache;
}

export default function ModeSelect() {
  const { navigate, profiles, activeProfile, secondProfile, selectSecondProfile, setEditingProfile } =
    useApp();
  const startMatch = useGame((g) => g.startMatch);
  const [mode, setMode] = useState<GameMode>('solo');
  const [rounds, setRounds] = useState(3);
  const [seconds, setSeconds] = useState(180);
  const [powerCards, setPowerCards] = useState(false);
  /**
   * מצב בחירה מוצע מראש לילדים קטנים, אבל נשאר החלטה של המבוגר:
   * גיל הוא ניחוש טוב לגבי מי עדיין לא כותב, לא קביעה.
   */
  const [choiceMode, setChoiceMode] = useState((activeProfile?.age ?? 8) <= 6);

  const needsSecond = mode === 'duel' || mode === 'coop' || mode === 'tournament';
  const others = profiles.filter((p) => p.id !== activeProfile?.id);

  const modes: { id: GameMode; icon: string; name: string; desc: string }[] = [
    { id: 'solo', icon: '⏱️', name: 'משחק יחיד', desc: 'לבד נגד השעון — שיפור השיא האישי' },
    { id: 'bot', icon: '🤖', name: 'נגד ארצי', desc: 'יריב אמיתי גם כשאין עם מי לשחק — ארצי עונה לפי הרמה שלכם' },
    { id: 'duel', icon: '⚔️', name: 'דו-קרב', desc: 'שניים על אותו מכשיר, תור אחרי תור' },
    { id: 'coop', icon: '🤝', name: 'שיתוף פעולה', desc: 'ממלאים יחד לוח אחד — ניקוד קבוצתי' },
    { id: 'tournament', icon: '🏆', name: 'טורניר משפחתי', desc: 'כמה סיבובים, טבלה מצטברת וגביע' },
    { id: 'practice', icon: '📖', name: 'תרגול חופשי', desc: 'בלי שעון, עם רמזים — ללמידה' },
    { id: 'blitz', icon: '⚡', name: 'ראש בראש', desc: 'קטגוריה אחת, 45 שניות, כמה שיותר תשובות!' },
    { id: 'chain', icon: '🔗', name: 'שרשרת', desc: 'כל תשובה מתחילה באות האחרונה של הקודמת' },
    { id: 'mystery', icon: '🎴', name: 'קלף מסתורי', desc: 'הקטגוריות נשארות סוד — מתגלות רק אחרי הגרלת האות!' }
  ];

  /** מצבי המשחק המהירים מנוהלים במסך משלהם ולא עוברים בבחירת קטגוריות */
  const quickModes: Partial<Record<GameMode, 'blitz' | 'chain'>> = { blitz: 'blitz', chain: 'chain' };

  const start = () => startWith(mode);

  const startWith = (chosen: GameMode) => {
    // שומרים בזיכרון ומנווטים מיד; הכתיבה לדיסק רצה ברקע
    saveModeDraft({ mode: chosen, rounds, seconds, powerCards, choiceMode });

    // קלף מסתורי: המשחק בוחר את הקטגוריות בעצמו ומדלג על מסך הבחירה
    if (chosen === 'mystery' && activeProfile) {
      const pool = [...CLASSIC_CATEGORY_IDS, ...CATEGORIES.filter((c) => !c.classic).map((c) => c.id)];
      const picked = [...pool].sort(() => Math.random() - 0.5).slice(0, 5);
      startMatch(
        {
          mode: chosen,
          categoryIds: picked,
          roundSeconds: seconds,
          rounds,
          difficulty: activeProfile.difficulty,
          hintsPerRound: 3,
          powerCards,
          choiceMode
        },
        picked.map((id) => CATEGORIES.find((c) => c.id === id)!).filter(Boolean),
        [activeProfile]
      );
      navigate('letter-draw');
      return;
    }

    navigate(quickModes[chosen] ?? 'categories');
  };

  /**
   * בחירת מצב.
   *
   * דווח מהשטח: "אני לוחץ על משחק יחיד וזה לא מתקדם". הלחיצה כן
   * עבדה — היא רק סימנה את הקלף, וכפתור ההמשך היה מתחת לקצה המסך.
   * מבחינת המשתמש זה זהה לכפתור שבור.
   *
   * לכן: לחיצה על מצב שכבר נבחר ממשיכה ישר הלאה, ולחיצה ראשונה
   * גוללת את כפתור ההמשך אל מול העיניים. מצב שדורש בחירת יריב לא
   * מדלג — שם באמת חסר מידע, ודילוג היה מוביל למסך חסר.
   */
  /**
   * לחיצה על מצב משחק מתקדמת מיד למסך הבא.
   *
   * זו הייתה בקשה חוזרת, ובצדק: קלף שנראה כמו כפתור ולא מוביל לשום
   * מקום נקרא כשבור. ההגדרות (מספר סיבובים, קלפי כוח) נשארות במסך
   * למי שגולל אליהן לפני הבחירה, ומי שלא נוגע בהן מקבל ברירות מחדל
   * סבירות — וזה הרוב המוחלט.
   *
   * היוצא מן הכלל הוא מצב שדורש בחירת יריב. שם באמת חסר מידע,
   * ודילוג קדימה היה מוביל למסך חסר, ולכן הוא רק נבחר וגולל אל
   * בחירת השחקן השני.
   */
  const pickMode = (next: GameMode) => {
    const second = next === 'duel' || next === 'coop' || next === 'tournament';
    setMode(next);
    if (!second) {
      // ההתחלה נדחית לפריים הבא כדי ש-setMode יספיק להיקלט
      requestAnimationFrame(() => startWith(next));
      return;
    }
    requestAnimationFrame(() => {
      document.querySelector('.action-bar')?.scrollIntoView({ block: 'end', behavior: 'smooth' });
    });
  };

  return (
    <div className="screen">
      <TopBar title="איך משחקים היום?" />

      <div className="card" style={{ marginTop: 14 }}>
        <button className="btn-ghost" style={{ width: '100%' }} onClick={() => navigate('multiplayer-info')}>
          📡 משחק בשני מכשירים (חדר מרוחק) — איך זה עובד?
        </button>
      </div>

      {needsSecond && (
        <div className="card" style={{ marginTop: 14 }}>
          <strong>{mode === 'coop' ? 'עם מי משתפים פעולה?' : 'נגד מי משחקים?'}</strong>
          <div className="row" style={{ marginTop: 10 }}>
            {others.map((p) => (
              <button
                key={p.id}
                className={`chip${secondProfile?.id === p.id ? ' on' : ''}`}
                onClick={() => selectSecondProfile(p)}
              >
                <Avatar avatar={p.avatar} photo={p.photo} name={p.name} size={24} /> {p.name}
              </button>
            ))}
            {others.length === 0 && (
              <div>
                <p className="dim" style={{ margin: '0 0 8px' }}>
                  אין עוד שחקנים במכשיר. משחק על מכשיר אחד דורש שני שחקנים מקומיים.
                </p>
                {/* מסך הפרופילים הוסר (חשבון אחד = שחקן אחד), ולכן ההפניה
                    היא ישירות ליצירת שחקן — אחרת משחק זוגי על מכשיר אחד
                    היה נשאר בלי שום דרך להתחיל. */}
                <button
                  className="btn-small"
                  onClick={() => {
                    setEditingProfile(null);
                    navigate('profile-edit');
                  }}
                >
                  ➕ להוסיף שחקן למכשיר
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/*
        שני המתגים יושבים בשורה אחת של צ'יפים ולא כשתי שורות מלאות.
        הסיבה מדידה: כל שורה שנוספת מעל רשימת המצבים דוחפת את הקלף
        הראשון אל מחוץ למסך הטלפון, ואז לחיצה עליו נראית כמו כפתור
        שבור. יש על זה בדיקת E2E שנופלת אם זה חוזר.
      */}
      {!quickModes[mode] && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="row" style={{ gap: 8, flexWrap: 'wrap' }} role="group" aria-label="תוספות למשחק">
            <button
              className={`chip${powerCards ? ' on' : ''}`}
              role="switch"
              aria-checked={powerCards}
              aria-label="קלפי כוח"
              onClick={() => setPowerCards((v) => !v)}
            >
              🎴 קלפי כוח
            </button>
            <button
              className={`chip${choiceMode ? ' on' : ''}`}
              role="switch"
              aria-checked={choiceMode}
              aria-label="מצב בחירה"
              onClick={() => setChoiceMode((v) => !v)}
            >
              🧒 מצב בחירה
            </button>
          </div>
          <p className="dim" style={{ margin: '6px 0 0', fontSize: '0.8rem' }}>
            {powerCards && choiceMode
              ? 'קלפי כוח: זמן נוסף, החלפת אות, רמז ו-×2 · מצב בחירה: 4 אפשרויות במקום הקלדה'
              : powerCards
                ? '⏳ זמן נוסף, 🔁 החלפת אות, 💡 רמז מתנה, ✖️2 ניקוד כפול'
                : choiceMode
                  ? '4 אפשרויות במקום הקלדה — למי שעדיין לא כותב'
                  : 'אפשר להוסיף קלפי כוח, או מצב בחירה לילדים שעדיין לא כותבים'}
          </p>
        </div>
      )}

      <div className="card" style={{ marginTop: 14, display: quickModes[mode] ? 'none' : undefined }}>
        <div className="row spread">
          <label style={{ flex: 1 }}>
            סיבובים
            <select value={rounds} onChange={(ev) => setRounds(Number(ev.target.value))}>
              {[1, 2, 3, 5, 7].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <label style={{ flex: 1 }}>
            זמן לסיבוב
            <select
              value={seconds}
              onChange={(ev) => setSeconds(Number(ev.target.value))}
              disabled={mode === 'practice' || seconds === 0}
            >
              <option value={60}>דקה</option>
              <option value={120}>2 דקות</option>
              <option value={180}>3 דקות</option>
              <option value={300}>5 דקות</option>
              <option value={0}>ללא הגבלה</option>
            </select>
          </label>
        </div>

        {/* משחק על זמן או בלי לחץ. אפשר להחליף גם באמצע הסיבוב, מהשעון שבראש מסך המשחק. */}
        <div className="row" style={{ marginTop: 10 }} role="group" aria-label="מצב זמן">
          <button
            className={`chip${seconds > 0 ? ' on' : ''}`}
            aria-pressed={seconds > 0}
            onClick={() => setSeconds(seconds > 0 ? seconds : 180)}
            disabled={mode === 'practice'}
          >
            ⏱️ משחק על זמן
          </button>
          <button
            className={`chip${seconds === 0 ? ' on' : ''}`}
            aria-pressed={seconds === 0}
            onClick={() => setSeconds(0)}
          >
            ♾️ בלי ספירת זמן
          </button>
        </div>
      </div>


      {/*
        ההגדרות מופיעות **לפני** רשימת המצבים, ולא אחריה.
        הסיבה: לחיצה על מצב מתקדמת מיד למסך הבא, ולכן כל מה שנמצא
        מתחת לרשימה כבר לא ניתן להגעה. מי שרוצה לשנות מספר סיבובים
        או זמן עושה זאת כאן, ומי שלא — פשוט בוחר מצב וממשיך.
      */}
      <div className="grid">
        {modes.map((m) => (
          <div
            key={m.id}
            className="card clickable"
            role="button"
            tabIndex={0}
            aria-pressed={mode === m.id}
            style={mode === m.id ? { borderColor: 'var(--turquoise)', background: 'rgba(51,214,195,0.12)' } : undefined}
            onClick={() => pickMode(m.id)}
            onKeyDown={(ev) => {
              if (ev.key === 'Enter' || ev.key === ' ') {
                ev.preventDefault();
                pickMode(m.id);
              }
            }}
          >
            <div className="row">
              <span style={{ fontSize: '1.8rem' }} aria-hidden>
                {m.icon}
              </span>
              <div>
                <strong>{m.name}</strong>
                <p className="dim" style={{ margin: 0, fontSize: '0.9rem' }}>
                  {m.desc}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* פס פעולה נעוץ בתחתית: ברשימת מצבים ארוכה בטלפון הכפתור נפל
          מתחת לקצה המסך, ונראה כאילו "הלחיצה לא עושה כלום". */}
      <div className="action-bar">
      <button
        className="btn-primary"
        style={{ width: '100%' }}
        disabled={needsSecond && !secondProfile}
        onClick={start}
      >
        {mode === 'blitz'
          ? 'יאללה, לבליץ! ⚡'
          : mode === 'chain'
            ? 'מתחילים שרשרת! 🔗'
            : mode === 'mystery'
              ? 'לגלות את הקלף המסתורי! 🎴'
              : 'המשך לבחירת קטגוריות ←'}
      </button>
      </div>
    </div>
  );
}
