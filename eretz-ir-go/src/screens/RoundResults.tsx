import { useEffect, useMemo, useRef, useState } from 'react';
import Avatar from '../components/Avatar';
import { useApp } from '../store/appStore';
import { useGame } from '../store/gameStore';
import Modal from '../components/Modal';
import { originalityLabel } from '../lib/scoring';
import { gentleFail, randomJoke } from '../lib/persona';
import { db, getSetting } from '../db/db';
import type { SubmittedAnswer } from '../types';
import { getKnowledgeBase } from '../lib/knowledge';
import AnswerImage from '../components/AnswerImage';
import { announce } from '../lib/announce';
import { awardCompletionBonus, grantRoundPiece } from '../lib/puzzleStore';
import { COMPLETION_BONUS } from '../lib/puzzlePieces';
import { notifyWalletChanged } from '../components/WalletChip';
import { puzzleById } from '../data/puzzles';
import type { Award } from '../lib/puzzlePieces';
import PuzzleBoard from '../components/PuzzleBoard';
import { sfx } from '../lib/sound';

function statusClass(a: SubmittedAnswer): string {
  if (a.validation.status === 'valid') return 'status-text-ok';
  if (a.validation.status === 'needs-review') return 'status-text-pending';
  return 'status-text-bad';
}

function statusIcon(a: SubmittedAnswer): string {
  if (a.validation.status === 'valid') return '✅';
  if (a.validation.status === 'needs-review') return '⏳';
  if (a.validation.status === 'empty') return '⬜';
  return '❌';
}

