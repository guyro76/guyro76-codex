import Modal from './Modal';
import { WHATS_NEW } from '../data/whatsNew';

/**
 * מוצג פעם אחת אחרי עדכון, ורק למי שכבר שיחק. ראו `whatsNew.ts`
 * להסבר למה הוא קיים ומה נכנס לרשימה.
 */
export default function WhatsNew({ onClose }: { onClose: () => void }) {
  return (
    <Modal onClose={onClose}>
      <div className="center">
        <div style={{ fontSize: '2.6rem' }} aria-hidden>
          ✨
        </div>
        <h2 style={{ margin: '4px 0 10px' }}>מה חדש במשחק</h2>

        <ul className="whats-new">
          {WHATS_NEW.items.map((item) => (
            <li key={item.text}>
              <span aria-hidden>{item.icon}</span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>

        <button className="btn-primary" style={{ marginTop: 12 }} onClick={onClose}>
          מגניב, בואו נשחק
        </button>
      </div>
    </Modal>
  );
}
