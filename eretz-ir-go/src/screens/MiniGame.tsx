import { useMemo, useState } from 'react';
import { useApp } from '../store/appStore';
import { useGame } from '../store/gameStore';
import Hangman from '../components/minigames/Hangman';
import Snake from '../components/minigames/Snake';
import FruitNinja from '../components/minigames/FruitNinja';
import Bubbles from '../components/minigames/Bubbles';
import TicTacToe from '../components/minigames/TicTacToe';
import Scratch from '../components/minigames/Scratch';
import { getKnowledgeBase } from '../lib/knowledge';
import { partialReward, pickMiniGame } from '../lib/miniGames';
import { addMiniGameWin, earn } from '../lib/wallet';
import { sfx } from '../lib/sound';

/**
 * משימת ביניים בין סיבוב לסיבוב.
 *
 * שני מסלולים, שניהם לגיטימיים:
 * - לשחק ולזכות בבונוס (נקודות + קרדיט לארנק)
 * - לדלג ולעבור ישר לאות הבאה, בלי שום עונש
 */
export default function MiniGame() {
  const { navigate, activeProfile, refreshActive } = useApp();
  const roundIndex = useGame((s) => s.roundIndex);
  const letter = useGame((s) => s.letter);
  const categories = useGame((s) => s.categories);
  const addBonus = useGame((s) => s.addBonus);

  const spec = useMemo(() => pickMiniGame(roundIndex, letter || 'א'), [roundIndex, letter]);
  const [started, setStarted] = useState(false);
  const [earned, setEarned] = useState<{ points: number; bills: number; gems: number } | null>(null);

  /** מילים למשחק הניחוש — מהמאגר, בקטגוריות של המשחק הנוכחי */
  const words = useMemo(() => {
    const kb = getKnowledgeBase();
    return categories
      .flatMap((c) => kb.inCategory(c.id))
      .filter((item) => item.popularityScore >= 45)
      .map((item) => item.canonicalName)
      .filter((n) => n.length >= 3 && n.length <= 9);
  }, [categories]);

  const toNextLetter = () => navigate('letter-draw');

  const finish = async (progress: number) => {
    const reward = partialReward(spec, progress);
    addBonus(reward.points);
    if (activeProfile?.id) {
      if (reward.wallet.bills > 0 || reward.wallet.gems > 0) {
        await earn(activeProfile.id, reward.wallet.bills, reward.wallet.gems);
      }
      // רק הצלחה מלאה נספרת להישגים
      if (progress >= 1) await addMiniGameWin(activeProfile.id);
      await refreshActive();
    }
    if (reward.points > 0) sfx.success();
    setEarned({ points: reward.points, bills: reward.wallet.bills, gems: reward.wallet.gems });
  };

  const Game = {
    hangman: Hangman,
    snake: Snake,
    ninja: FruitNinja,
    bubbles: Bubbles,
    tictactoe: TicTacToe,
    scratch: Scratch
  }[spec.id];

  if (earned) {
    return (
      <div className="screen center">
        <div className="confetti" aria-hidden>
          🎁
        </div>
        <h1>המשימה הסתיימה!</h1>
        <div className="card" style={{ maxWidth: 380, margin: '0 auto' }}>
          {earned.points > 0 ? (
            <>
              <h2 className="gold">+{earned.points} נקודות</h2>
              <p>
                {earned.bills > 0 && <>💵 {earned.bills} שטרות </>}
                {earned.gems > 0 && <>💎 {earned.gems} יהלומים</>}
                {earned.bills === 0 && earned.gems === 0 && 'הפעם בלי קרדיט — ננסה שוב בסיבוב הבא!'}
              </p>
            </>
          ) : (
            <p>לא נורא! המשימה הבאה מחכה בסיבוב הבא 💪</p>
          )}
        </div>
        <button className="btn-primary" style={{ marginTop: 16 }} onClick={toNextLetter}>
          לאות הבאה 🎡
        </button>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="screen center">
        <h1>משימת ביניים!</h1>
        <div className="card" style={{ maxWidth: 380, margin: '0 auto' }}>
          <div style={{ fontSize: '3rem' }} aria-hidden>
            {spec.icon}
          </div>
          <h2>{spec.name}</h2>
          <p className="dim">{spec.how}</p>
          <p>
            בונוס על הצלחה: <strong className="gold">+{spec.reward.points} נק׳</strong>
            {spec.reward.wallet.bills > 0 && <> · 💵 {spec.reward.wallet.bills}</>}
            {spec.reward.wallet.gems > 0 && <> · 💎 {spec.reward.wallet.gems}</>}
          </p>
        </div>
        <div className="row" style={{ justifyContent: 'center', marginTop: 16 }}>
          <button className="btn-primary" onClick={() => setStarted(true)}>
            יאללה, משחקים! {spec.icon}
          </button>
          <button className="btn-ghost" onClick={toNextLetter}>
            לדלג לאות הבאה ←
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <h1 className="center">
        {spec.icon} {spec.name}
      </h1>
      <Game words={words} onDone={(p) => void finish(p)} onSkip={toNextLetter} />
    </div>
  );
}