export default function RoundResults() {
  const { navigate, activeProfile } = useApp();
  const game = useGame();
  const [newWordIdx, setNewWordIdx] = useState(0);
  const [showNewWords, setShowNewWords] = useState(true);
  const [appealSent, setAppealSent] = useState<Set<string>>(new Set());
  // אפשר לכבות את משימות הביניים בהגדרות — למשפחות שרוצות משחק קצר
  const [miniGamesOn, setMiniGamesOn] = useState(true);
  const [award, setAward] = useState<Award | null>(null);
  const [owned, setOwned] = useState<number[]>([]);
  const grantedRef = useRef(false);

  useEffect(() => {
    void getSetting('miniGames').then((v) => setMiniGamesOn(v !== '0'));
  }, []);

  /**
   * חלק פאזל על סיום הסיבוב — פרס ודאי ולא הגרלה.
   *
   * ה-ref מונע הענקה כפולה: המסך הזה מתרנדר מחדש בכל שינוי מצב,
   * והענקה בכל רינדור הייתה מרוקנת את כל הפאזלים תוך סיבוב אחד.
   */
  useEffect(() => {
    if (!activeProfile?.id || grantedRef.current) return;
    grantedRef.current = true;
    // נשמר בקבוע: בתוך ה-callback TypeScript כבר לא זוכר שהבדיקה נעשתה
    const profileId = activeProfile.id;
    void grantRoundPiece(profileId).then((result) => {
      if (!result) return;
      const { award: won, owned } = result;
      setAward(won);
      setOwned(owned);
      const puzzle = puzzleById(won.puzzleId);
      if (won.completed) {
        sfx.fanfare();
        /**
         * הפרס על השלמה ניתן גם כאן וגם בקנייה, כי אפשר להשלים לוח
         * בשתי הדרכים — וילד שהשלים לוח בזכות משחק לא אמור לקבל פחות
         * ממי שקנה את החלק האחרון.
         *
         * ההענקה נפרדת מהענקת החלק בכוונה: החלק כבר נשמר, ותקלה
         * בארנק לא אמורה לבטל אותו.
         */
        void awardCompletionBonus(profileId).then((next) => {
          if (next) notifyWalletChanged();
        });
      }
      announce(
        won.completed
          ? `השלמת את הפאזל ${puzzle?.name ?? ''}! בונוס ${COMPLETION_BONUS.bills} שטרות`
          : `קיבלת חלק פאזל: ${puzzle?.name ?? ''}, ${won.have} מתוך ${won.total}`
      );
    });
  }, [activeProfile?.id]);

  // סיכום הסיבוב מוצג בצבעים ובאייקונים — מכריזים אותו פעם אחת בכניסה
  // למסך, כך שגם מי שלא רואה יודע מה קרה בלי לסרוק את כל הקלפים
  useEffect(() => {
    const me = game.players[0];
    if (!me) return;
    const ok = me.submitted.filter((a) => a.validation.status === 'valid').length;
    const total = me.submitted.length;
    const points = me.submitted.reduce((sum, a) => sum + a.totalScore, 0);
    announce(`תוצאות הסיבוב: ${ok} תשובות נכונות מתוך ${total}, ${points} נקודות`);
  }, [game.players]);

  const kb = getKnowledgeBase();

  // מילים חדשות שהתגלו בסיבוב (לחלון "מצאת מילה חדשה!")
  const newWords = useMemo(
    () =>
      game.players.flatMap((p) =>
        p.submitted
          .filter((a) => a.validation.status === 'valid' && (a.discoveryBonus > 0 || a.originality >= 80))
          .map((a) => ({ answer: a, playerName: p.profile.name }))
      ),
    [game.players]
  );

  const appeal = async (a: SubmittedAnswer) => {
    // ערעור: נשמר לאישור הורה במצב הורה
    await db.settings.put({
      key: `appeal-${Date.now()}`,
      value: JSON.stringify({ text: a.rawText, categoryId: a.categoryId, letter: a.letter })
    });
    setAppealSent((prev) => new Set(prev).add(`${a.categoryId}|${a.rawText}`));
  };

  const isLastRound = game.roundIndex + 1 >= game.settings.rounds;
  const shownPlayers = game.coop ? [game.players[0]] : game.players;

  return (
    <div className="screen">
      <h1 className="center">
        תוצאות הסיבוב — האות {game.letter} {game.coop ? '🤝' : ''}
      </h1>

      {award && (
        <div className="card puzzle-award" style={{ marginBottom: 14 }}>
          <div className="row" style={{ gap: 12, alignItems: 'center' }}>
            <PuzzleBoard puzzleId={award.puzzleId} owned={owned} highlight={award.piece} compact />
            <div style={{ flex: 1, minWidth: 140 }}>
              <strong>
                {award.completed ? '🎉 השלמתם את הפאזל!' : '🧩 קיבלתם חלק פאזל!'}
              </strong>
              <p className="dim" style={{ margin: '2px 0 0', fontSize: '0.88rem' }}>
                {award.completed
                  ? `${puzzleById(award.puzzleId)?.name ?? ''} — התמונה המלאה מחכה במסך הפאזלים`
                  : `${puzzleById(award.puzzleId)?.name ?? ''} · ${award.have} מתוך ${award.total}`}
              </p>
              <button className="btn-small btn-ghost" style={{ marginTop: 6 }} onClick={() => navigate('puzzles')}>
                לפאזלים שלי ←
              </button>
            </div>
          </div>
        </div>
      )}

      {shownPlayers.map((p, pi) => (
        <div key={pi} className="card" style={{ marginBottom: 14 }}>
          <div className="row spread">
            <strong>
              <Avatar avatar={p.profile.avatar} photo={p.profile.photo} name={p.profile.name} size={26} />{' '}
              {game.coop ? `צוות ${game.players.map((x) => x.profile.name).join(' ו')}` : p.profile.name}
            </strong>
            <span className="gold" style={{ fontSize: '1.3rem', fontWeight: 800 }}>
              +{p.roundScore} נק׳
            </span>
          </div>

          {p.submitted.map((a) => {
            const cat = game.categories.find((c) => c.id === a.categoryId);
            // תשובה שאומתה אונליין אינה נושאת matchedItem — משלימים ממנוע
            // הידע, שם כבר יושבת התמונה שהתקבלה מוויקיפדיה.
            const item =
              a.validation.matchedItem ??
              (a.normalizedText ? kb.findExact(a.normalizedText)[0] : undefined);
            const key = `${a.categoryId}|${a.rawText}`;
            return (
              <div
                key={a.categoryId}
                className={`answer-${a.validation.status === 'valid' ? 'valid' : a.validation.status === 'needs-review' ? 'pending' : 'invalid'}`}
                style={{ padding: '10px 0', borderTop: '1px solid var(--border-glass)' }}
              >
                <div className="row spread">
                  <span>
                    {cat?.icon} <strong>{cat?.name}:</strong>{' '}
                    <span className={statusClass(a)}>
                      {statusIcon(a)} {a.rawText || '— ריק —'}
                    </span>
                  </span>
                  {a.validation.status === 'valid' && <span className="gold">+{a.totalScore}</span>}
                </div>

                {a.validation.status === 'valid' && (
                  <p className="dim" style={{ margin: '4px 0 0', fontSize: '0.88rem' }}>
                    מקוריות {a.originality}% — {originalityLabel(a.originality, a.duplicateWithOtherPlayer)}
                    {a.speedBonus > 0 && ` · ⚡ בונוס מהירות +${a.speedBonus}`}
                    {a.noHintBonus > 0 && ` · 🧠 בלי רמז +${a.noHintBonus}`}
                    {a.discoveryBonus > 0 && ` · 🌟 גילוי חדש +${a.discoveryBonus}`}
                    {a.revealed && ' · נלמד בעזרת ארצי (ללא ניקוד)'}
                  </p>
                )}
                {a.validation.status === 'valid' && item?.facts?.[0] && (
                  <p style={{ margin: '4px 0 0', fontSize: '0.88rem' }}>💡 {item.facts[0]}</p>
                )}
                {a.validation.status === 'valid' && <AnswerImage item={item} label={a.rawText} categoryId={a.categoryId} discover />}

                {a.validation.status !== 'valid' && a.validation.status !== 'empty' && a.rawText && (
                  <p className="dim" style={{ margin: '4px 0 0', fontSize: '0.88rem' }}>
                    {a.validation.reason}
                    {a.validation.suggestion && ` · אולי: "${a.validation.suggestion}"`}
                    {activeProfile && a.validation.status !== 'duplicate' && ` · ${gentleFail(activeProfile.gender)}`}
                  </p>
                )}

                {a.validation.status === 'needs-review' && (
                  <button
                    className="btn-small"
                    style={{ marginTop: 6 }}
                    disabled={appealSent.has(key)}
                    onClick={() => void appeal(a)}
                  >
                    {appealSent.has(key) ? '⏳ נשלח לאישור הורה' : '⚖️ ערעור — לבדיקת הורה'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ))}

      {activeProfile && (
        <p className="center dim">🤖 {randomJoke(activeProfile.age)}</p>
      )}

      <button
        className="btn-primary"
        style={{ width: '100%' }}
        onClick={() => {
          if (isLastRound) {
            void game.endMatch().then(() => navigate('match-results'));
          } else {
            // בין סיבוב לסיבוב יש משימת ביניים — אפשר לשחק לבונוס
            // או לדלג ישר לאות הבאה מתוך המסך שלה.
            game.nextRound();
            navigate(miniGamesOn ? 'mini-game' : 'letter-draw');
          }
        }}
      >
        {isLastRound ? 'לתוצאות המשחק 🏁' : miniGamesOn ? 'למשימת הביניים 🎲' : 'לסיבוב הבא 🎡'}
      </button>

      {showNewWords && newWords.length > 0 && newWordIdx < newWords.length && (
        <Modal onClose={() => setShowNewWords(false)}>
          {(() => {
            const nw = newWords[newWordIdx];
            const item = nw.answer.validation.matchedItem ?? kb.findExact(nw.answer.normalizedText)[0];
            return (
              <div className="center">
                <div className="confetti" aria-hidden>
                  ✨🌟✨
                </div>
                <h2>מצאת מילה חדשה!</h2>
                <h1 style={{ color: 'var(--turquoise)' }}>{nw.answer.rawText}</h1>
                <p className="dim">
                  {game.categories.find((c) => c.id === nw.answer.categoryId)?.name} · האות {nw.answer.letter}
                  {!game.coop && game.players.length > 1 && ` · ${nw.playerName}`}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <AnswerImage item={item} label={nw.answer.rawText} categoryId={nw.answer.categoryId} size="large" discover />
                </div>
                {item?.facts?.[0] && <p>💡 {item.facts[0]}</p>}
                <p className="dim" style={{ fontSize: '0.85rem' }}>
                  המילה נוספה לאוסף המילים שלך ותופיע בהשלמה האוטומטית 🃏
                </p>
                <div className="row" style={{ justifyContent: 'center' }}>
                  {newWordIdx < newWords.length - 1 ? (
                    <button className="btn-primary" onClick={() => setNewWordIdx((i) => i + 1)}>
                      למילה הבאה ←
                    </button>
                  ) : (
                    <button className="btn-primary" onClick={() => setShowNewWords(false)}>
                      מעולה! 🎉
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </Modal>
      )}
    </div>
  );
}
