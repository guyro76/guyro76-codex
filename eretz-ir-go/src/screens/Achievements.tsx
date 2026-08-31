import { useEffect, useState } from 'react';
import TopBar from '../components/TopBar';
import { useApp } from '../store/appStore';
import { ACHIEVEMENTS } from '../data/achievements';
import { db } from '../db/db';
import { EMPTY_WALLET, getMiniGameWins, getWallet, type Wallet } from '../lib/wallet';

export default function Achievements() {
  const { activeProfile } = useApp();
  const [collectionSize, setCollectionSize] = useState(0);
  const [wallet, setWallet] = useState<Wallet>(EMPTY_WALLET);
  const [miniGameWins, setMiniGameWins] = useState(0);

  useEffect(() => {
    const id = activeProfile?.id;
    if (!id) return;
    void db.personalAnswers.where('profileId').equals(id).count().then(setCollectionSize);
    void getWallet(id).then(setWallet);
    void getMiniGameWins(id).then(setMiniGameWins);
  }, [activeProfile]);

  if (!activeProfile) return null;
  const context = { collectionSize, bills: wallet.bills, gems: wallet.gems, miniGameWins };
  const earned = ACHIEVEMENTS.filter((a) => a.check(activeProfile, context));

  return (
    <div className="screen">
      <TopBar title="🎖️ ההישגים שלי" />
      <p className="dim">
        {activeProfile.name} — {earned.length} מתוך {ACHIEVEMENTS.length} הישגים
      </p>
      <div className="grid grid-2">
        {ACHIEVEMENTS.map((a) => {
          const has = earned.includes(a);
          const p = !has && a.progress ? a.progress(activeProfile, context) : null;
          const pct = p ? Math.max(0, Math.min(100, Math.round((p.have / p.need) * 100))) : 0;
          return (
            /*
              **בלי `opacity` על הכרטיס.**

              קודם היה כאן `opacity: 0.45`, וזה מכפיל את הניגודיות של
              הטקסט ב-0.45 — כלומר הישג נעול פשוט לא היה קריא. זו
              הפרה של כלל הברזל, ובדיקת הניגודיות לא יכולה לתפוס
              אותה: היא מחשבת מתוך הטוקנים, ושקיפות שמוחלת על מכל
              אינה שילוב של טוקנים.

              והישג נעול אינו פקד מושבת שפטור מהתקן — הוא **התוכן
              שהילד אמור לקרוא** כדי לדעת מה לעשות כדי להשיג אותו.

              מה שמבדיל נעול מהושג הוא האייקון (אפור), המסגרת,
              ומד ההתקדמות — לא קריאוּת הטקסט.
            */
            <div key={a.id} className={`card center achievement${has ? ' earned' : ''}`}>
              <div className="ach-icon" style={{ filter: has ? 'none' : 'grayscale(1)' }} aria-hidden>
                {a.icon}
              </div>
              <strong>{a.name}</strong>
              <p className="dim ach-desc">{a.description}</p>

              {has ? (
                <p className="ach-done">הושג! ✔</p>
              ) : p ? (
                <>
                  {/*
                    מד התקדמות: "3 מתוך 5" הופך יעד רחוק למשהו
                    שמרגישים שמתקרבים אליו. ה-`aria` נמסר על המכל
                    כדי שקורא מסך יקריא מספר ולא רק "מלבן".
                  */}
                  <div
                    className="ach-bar"
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={p.need}
                    aria-valuenow={Math.min(p.have, p.need)}
                    aria-label={`${a.name}: ${Math.min(p.have, p.need)} מתוך ${p.need}`}
                  >
                    <span style={{ width: `${pct}%` }} />
                  </div>
                  {/*
                    "0 מתוך 5" ולא "0 / 5": בכיוון ימין-לשמאל הלוכסן
                    הופך את סדר המספרים על המסך, וילד קרא "5 / 0" —
                    כלומר בדיוק ההפך ממה שהתכוונו. מילה עברית אינה
                    מתהפכת.
                  */}
                  <p className="ach-count">
                    {Math.min(p.have, p.need)} מתוך {p.need}
                  </p>
                </>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
