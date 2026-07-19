import { useEffect, useRef, useState } from 'react';
import { useApp } from '../store/appStore';
import TopBar from '../components/TopBar';
import { CATEGORIES, CLASSIC_CATEGORY_IDS } from '../data/categories';
import { getKnowledgeBase } from '../lib/knowledge';
import { buildLetterIndex, drawLetter } from '../lib/letters';
import { validateAnswer } from '../lib/validation';
import { blitzPoints } from '../lib/scoring';
import { normalizeHebrew } from '../lib/hebrew';
import { sfx } from '../lib/sound';
import { celebrate, say } from '../lib/persona';
import { db } from '../db/db';

const BLITZ_SECONDS = 45;

interface BlitzEntry {
  text: string;
  ok: boolean;
  points: number;
  reason: string;
}

/** מצב "ראש בראש": קטגוריה אחת, 45 שניות, כמה שיותר תשובות באות אחת */
export default function Blitz() {
  const { navigate, activeProfile, refreshActive } = useApp();
  const [phase, setPhase] = useState<'intro' | 'playing' | 'done'>('intro');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [letter, setLetter] = useState('א');
  const [entries, setEntries] = useState<BlitzEntry[]>([]);
  const [input, setInput] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(BLITZ_SECONDS);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const usedRef = useRef(new Set<string>());
  const endAtRef = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const savedRef = useRef(false);

  const roll = () => {
    const kb = getKnowledgeBase();
    const index = buildLetterIndex(kb.items);
    const catId = CLASSIC_CATEGORY_IDS[Math.floor(Math.random() * CLASSIC_CATEGORY_IDS.length)];
    const cat = CATEGORIES.find((c) => c.id === catId) ?? CATEGORIES[0];
    setCategory(cat);
    setLetter(drawLetter([cat.id], activeProfile?.difficulty ?? 'medium', index));
  };

  useEffect(roll, []); // eslint-disable-line react-hooks/exhaustive-deps

  // טיימר
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
        mode: 'blitz',
        playerIds: [activeProfile.id!],
        playerNames: [activeProfile.name],
        scores: [score],
        winnerName: activeProfile.name,
        letters: [letter],
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
  }, [phase, activeProfile, score, letter, category.id, refreshActive]);

  const submit = () => {
    const raw = input.trim();
    setInput('');
    inputRef.current?.focus();
    if (!raw || phase !== 'playing') return;
    const kb = getKnowledgeBase();
    const validation = validateAnswer({
      raw,
      letter,
      category,
      kb,
      usedInRound: usedRef.current,
      personalDictionary: new Set()
    });
    const ok = validation.status === 'valid';
    usedRef.current.add(normalizeHebrew(raw));
    if (ok) {
      const newStreak = streak + 1;
      const points = blitzPoints(newStreak);
      setStreak(newStreak);
      setScore((s) => s + points);
      setEntries((prev) => [{ text: raw, ok: true, points, reason: validation.reason }, ...prev]);
      sfx.success();
    } else {
      setStreak(0);
      setEntries((prev) => [{ text: raw, ok: false, points: 0, reason: validation.reason }, ...prev]);
      sfx.error();
    }
  };

  if (!activeProfile) {
    navigate('profiles');
    return null;
  }

  return (
    <div className="screen">
      <TopBar title="⚡ ראש בראש" back={phase === 'playing' ? null : 'mode-select'} />

      {phase === 'intro' && (
        <div className="card center">
          <p className="dim">קטגוריה אחת. אות אחת. {BLITZ_SECONDS} שניות.</p>
          <h1>
            {category.icon} {category.name}
          </h1>
          <div style={{ fontSize: '4rem', fontWeight: 900 }}>{letter}</div>
          <p className="dim">כל תשובה נכונה = 10 נק׳ · רצף של 3+ מוסיף בונוס!</p>
          <div className="row" style={{ justifyContent: 'center' }}>
            <button
              className="btn-primary"
              style={{ fontSize: '1.2rem' }}
              onClick={() => {
                endAtRef.current = Date.now() + BLITZ_SECONDS * 1000;
                setPhase('playing');
                setTimeout(() => inputRef.current?.focus(), 50);
              }}
            >
              {say('ready', activeProfile.gender)} ⚡
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
              {category.icon} {category.name} · {letter}
            </span>
            <span className="chip gold">⭐ {score}</span>
            {streak >= 3 && <span className="chip">🔥 רצף {streak}</span>}
            <span className={`timer${secondsLeft <= 10 ? ' low' : ''}`} role="timer">
              0:{String(secondsLeft).padStart(2, '0')}
            </span>
          </div>

          {phase === 'playing' && (
            <div className="row" style={{ margin: '12px 0', flexWrap: 'nowrap' }}>
              <input
                ref={inputRef}
                type="text"
                dir="rtl"
                value={input}
                placeholder={`${category.name} באות ${letter}…`}
                aria-label="תשובה"
                onChange={(ev) => setInput(ev.target.value)}
                onKeyDown={(ev) => ev.key === 'Enter' && submit()}
              />
              <button className="btn-primary" style={{ minWidth: 90 }} onClick={submit}>
                שליחה
              </button>
            </div>
          )}

          {phase === 'done' && (
            <div className="card center" style={{ margin: '12px 0', borderColor: 'var(--gold)' }}>
              <div className="confetti" aria-hidden>
                ⚡🏆⚡
              </div>
              <h2>{celebrate(activeProfile)}</h2>
              <p>
                {entries.filter((e) => e.ok).length} תשובות נכונות · <strong className="gold">{score} נקודות</strong>
              </p>
              <div className="row" style={{ justifyContent: 'center' }}>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setEntries([]);
                    setScore(0);
                    setStreak(0);
                    setSecondsLeft(BLITZ_SECONDS);
                    usedRef.current = new Set();
                    savedRef.current = false;
                    roll();
                    setPhase('intro');
                  }}
                >
                  עוד סיבוב! ⚡
                </button>
                <button onClick={() => navigate('home')}>למסך הבית</button>
              </div>
            </div>
          )}

          <div>
            {entries.map((e, i) => (
              <div
                key={i}
                className="row spread"
                style={{
                  padding: '8px 12px',
                  marginBottom: 6,
                  borderRadius: 10,
                  background: e.ok ? 'var(--ok-bg)' : 'var(--bad-bg)',
                  border: `1px solid ${e.ok ? 'var(--ok)' : 'var(--bad)'}`
                }}
              >
                <span>
                  {e.ok ? '✅' : '❌'} {e.text}
                </span>
                <span className="dim" style={{ fontSize: '0.85rem' }}>
                  {e.ok ? `+${e.points}` : e.reason}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
