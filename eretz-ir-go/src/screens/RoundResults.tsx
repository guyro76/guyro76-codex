import { useMemo, useState } from 'react';
import { useApp } from '../store/appStore';
import { useGame } from '../store/gameStore';
import Modal from '../components/Modal';
import { originalityLabel } from '../lib/scoring';
import { gentleFail, randomJoke } from '../lib/persona';
import { db } from '../db/db';
import type { SubmittedAnswer } from '../types';
import { getKnowledgeBase } from '../lib/knowledge';
import AnswerImage from '../components/AnswerImage';

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

      {shownPlayers.map((p, pi) => (
        <div key={pi} className="card" style={{ marginBottom: 14 }}>
          <div className="row spread">
            <strong>
              {p.profile.avatar} {game.coop ? `צוות ${game.players.map((x) => x.profile.name).join(' ו')}` : p.profile.name}
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
                {a.validation.status === 'valid' && <AnswerImage item={item} label={a.rawText} discover />}

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
            game.nextRound();
            navigate('letter-draw');
          }
        }}
      >
        {isLastRound ? 'לתוצאות המשחק 🏁' : 'לסיבוב הבא 🎡'}
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
                  <AnswerImage item={item} label={nw.answer.rawText} size="large" discover />
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
