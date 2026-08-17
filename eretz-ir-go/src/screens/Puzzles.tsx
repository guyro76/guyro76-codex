import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import PuzzleBoard from '../components/PuzzleBoard';
import { useApp } from '../store/appStore';
import { PUZZLES } from '../data/puzzles';
import { loadProgress } from '../lib/puzzleStore';
import { summary, type PuzzleProgress } from '../lib/puzzlePieces';

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
        <div className="grid grid-2">
          {ordered.map((puzzle) => (
            <div key={puzzle.id} className="card">
              <PuzzleBoard puzzleId={puzzle.id} owned={progress[puzzle.id] ?? []} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
