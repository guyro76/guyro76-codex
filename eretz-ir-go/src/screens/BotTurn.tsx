import { useEffect, useRef, useState } from 'react';
import Avatar from '../components/Avatar';
import { useApp } from '../store/appStore';
import { useGame } from '../store/gameStore';
import { BOT_LABEL } from '../data/botProfile';
import { planBotRound, type BotMove } from '../lib/botPlayer';
import { getKnowledgeBase } from '../lib/knowledge';
import { sfx } from '../lib/sound';
import { announce } from '../lib/announce';

/**
 * התור של ארצי.
 *
 * למה זה מסך ולא חישוב מיידי: אם התשובות של היריב היו מופיעות
 * בבת אחת, המשחק היה מרגיש כמו טבלה שנפתחה ולא כמו יריב. כאן רואים
 * אותו חושב, כותב, ולפעמים מוותר — וזה מה שהופך את זה למשחק נגד
 * מישהו.
 *
 * המסך גם לא מאפשר לדלג לפני שהוא סיים בלי כוונה: כפתור "קדימה"
 * מופיע רק בסוף, אבל אפשר לזרז בלחיצה.
 */
export default function BotTurn() {
  const { navigate } = useApp();
  const players = useGame((s) => s.players);
  const categories = useGame((s) => s.categories);
  const letter = useGame((s) => s.letter);
  const settings = useGame((s) => s.settings);
  const continueToNextPlayer = useGame((s) => s.continueToNextPlayer);
  const setAnswer = useGame((s) => s.setAnswer);
  const finishPlayer = useGame((s) => s.finishPlayer);

  const [revealed, setRevealed] = useState<BotMove[]>([]);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** התכנון נבנה פעם אחת; רינדור חוזר לא מגריל לארצי תשובות חדשות */
  const planRef = useRef<BotMove[] | null>(null);
  const startedRef = useRef(false);

  const bot = players[players.length - 1];

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    // מעבירים את התור לארצי לפני שכותבים — setAnswer כותב לשחקן הנוכחי
    continueToNextPlayer();

    const plan = planBotRound({
      categoryIds: categories.map((c) => c.id),
      letter,
      difficulty: settings.difficulty,
      items: getKnowledgeBase().items
    });
    planRef.current = plan;

    let i = 0;
    const step = () => {
      const move = plan[i];
      if (!move) {
        setDone(true);
        announce('ארצי סיים את התור');
        return;
      }
      if (move.answer) {
        setAnswer(move.categoryId, move.answer);
        sfx.tick();
      }
      setRevealed(plan.slice(0, i + 1));
      i++;
      timer.current = setTimeout(step, plan[i]?.delayMs ?? 400);
    };
    timer.current = setTimeout(step, plan[0]?.delayMs ?? 600);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [categories, letter, settings.difficulty, continueToNextPlayer, setAnswer]);

  /** דילוג: משלים מיד את כל מה שנשאר */
  const skip = () => {
    if (timer.current) clearTimeout(timer.current);
    const plan = planRef.current ?? [];
    for (const move of plan) {
      if (move.answer) setAnswer(move.categoryId, move.answer);
    }
    setRevealed(plan);
    setDone(true);
  };

  if (!bot) {
    navigate('home');
    return null;
  }

  const answered = revealed.filter((m) => m.answer).length;

  return (
    <div className="screen center">
      <div className="avatar-big" style={{ margin: '8px auto 12px', borderColor: bot.profile.color }}>
        <Avatar avatar={bot.profile.avatar} photo={bot.profile.photo} name={bot.profile.name} size={72} />
      </div>
      <h1 style={{ marginBottom: 4 }}>
        {done ? 'ארצי סיים!' : `${BOT_LABEL[settings.difficulty]} חושב…`}
      </h1>
      <p className="dim" style={{ marginTop: 0 }}>
        האות <span data-testid="bot-letter">{letter}</span> · {answered} תשובות מתוך {categories.length}
      </p>

      <div className="card" style={{ textAlign: 'start', marginTop: 8 }}>
        {categories.map((cat, i) => {
          const move = revealed[i];
          return (
            <div
              key={cat.id}
              className="row spread bot-row"
              style={{
                padding: '7px 0',
                borderBottom: i < categories.length - 1 ? '1px solid var(--border-glass)' : undefined,
                opacity: move ? 1 : 0.35
              }}
            >
              <span>
                <span aria-hidden>{cat.icon}</span> {cat.name}
              </span>
              <span className="bot-answer" style={{ fontWeight: 700 }}>
                {!move ? (
                  <span className="dim">…</span>
                ) : move.answer ? (
                  move.answer
                ) : (
                  <span className="dim">לא ידע 🤷</span>
                )}
              </span>
            </div>
          );
        })}
      </div>

      <div className="action-bar">
        {done ? (
          <button
            className="btn-primary"
            style={{ width: '100%' }}
            onClick={() => {
              void finishPlayer();
              navigate('round-results');
            }}
          >
            לתוצאות הסיבוב ←
          </button>
        ) : (
          <button className="btn-ghost" style={{ width: '100%' }} onClick={skip}>
            ⏩ שיזדרז
          </button>
        )}
      </div>
    </div>
  );
}
