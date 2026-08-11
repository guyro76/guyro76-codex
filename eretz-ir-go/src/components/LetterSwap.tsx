import { useMemo, useState } from 'react';
import Modal from './Modal';
import { useApp } from '../store/appStore';
import { useGame } from '../store/gameStore';
import { sfx } from '../lib/sound';
import { announce } from '../lib/announce';
import { getWallet, saveWallet, type PayMethod, type Wallet } from '../lib/wallet';
import { SWAP_PRICE, canAffordSwap, payForSwap, swapOption, swapsLeft } from '../lib/letterSwap';
import { isRiddleAnswerCorrect, pickRiddle } from '../data/riddles';

/**
 * כפתור החלפת האות, על שלושת המסלולים שלו.
 *
 * ההחלפה הראשונה חינם — ילד שנתקע באות בלתי אפשרית לא אמור לשלם על
 * זה. השנייה נקנית, ומי שאין לו קרדיט יכול לפתור חידה במקום; תמיד
 * יש דרך שלא דורשת כלום חוץ מלחשוב.
 */
export default function LetterSwap({ onSwap }: { onSwap: () => void }) {
  const { activeProfile } = useApp();
  const used = useGame((s) => s.letterSwapsUsed);
  const usedRiddleIds = useGame((s) => s.usedRiddleIds);
  const consumeLetterSwap = useGame((s) => s.consumeLetterSwap);
  const markRiddleUsed = useGame((s) => s.markRiddleUsed);

  const [open, setOpen] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [riddleMode, setRiddleMode] = useState(false);
  const [guess, setGuess] = useState('');
  const [wrong, setWrong] = useState(false);

  const riddle = useMemo(() => pickRiddle(usedRiddleIds), [usedRiddleIds, open]);
  const option = swapOption(used);
  const left = swapsLeft(used);

  if (option === 'none') {
    return (
      <p className="dim" style={{ marginTop: 10, fontSize: '0.86rem' }}>
        ניצלתם את שתי החלפות האות במשחק הזה
      </p>
    );
  }

  const doSwap = () => {
    if (!consumeLetterSwap()) return;
    sfx.power();
    announce('האות מוחלפת, מגרילים מחדש');
    setOpen(false);
    setRiddleMode(false);
    setGuess('');
    onSwap();
  };

  /** ההחלפה החינמית — לחיצה אחת, בלי חלונית ובלי תנאים */
  const useFree = () => {
    doSwap();
  };

  const openPaid = async () => {
    setWrong(false);
    setGuess('');
    setRiddleMode(false);
    setWallet(activeProfile?.id ? await getWallet(activeProfile.id) : { bills: 0, gems: 0 });
    setOpen(true);
  };

  const payWith = async (method: PayMethod) => {
    if (!activeProfile?.id || !wallet) return;
    const next = payForSwap(wallet, method);
    if (!next) return;
    await saveWallet(activeProfile.id, next);
    doSwap();
  };

  const trySolve = () => {
    if (isRiddleAnswerCorrect(riddle, guess)) {
      markRiddleUsed(riddle.id);
      sfx.success();
      doSwap();
    } else {
      setWrong(true);
      sfx.error();
    }
  };

  return (
    <>
      {option === 'free' ? (
        <button
          className="btn-gold btn-small"
          style={{ marginTop: 10 }}
          aria-label="החלפת אות — חינם, פעם אחת במשחק"
          onClick={useFree}
        >
          🔄 האות לא מוצאת חן? החלפה חינם
        </button>
      ) : (
        <button
          className="btn-ghost btn-small"
          style={{ marginTop: 10 }}
          aria-label="החלפת אות נוספת — בקרדיט או בפתרון חידה"
          onClick={() => void openPaid()}
        >
          🔄 להחליף שוב ({left} נותרה)
        </button>
      )}

      {open && (
        <Modal onClose={() => setOpen(false)}>
          <div className="center">
            <h2 style={{ marginTop: 0 }}>🔄 החלפת אות נוספת</h2>

            {!riddleMode ? (
              <>
                <p className="dim">את ההחלפה החינמית כבר ניצלתם. אפשר לשלם מהקרדיט — או לפתור חידה.</p>

                <div className="row" style={{ justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    className="btn-gold"
                    disabled={!wallet || !canAffordSwap(wallet, 'bills')}
                    onClick={() => void payWith('bills')}
                  >
                    💵 {SWAP_PRICE.bills} שטרות
                  </button>
                  <button
                    className="btn-gold"
                    disabled={!wallet || !canAffordSwap(wallet, 'gems')}
                    onClick={() => void payWith('gems')}
                  >
                    💎 {SWAP_PRICE.gems} יהלום
                  </button>
                </div>

                {wallet && (
                  <p className="dim" style={{ fontSize: '0.85rem' }}>
                    בארנק: 💵 {wallet.bills} · 💎 {wallet.gems}
                  </p>
                )}

                <button className="btn-primary" style={{ marginTop: 10 }} onClick={() => setRiddleMode(true)}>
                  🧩 אין לי קרדיט — לפתור חידה
                </button>
                <button className="btn-ghost btn-small" style={{ marginTop: 8 }} onClick={() => setOpen(false)}>
                  לא צריך, נשארים עם האות
                </button>
              </>
            ) : (
              <>
                <p style={{ fontSize: '1.05rem' }}>{riddle.question}</p>
                <input
                  type="text"
                  value={guess}
                  aria-label="התשובה לחידה"
                  autoComplete="off"
                  spellCheck={false}
                  onChange={(e) => {
                    setGuess(e.target.value);
                    setWrong(false);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && trySolve()}
                />
                {wrong && (
                  <p role="status" style={{ color: 'var(--bad)' }}>
                    לא בדיוק — אפשר לנסות שוב
                  </p>
                )}
                <button className="btn-primary" style={{ marginTop: 8 }} disabled={!guess.trim()} onClick={trySolve}>
                  זו התשובה!
                </button>
                <button className="btn-ghost btn-small" style={{ marginTop: 8 }} onClick={() => setRiddleMode(false)}>
                  ← חזרה לאפשרויות
                </button>
              </>
            )}
          </div>
        </Modal>
      )}
    </>
  );
}
