import { useEffect, useMemo, useRef, useState } from 'react';
import type { Category, PersonalAnswer } from '../types';
import { useGame, type AnswerDraft } from '../store/gameStore';
import { db } from '../db/db';
import { normalizeHebrew, unfinalize } from '../lib/hebrew';
import { artziSays } from '../lib/artzi';
import type { Gender } from '../types';

interface Props {
  category: Category;
  draft: AnswerDraft | undefined;
  profileId?: number;
  gender: Gender;
  letter: string;
  editorColor?: string; // בשיתוף פעולה: צבע השחקנית שעורכת
}

/** קלף קטגוריה במסך המשחק: הקלדה, השלמה אוטומטית, רמזים */
export default function CategoryCard({ category, draft, profileId, gender, letter, editorColor }: Props) {
  const setAnswer = useGame((s) => s.setAnswer);
  const askHint = useGame((s) => s.askHint);
  const revealAnswer = useGame((s) => s.revealAnswer);
  const hintsLeft = useGame((s) => s.hintsLeft);
  const players = useGame((s) => s.players);
  const coop = useGame((s) => s.coop);
  const currentPlayerIdx = useGame((s) => s.currentPlayerIdx);

  const [suggestions, setSuggestions] = useState<PersonalAnswer[]>([]);
  const [open, setOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const text = draft?.text ?? '';
  const lastHint = draft?.lastHint;
  const hintsUsed = draft?.hintsUsed ?? 0;

  // תשובות שכבר בשימוש בקטגוריות אחרות בסיבוב — מסומנות ברשימה
  const usedElsewhere = useMemo(() => {
    const idx = coop ? 0 : currentPlayerIdx;
    const player = players[idx];
    if (!player) return new Set<string>();
    return new Set(
      Object.entries(player.answers)
        .filter(([cid]) => cid !== category.id)
        .map(([, a]) => normalizeHebrew(a.text))
        .filter(Boolean)
    );
  }, [players, coop, currentPlayerIdx, category.id]);

  // המילון האישי לקטגוריה — נטען פעם אחת לקלף
  useEffect(() => {
    let cancel = false;
    if (!profileId) return;
    void db.personalAnswers
      .where('[profileId+categoryId]')
      .equals([profileId, category.id])
      .toArray()
      .then((rows) => {
        if (!cancel) setSuggestions(rows);
      });
    return () => {
      cancel = true;
    };
  }, [profileId, category.id]);

  useEffect(() => {
    const close = (ev: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(ev.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const letterNorm = unfinalize(letter);
  const filtered = suggestions
    .filter((s) => s.normalized.startsWith(letterNorm) || s.normalized.startsWith(`ה${letterNorm}`))
    .filter((s) => !text || s.normalized.includes(normalizeHebrew(text)) || s.normalized.startsWith(normalizeHebrew(text)))
    .slice(0, 8);

  return (
    <div className="cat-card" style={editorColor ? { boxShadow: `0 0 0 2px ${editorColor}` } : undefined}>
      <div className="cat-head">
        <span className="cat-icon" aria-hidden>
          {category.icon}
        </span>
        <span className="cat-name">{category.name}</span>
        <button
          className="btn-small btn-ghost"
          aria-label={`רמז מארצי לקטגוריה ${category.name}, נשארו ${hintsLeft} רמזים`}
          disabled={hintsLeft <= 0 && hintsUsed === 0}
          onClick={() => {
            if (hintsUsed < 3) askHint(category.id);
            setShowHint(true);
          }}
        >
          💡 {hintsUsed > 0 ? `רמז ${Math.min(hintsUsed, 3)}/3` : 'רמז'}
        </button>
      </div>

      <div ref={wrapRef} style={{ position: 'relative' }}>
        <div className="row" style={{ flexWrap: 'nowrap' }}>
          <input
            type="text"
            dir="rtl"
            value={text}
            placeholder={`${category.name} באות ${letter}...`}
            aria-label={category.name}
            onChange={(ev) => setAnswer(category.id, ev.target.value)}
            onFocus={() => filtered.length > 0 && setOpen(true)}
          />
          {filtered.length > 0 && (
            <button
              className="btn-small btn-ghost"
              aria-label="פתיחת רשימת המילים ששמרת"
              onClick={() => setOpen((v) => !v)}
              style={{ minWidth: 44 }}
            >
              {open ? '▲' : '▼'}
            </button>
          )}
        </div>

        {open && filtered.length > 0 && (
          <div className="autocomplete" role="listbox">
            {filtered.map((s) => {
              const used = usedElsewhere.has(s.normalized);
              return (
                <div
                  key={s.id}
                  role="option"
                  aria-selected={false}
                  className={`item${used ? ' used' : ''}`}
                  onClick={() => {
                    if (used) return;
                    setAnswer(category.id, s.text);
                    setOpen(false);
                  }}
                >
                  <span>{s.text}</span>
                  <span className="dim" style={{ fontSize: '0.8rem' }}>
                    {used ? 'כבר בשימוש' : `×${s.timesUsed}`}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showHint && lastHint && (
        <div className="artzi-bubble">
          <span className="face" aria-hidden>🤖</span>
          <div style={{ flex: 1 }}>
            <strong>ארצי: </strong>
            {artziSays('hint', gender)} {lastHint.text}
            {lastHint.choices && (
              <div className="row" style={{ marginTop: 8 }}>
                {lastHint.choices.map((c) => (
                  <button key={c} className="btn-small" onClick={() => setAnswer(category.id, c)}>
                    {c}
                  </button>
                ))}
              </div>
            )}
            <div className="row" style={{ marginTop: 8 }}>
              {hintsUsed < 3 && hintsLeft > 0 && (
                <button className="btn-small" onClick={() => askHint(category.id)}>
                  עוד רמז (-{[2, 4, 7][hintsUsed] ?? 7} נק׳)
                </button>
              )}
              {hintsUsed >= 2 && (
                <button
                  className="btn-small btn-coral"
                  onClick={() => {
                    revealAnswer(category.id);
                    setShowHint(false);
                  }}
                >
                  גלו לי (בלי ניקוד)
                </button>
              )}
              <button className="btn-small btn-ghost" onClick={() => setShowHint(false)}>
                סגירה
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
