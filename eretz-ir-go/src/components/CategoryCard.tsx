import { useEffect, useMemo, useRef, useState } from 'react';
import type { Category, PersonalAnswer } from '../types';
import { useGame, type AnswerDraft } from '../store/gameStore';
import { db } from '../db/db';
import { normalizeHebrew, unfinalize } from '../lib/hebrew';
import { artziSays } from '../lib/artzi';
import { buildChoices } from '../lib/choices';
import { getKnowledgeBase } from '../lib/knowledge';
import Modal from './Modal';
import { ANSWER_PRICE, canAfford, getWallet, spendOnAnswer, type PayMethod, type Wallet } from '../lib/wallet';
import { notifyWalletChanged } from './WalletChip';
import { sfx } from '../lib/sound';
import { canSpeak, letterSpeech, onReadAloudChange, readAloudOn, speak } from '../lib/speak';
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
  const buyAnswer = useGame((s) => s.buyAnswer);
  const hintsLeft = useGame((s) => s.hintsLeft);
  const players = useGame((s) => s.players);
  const coop = useGame((s) => s.coop);
  const currentPlayerIdx = useGame((s) => s.currentPlayerIdx);
  const powerCardsOn = useGame((s) => s.settings.powerCards);
  const choiceMode = useGame((s) => s.settings.choiceMode === true);
  const doublePick = useGame((s) => s.power.double);
  const setDoubleCategory = useGame((s) => s.setDoubleCategory);

  const [suggestions, setSuggestions] = useState<PersonalAnswer[]>([]);
  const [open, setOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showBuy, setShowBuy] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [aloud, setAloud] = useState(readAloudOn());
  const wrapRef = useRef<HTMLDivElement>(null);

  // ההגדרה נטענת מהמסד אחרי שהקלף כבר עלה, ולכן מאזינים לשינוי
  useEffect(() => onReadAloudChange(setAloud), []);

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

  /**
   * מצב בחירה: ארבע אפשרויות במקום הקלדה.
   *
   * המערך נבנה פעם אחת לקלף ולאות — אחרת כל הקלדה או רינדור מחדש
   * היו מגרילים אפשרויות חדשות, והילד היה רואה את הכפתורים קופצים
   * מתחת לאצבע.
   */
  const choices = useMemo(
    () =>
      choiceMode
        ? buildChoices({
            categoryId: category.id,
            letter,
            items: getKnowledgeBase().items,
            exclude: usedElsewhere
          })
        : null,
    // usedElsewhere משתנה עם כל תשובה בסיבוב, ולכן לא נכלל בכוונה:
    // הוא נלקח בחשבון פעם אחת, בבנייה
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [choiceMode, category.id, letter]
  );

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
        <span className="cat-name">
          {category.name}
          {doublePick?.categoryId === category.id && <span className="gold"> ×2</span>}
        </span>
        {aloud && canSpeak() && (
          <button
            className="btn-small btn-ghost"
            aria-label={`להקריא בקול: ${category.name} באות ${letter}`}
            title="להקריא בקול"
            /* מוקרא רק מה שהמשחק ביקש — לעולם לא מה שהילד הקליד */
            onClick={() => speak(`${category.name}, באות ${letterSpeech(letter)}`)}
          >
            🔊
          </button>
        )}
        {powerCardsOn && !doublePick && (
          <button
            className="btn-small btn-ghost"
            aria-label={`ניקוד כפול על ${category.name}`}
            title="קלף כוח: ניקוד כפול על הקטגוריה הזו"
            onClick={() => setDoubleCategory(category.id)}
          >
            ×2
          </button>
        )}
        {/* רמז וקניית תשובה מיותרים כשהתשובה ממילא על המסך */}
        {!choices && (
          <>
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
            {/* קניית תשובה מהקרדיט שנצבר במשחק — לא כסף אמיתי */}
            <button
              className="btn-small btn-ghost"
              aria-label={`קניית תשובה לקטגוריה ${category.name} מהקרדיט`}
              disabled={!profileId || draft?.revealed}
              onClick={() => {
                if (!profileId) return;
                void getWallet(profileId).then((w) => {
                  setWallet(w);
                  setShowBuy(true);
                });
              }}
            >
              🛒 קנו תשובה
            </button>
          </>
        )}
      </div>

      {choices ? (
        <div className="choice-grid" role="radiogroup" aria-label={`${category.name} באות ${letter}`}>
          {choices.options.map((option) => (
            <button
              key={option}
              role="radio"
              aria-checked={text === option}
              className={`choice-btn${text === option ? ' on' : ''}`}
              onClick={() => {
                // לחיצה חוזרת מבטלת — ילד שלחץ בטעות צריך דרך לחזור בו
                setAnswer(category.id, text === option ? '' : option);
                sfx.tick();
              }}
            >
              {option}
              {aloud && canSpeak() && (
                <span
                  className="choice-speak"
                  role="button"
                  tabIndex={0}
                  aria-label={`להקריא: ${option}`}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    speak(option);
                  }}
                  onKeyDown={(ev) => {
                    if (ev.key === 'Enter' || ev.key === ' ') {
                      ev.preventDefault();
                      ev.stopPropagation();
                      speak(option);
                    }
                  }}
                >
                  🔊
                </span>
              )}
            </button>
          ))}
        </div>
      ) : (
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
      )}

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

      {showBuy && wallet && (
        <Modal onClose={() => setShowBuy(false)}>
          <div className="center">
            <h2 style={{ marginTop: 0 }}>🛒 קניית תשובה</h2>
            <p className="dim">
              {category.icon} {category.name} · האות {letter}
            </p>
            <p>
              ארצי ימלא תשובה נכונה במקומכם. התשובה לא מזכה בניקוד — אבל היא נשמרת
              לאוסף המילים ואפשר להמשיך הלאה.
            </p>
            <p className="dim">
              בארנק: 💵 {wallet.bills} · 💎 {wallet.gems}
            </p>
            <div className="row" style={{ justifyContent: 'center' }}>
              {(
                [
                  ['bills', `💵 ${ANSWER_PRICE.bills} שטרות`],
                  ['gems', `💎 ${ANSWER_PRICE.gems} יהלומים`]
                ] as [PayMethod, string][]
              ).map(([method, label]) => (
                <button
                  key={method}
                  className="btn-primary"
                  disabled={!canAfford(wallet, method)}
                  onClick={() => {
                    if (!profileId) return;
                    void spendOnAnswer(profileId, method).then((next) => {
                      if (!next) return; // אין מספיק — לא קורה כלום
                      const bought = buyAnswer(category.id);
                      notifyWalletChanged();
                      setShowBuy(false);
                      if (bought) sfx.success();
                    });
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
            {!canAfford(wallet, 'bills') && !canAfford(wallet, 'gems') && (
              <p className="dim" style={{ fontSize: '0.85rem' }}>
                עוד אין מספיק קרדיט. צוברים שטרות על כל תשובה נכונה, ויהלומים על
                תשובות מקוריות ועל משימות הביניים 💪
              </p>
            )}
            <button className="btn-ghost btn-small" onClick={() => setShowBuy(false)}>
              לא עכשיו
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
