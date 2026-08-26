import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import PuzzleBoard from '../components/PuzzleBoard';
import Modal from '../components/Modal';
import { notifyWalletChanged } from '../components/WalletChip';
import { useApp } from '../store/appStore';
import { PUZZLES, puzzleById } from '../data/puzzles';
import { buyPiece, loadProgress } from '../lib/puzzleStore';
import { COMPLETION_BONUS, PIECE_PRICE, remaining, summary, type PuzzleProgress } from '../lib/puzzlePieces';
import { getWallet, type PayMethod, type Wallet } from '../lib/wallet';
import { announce } from '../lib/announce';

/**
 * מסך הפאזלים: כל הלוחות במקום אחד.
 *
 * הסדר מכוון — קודם מה שכבר התחיל ועדיין לא הושלם, כי זה מה שילד
 * בא לבדוק; אחר כך הלוחות שטרם נפתחו; ולבסוף המושלמים, שהם פרס
 * ולא משימה.
 */
export default function Puzzles() {
  const { activeProfile } = useApp();
  const [progress, setProgress] = useState<PuzzleProgress>({});
  const [loading, setLoading] = useState(true);
  /** הצעת קנייה פתוחה: איזה לוח ואיזה חלק */
  const [offer, setOffer] = useState<{ puzzleId: string; piece: number } | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [busy, setBusy] = useState(false);
  const [won, setWon] = useState<string | null>(null);

  useEffect(() => {
    if (!activeProfile?.id) {
      setLoading(false);
      return;
    }
    void loadProgress(activeProfile.id).then((p) => {
      setProgress(p);
      setLoading(false);
    });
  }, [activeProfile?.id]);

  const stats = summary(progress);

  const openOffer = (puzzleId: string, piece: number) => {
    if (!activeProfile?.id) return;
    void getWallet(activeProfile.id).then(setWallet);
    setOffer({ puzzleId, piece });
  };

  /**
   * הקנייה עצמה יושבת ב-`buyPiece`, בטרנזקציה אחת עם הארנק. כאן רק
   * מרעננים את המסך לפי מה שחזר — בלי לנחש מה קרה במסד.
   */
  const confirmBuy = async (method: PayMethod) => {
    if (!activeProfile?.id || !offer || busy) return;
    setBusy(true);
    const result = await buyPiece(activeProfile.id, offer.puzzleId, method, offer.piece);
    setBusy(false);
    if (!result.ok) {
      announce(result.reason === 'cannot-afford' ? 'אין מספיק קרדיט' : 'לא הצלחנו לקנות את החלק');
      return;
    }
    setProgress((prev) => ({ ...prev, [offer.puzzleId]: result.owned }));
    setWallet(result.wallet);
    notifyWalletChanged();
    setOffer(null);
    if (result.completed) {
      const name = puzzleById(offer.puzzleId)?.name ?? '';
      setWon(name);
      announce(`הפאזל ${name} הושלם! בונוס ${COMPLETION_BONUS.bills} שטרות`);
    } else {
      announce('החלק נוסף ללוח');
    }
  };

  const rank = (id: string) => {
    const puzzle = PUZZLES.find((p) => p.id === id)!;
    const have = progress[id]?.length ?? 0;
    if (have >= puzzle.cols * puzzle.rows) return 2; // הושלם — לסוף
    if (have > 0) return 0; // בעבודה — לראש
    return 1;
  };
  const ordered = [...PUZZLES].sort((a, b) => rank(a.id) - rank(b.id));

  return (
    <div className="screen">
      <TopBar title="🧩 הפאזלים שלי" />

      <p className="dim">
        בסוף כל סיבוב נופל חלק אחד — ולא תמיד של אותו פאזל. אספתם {stats.pieces} חלקים,
        והשלמתם {stats.completed} מתוך {stats.total} תמונות.
      </p>

      {loading ? (
        <p className="dim center">טוען…</p>
      ) : (
        <div className="grid puzzle-list">
          {ordered.map((puzzle) => (
            <div key={puzzle.id} className="card">
              <PuzzleBoard
                puzzleId={puzzle.id}
                owned={progress[puzzle.id] ?? []}
                onBuy={(piece) => openOffer(puzzle.id, piece)}
              />
            </div>
          ))}
        </div>
      )}

      {offer && (
        <Modal onClose={() => setOffer(null)}>
          <div className="center">
            <h2 style={{ marginTop: 0 }}>🧩 לקנות את החלק החסר?</h2>
            <p className="dim">
              {puzzleById(offer.puzzleId)?.name} — נשארו{' '}
              {remaining(puzzleById(offer.puzzleId)!, progress[offer.puzzleId])} חלקים.
              {remaining(puzzleById(offer.puzzleId)!, progress[offer.puzzleId]) === 1 && (
                <>
                  {' '}
                  זה האחרון! השלמה מזכה ב-💵 {COMPLETION_BONUS.bills} ו-💎 {COMPLETION_BONUS.gems}.
                </>
              )}
            </p>

            <div className="row" style={{ justifyContent: 'center', gap: 8, flexWrap: 'wrap' }}>
              <button
                className="btn-gold"
                disabled={busy || !wallet || wallet.bills < PIECE_PRICE.bills}
                onClick={() => void confirmBuy('bills')}
              >
                💵 {PIECE_PRICE.bills} שטרות
              </button>
              <button
                className="btn-gold"
                disabled={busy || !wallet || wallet.gems < PIECE_PRICE.gems}
                onClick={() => void confirmBuy('gems')}
              >
                💎 {PIECE_PRICE.gems} יהלומים
              </button>
            </div>

            {wallet && (
              <p className="dim" style={{ fontSize: '0.85rem' }}>
                בארנק: 💵 {wallet.bills} · 💎 {wallet.gems}
              </p>
            )}
            {wallet && wallet.bills < PIECE_PRICE.bills && wallet.gems < PIECE_PRICE.gems && (
              <p className="dim" style={{ fontSize: '0.85rem' }}>
                אין מספיק קרדיט — עוד סיבוב משחק והחלק ייפול בחינם.
              </p>
            )}

            <button className="btn-primary" style={{ marginTop: 10 }} onClick={() => setOffer(null)}>
              לא עכשיו
            </button>
          </div>
        </Modal>
      )}

      {won && (
        <Modal onClose={() => setWon(null)}>
          <div className="center">
            <h2 style={{ marginTop: 0 }}>🎉 הפאזל הושלם!</h2>
            <p>
              <strong>{won}</strong> — התמונה כולה נחשפה.
            </p>
            <p className="dim">
              פרס השלמה: 💵 {COMPLETION_BONUS.bills} שטרות ו-💎 {COMPLETION_BONUS.gems} יהלומים.
            </p>
            <button className="btn-gold" onClick={() => setWon(null)}>
              יופי!
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
