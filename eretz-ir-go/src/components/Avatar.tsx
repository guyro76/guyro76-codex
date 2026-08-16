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
  name,
  size = 40
}: {
  avatar: string;
  name: string;
  size?: number;
}) {
  if (isPhotoAvatar(avatar)) {
    return (
      <img
        className="avatar-photo"
        src={avatar}
        alt={name}
        width={size}
        height={size}
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span aria-hidden style={{ fontSize: size * 0.82, lineHeight: 1 }}>
      {avatar}
    </span>
  );
}
