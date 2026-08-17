import { useState } from 'react';
import { DEFAULT_SKIN, SKINS, applySkin, rememberSkin } from '../data/skins';
import { setSetting } from '../db/db';
import { sfx } from '../lib/sound';

/**
 * בורר ערכות הצבע.
 *
 * הבחירה נשמרת במכשיר ומוחלת מיד, בלי טעינה מחדש: החלפת ערכה היא
 * כתיבה של כמה משתני CSS, ולכן היא מיידית לגמרי.
 *
 * כל דוגמית מציגה את שלושת הצבעים המרכזיים של הערכה, כדי שאפשר
 * יהיה לבחור בלי לנסות אחת-אחת.
 */
export default function SkinPicker({ current }: { current?: string }) {
  const [picked, setPicked] = useState(current ?? DEFAULT_SKIN);

  const choose = (id: string) => {
    setPicked(id);
    applySkin(id);
    // סינכרוני קודם, כדי שרענון מיידי לא יאבד את הבחירה
    rememberSkin(id);
    void setSetting('skin', id);
    sfx.power();
  };

  return (
    <div className="skin-grid" role="radiogroup" aria-label="ערכת צבעים">
      {SKINS.map((skin) => (
        <button
          key={skin.id}
          role="radio"
          aria-checked={picked === skin.id}
          className={`skin-card${picked === skin.id ? ' on' : ''}`}
          onClick={() => choose(skin.id)}
        >
          <span className="skin-swatch" aria-hidden>
            {skin.swatch.map((c) => (
              <span key={c} style={{ background: c }} />
            ))}
          </span>
          <span className="skin-name">
            {skin.icon} {skin.name}
          </span>
          {picked === skin.id && (
            <span className="skin-check" aria-hidden>
              ✓
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
