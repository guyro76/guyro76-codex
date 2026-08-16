import { isPhotoAvatar } from '../lib/identity';

/**
 * אווטאר של שחקן: אמוג'י או תמונה אמיתית.
 *
 * הפרדה לרכיב אחד נעשתה כי `avatar` הוא שדה טקסט אחד שיכול להחזיק
 * את שניהם. בלי הרכיב הזה, תמונה שנשמרה כ-data URI הייתה מוצגת
 * כמחרוזת ענקית של base64 באמצע המסך — בדיוק סוג התקלה שנראית
 * מגוחכת אצל משתמש ולא נתפסת בקוד.
 *
 * התמונה תמיד data URI ששמור במכשיר, ולכן אין כאן שום בקשת רשת
 * והיא עובדת גם אופליין.
 */
export default function Avatar({
  avatar,
  photo,
  name,
  size = 40
}: {
  avatar: string;
  /** תמונה אמיתית, אם יש. גוברת על האמוג'י */
  photo?: string;
  name: string;
  size?: number;
}) {
  // גם `avatar` נבדק, כדי שפרופילים ישנים שבהם התמונה נשמרה שם
  // ייראו נכון גם לפני שהתיקון האוטומטי הספיק לרוץ
  const image = photo ?? (isPhotoAvatar(avatar) ? avatar : undefined);
  if (image) {
    return (
      <img
        className="avatar-photo"
        src={image}
        alt={name}
        width={size}
        height={size}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span aria-hidden style={{ fontSize: size * 0.82, lineHeight: 1 }}>
      {isPhotoAvatar(avatar) ? '🙂' : avatar}
    </span>
  );
}
