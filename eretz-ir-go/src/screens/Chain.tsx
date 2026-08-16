import { useEffect, useRef, useState } from 'react';
import { useApp } from '../store/appStore';
import TopBar from '../components/TopBar';
import { CATEGORIES, CLASSIC_CATEGORY_IDS } from '../data/categories';
import { getKnowledgeBase } from '../lib/knowledge';
import { buildLetterIndex, drawLetter } from '../lib/letters';
import { validateAnswer } from '../lib/validation';
import { blitzPoints } from '../lib/scoring';
import { lastLetterOf, normalizeHebrew } from '../lib/hebrew';
import { sfx } from '../lib/sound';
import { gentleFail, say } from '../lib/persona';
import { outcomeFor, outcomeHint } from '../lib/outcome';
import { db } from '../db/db';

const CHAIN_SECONDS = 90;

interface ChainLink {
  text: string;
  points: number;
}

/**
 * מצב "שרשרת": כל תשובה חייבת להתחיל באות האחרונה של התשובה הקודמת.
 * הקטגוריה נשארת קבועה לאורך השרשרת, והשעון נותן 90 שניות לבנות שרשרת ארוכה.
 */
export default function Chain() {
  const { navigate, activeProfile, refreshActive } = useApp();
  const [phase, setPhase] = useState<'intro' | 'playing' | 'done'>('intro');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [startLetter, setStartLetter] = useState('א');
  const [chain, setChain] = useState<ChainLink[]>([]);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(CHAIN_SECONDS);
  const [score, setScore] = useState(0);
  const usedRef = useRef(new Set<string>());
  const endAtRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const savedRef = useRef(false);

  // האות הנדרשת: האות האחרונה של החוליה האחרונה, או אות הפתיחה
  const requiredLetter = chain.length > 0 ? lastLetterOf(chain[chain.length - 1].text) : startLetter;

  const roll = () => {
    const kb = getKnowledgeBase();
    const index = buildLetterIndex(kb.items);
    // בשרשרת עדיף קטגוריה עשירה — ארץ, עיר, חי, צומח או דומם
    const rich = ['country', 'city', 'animal', 'plant', 'inanimate'].filter((id) =>
      CLASSIC_CATEGORY_IDS.includes(id)
    );
    const catId = rich[Math.floor(Math.random() * rich.length)];
    const cat = CATEGORIES.find((c) => c.id === catId) ?? CATEGORIES[0];
    setCategory(cat);
    setStartLetter(drawLetter([cat.id], 'easy', index));
  };

  useEffect(roll, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase !== 'playing') return;
    const t = setInterval(() => {
      const left = Math.max(0, Math.ceil((endAtRef.current - Date.now()) / 1000));
      setSecondsLeft(left);
      if (left <= 5 && left > 0) sfx.tick();
      if (left <= 0) {
        clearInterval(t);
        setPhase('done');
      }
    }, 300);
    return () => clearInterval(t);
  }, [phase]);

  // שמירת תוצאה בסיום
  useEffect(() => {
    if (phase !== 'done' || savedRef.current || !activeProfile?.id) return;
    savedRef.current = true;
    sfx.win();
    void (async () => {
      await db.matches.add({
        mode: 'chain',
        playerIds: [activeProfile.id!],
        playerNames: [activeProfile.name],
        scores: [score],
        winnerName: activeProfile.name,
        letters: [startLetter],
        categoryIds: [category.id],
        playedAt: new Date().toISOString(),
        coop: false
      });
      await db.profiles.update(activeProfile.id!, {
        totalScore: activeProfile.totalScore + score,
        gamesPlayed: activeProfile.gamesPlayed + 1,
        bestRoundScore: Math.max(activeProfile.bestRoundScore, score)
      });
      await refreshActive();
    })();
  }, [phase, activeProfile, score, startLetter, category.id, refreshActive]);

  const submit = () => {
    const raw = input.trim();
    if (!raw || phase !== 'playing') return;
    const kb = getKnowledgeBase();
    const validation = validateAnswer({
      raw,
      letter: requiredLetter,
      category,
      kb,
      usedInRound: usedRef.current,
      personalDictionary: new Set()
    });

    if (validation.status !== 'valid') {
      // בשרשרת תשובה שגויה לא שוברת את הרצף — רק לא מתקדמת
      setError(
        validation.status === 'wrong-letter'
          ? `החוליה הבאה צריכה להתחיל באות ${requiredLetter}`
          : `${validation.reason} ${activeProfile ? gentleFail(activeProfile.gender) : ''}`
      );
      sfx.error();
      return;
    }

    const points = blitzPoints(chain.length + 1);
    usedRef.current.add(normalizeHebrew(raw));
    setChain((prev) => [...prev, { text: raw, points }]);
    setScore((s) => s + points);
    setInput('');
    setError('');
    sfx.success();
    inputRef.current?.focus();
  };

  const restart = () => {
    setChain([]);
    setScore(0);
    setInput('');
    setError('');
    setSecondsLeft(CHAIN_SECONDS);
    usedRef.current = new Set();
    savedRef.current = false;
    roll();
    setPhase('intro');
  };

  if (!activeProfile) {
    navigate('profiles');
    return null;
  }

  return (
    <div className="screen">
      <TopBar title="🔗 שרשרת" back={phase === 'playing' ? null : 'mode-select'} />

      {phase === 'intro' && (
        <div className="card center">
          <p className="dim">כל תשובה מתחילה באות האחרונה של הקודמת. שרשרת ארוכה = יותר נקודות!</p>
          <h1>
            {category.icon} {category.name}
          </h1>
          <p>
            החוליה הראשונה באות <strong style={{ fontSize: '2rem' }}>{startLetter}</strong>
          </p>
          <p className="dim" style={{ fontSize: '0.9rem' }}>
            לדוגמה: <strong>פיל</strong> → <strong>ל</strong>ביאה → <strong>ה</strong>יפופוטם… ⏱️ {CHAIN_SECONDS} שניות
          </p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <button
              className="btn-primary"
              style={{ fontSize: '1.2rem' }}
              onClick={() => {
                endAtRef.current = Date.now() + CHAIN_SECONDS * 1000;
                setPhase('playing');
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
            >
              {say('ready', activeProfile.gender)} 🔗
            </button>
            <button className="btn-ghost" onClick={roll}>
              🎲 הגרלה אחרת
            </button>
          </div>
        </div>
      )}

      {phase !== 'intro' && (
        <>
          <div className="row spread" style={{ position: 'sticky', top: 0, zIndex: 10 }}>
            <span className="chip">
              {category.icon} {category.name}
            </span>
            <span className="chip gold">⭐ {score}</span>
            <span className="chip">🔗 {chain.length} חוליות</span>
            <span className={`timer${secondsLeft <= 15 ? ' low' : ''}`} role="timer">
              {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
            </span>
          </div>

          {phase === 'playing' && (
            <div style={{ margin: '12px 0' }}>
              <p className="center" style={{ margin: '0 0 8px' }}>
                החוליה הבאה מתחילה ב־<strong style={{ fontSize: '1.8rem', color: 'var(--turquoise)' }}>{requiredLetter}</strong>
              </p>
              <div className="row" style={{ flexWrap: 'nowrap' }}>
                <input
                  ref={inputRef}
                  type="text"
                  dir="rtl"
                  value={input}
                  placeholder={`${category.name} באות ${requiredLetter}…`}
                  aria-label="החוליה הבאה בשרשרת"
                  onChange={(ev) => {
                    setInput(ev.target.value);
                    setError('');
                  }}
                  onKeyDown={(ev) => ev.key === 'Enter' && submit()}
                />
                <button className="btn-primary" style={{ minWidth: 90 }} onClick={submit}>
                  חיבור
                </button>
              </div>
              {error && (
                <p className="status-text-bad" style={{ fontSize: '0.9rem', marginTop: 6 }}>
                  {error}
                </p>
              )}
            </div>
          )}

          {phase === 'done' && (() => {
            // יעד סביר לשרשרת: חמש חוליות. פחות מזה עדיין שווה עידוד,
            // אבל לא גביע — שבח שמגיע בלי קשר לתוצאה מאבד את ערכו.
            const result = outcomeFor(activeProfile, chain.length, 5);
            return (
            <div
              className="card center"
              style={{ margin: '12px 0', borderColor: result.celebrate ? 'var(--gold)' : undefined }}
            >
              {result.celebrate && (
                <div className="confetti" aria-hidden>
                  🔗🏆🔗
                </div>
              )}
              <h2>{result.title}</h2>
              <p className="dim" style={{ marginTop: 0 }}>{outcomeHint(result.tone)}</p>
              <p>
                שרשרת של {chain.length} חוליות · <strong className="gold">{score} נקודות</strong>
              </p>
              <div className="row" style={{ justifyContent: 'center' }}>
                <button className="btn-primary" onClick={restart}>
                  עוד שרשרת! 🔗
                </button>
                <button onClick={() => navigate('home')}>למסך הבית</button>
              </div>
            </div>
            );
          })()}

          <div className="row" style={{ gap: 8 }}>
            {chain.map((link, i) => (
              <span
                key={i}
                className="chip on"
                style={{ background: 'var(--ok-bg)', borderColor: 'var(--ok)' }}
                title={`+${link.points} נקודות`}
              >
                {i + 1}. {link.text} <span className="gold">+{link.points}</span>
              </span>
            ))}
            {chain.length === 0 && phase === 'playing' && (
              <p className="dim center" style={{ width: '100%' }}>
                השרשרת מתחילה כאן — כתבו את החוליה הראשונה! 🔗
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
