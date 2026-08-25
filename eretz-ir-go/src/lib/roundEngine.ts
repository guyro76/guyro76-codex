import type { Category, PersonalAnswer, Profile, SubmittedAnswer } from '../types';
import { normalizeHebrew } from './hebrew';
import { validateAnswer } from './validation';
import { getKnowledgeBase, userItem } from './knowledge';
import { isOnline, verifyOnWikipedia } from './verifyOnline';
import { matchesCategory } from './imageVerify';
import { originalityScore, scoreAnswer } from './scoring';
import { db } from '../db/db';

export interface RawPlayerAnswers {
  profile: Profile;
  answers: Record<string, { text: string; hintsUsed: number; revealed: boolean; typedAtMs: number }>;
}

/**
 * עיבוד סיבוב שלם: ולידציה, אימות אונליין לתשובות לא מוכרות,
 * זיהוי כפילויות בין שחקנים, ניקוד ושמירה למילון האישי.
 */
export async function processRound(params: {
  players: RawPlayerAnswers[];
  letter: string;
  categories: Category[];
  roundSeconds: number;
  coop: boolean;
}): Promise<SubmittedAnswer[][]> {
  const { players, letter, categories, roundSeconds, coop } = params;
  const kb = getKnowledgeBase();

  // טעינת ערכי ידע שאושרו בעבר על ידי המשתמשים (אונליין/הורה)
  const userRows = await db.userKnowledge.toArray();
  kb.addUserItems(
    userRows.map((row) => ({
      ...userItem(row.canonicalName, row.categoryId, row.source, row.description, {
        url: row.imageUrl ?? '',
        author: row.imageAuthor,
        license: row.imageLicense,
        licenseUrl: row.imageLicenseUrl
      }),
      id: `user-db-${row.id}`
    }))
  );

  const results: SubmittedAnswer[][] = [];

  /**
   * תקציב זמן כולל לאימות אונליין של כל הסיבוב.
   *
   * כל בדיקה בודדת כבר חסומה בזמן, אבל חמש קטגוריות שכולן ממתינות
   * לפסק זמן היו מצטברות לחצי דקה של מסך תקוע. כשהתקציב נגמר פשוט
   * מפסיקים לשאול את ויקיפדיה — תשובה שלא הספיקה להיבדק נשארת
   * "בבדיקה", וההורה יכול לאשר אותה אחר כך. עדיף מלהשאיר ילד ממתין.
   */
  const ONLINE_BUDGET_MS = 12_000;
  const onlineDeadline = Date.now() + ONLINE_BUDGET_MS;

  for (const player of players) {
    const submitted: SubmittedAnswer[] = [];
    const usedInRound = new Set<string>();
    const personalRows = player.profile.id
      ? await db.personalAnswers.where('profileId').equals(player.profile.id).toArray()
      : [];

    for (const category of categories) {
      const raw = player.answers[category.id] ?? { text: '', hintsUsed: 0, revealed: false, typedAtMs: 0 };
      const normalized = normalizeHebrew(raw.text);
      const personalDict = new Set(
        personalRows.filter((r) => r.categoryId === category.id).map((r) => r.normalized)
      );

      let validation = validateAnswer({
        raw: raw.text,
        letter,
        category,
        kb,
        usedInRound,
        personalDictionary: personalDict
      });

      let isNewDiscovery = false;
      let onlineSource: string | undefined;
      let onlineDescription: string | undefined;
      let onlineImage: string | undefined;

      // שלב 5: תשובה לא מוכרת — אימות אונליין לפני הכנסה למאגר
      if (validation.status === 'needs-review' && isOnline() && Date.now() < onlineDeadline) {
        const check = await verifyOnWikipedia(raw.text.trim());
        // מילה שהמאגר מכיר בהקשר אחר ("כפיר" כשם של ילד, בקטגוריית
        // "חי") מאושרת רק אם הערך עצמו מעיד על הקטגוריה הנכונה. בלי
        // התנאי הזה גם "בננה" הייתה עוברת כבעל חיים.
        const fits =
          !validation.crossCategory || matchesCategory(check.evidence ?? '', category.id);
        if (check.found && check.source && fits) {
          validation = {
            status: 'valid',
            reason: `אומת אונליין: ${check.title}`,
            verificationSource: 'online'
          };
          isNewDiscovery = true;
          onlineSource = check.source;
          onlineDescription = check.description;
          onlineImage = check.imageUrl;
        }
      }

      if (normalized) usedInRound.add(normalized);

      submitted.push({
        categoryId: category.id,
        rawText: raw.text,
        normalizedText: normalized,
        letter,
        validation,
        hintsUsed: raw.hintsUsed,
        revealed: raw.revealed,
        typedAtMs: raw.typedAtMs,
        baseScore: 0,
        originality: 0,
        originalityBonus: 0,
        speedBonus: 0,
        noHintBonus: 0,
        discoveryBonus: isNewDiscovery ? 5 : 0,
        totalScore: 0,
        duplicateWithOtherPlayer: false
      });

      // שמירה למאגר ולמילון האישי נעשית אחרי חישוב הציונים (בהמשך),
      // אך ערך שאומת אונליין נשמר כבר כאן כדי שלא ילך לאיבוד
      if (isNewDiscovery && onlineSource) {
        const exists = await db.userKnowledge
          .where('normalized')
          .equals(normalized)
          .and((r) => r.categoryId === category.id)
          .first();
        if (!exists) {
          await db.userKnowledge.add({
            canonicalName: raw.text.trim(),
            normalized,
            categoryId: category.id,
            source: onlineSource,
            description: onlineDescription,
            imageUrl: onlineImage,
            addedAt: new Date().toISOString()
          });
        }
        // הזרקה מיידית למנוע הידע כדי שמסך התוצאות יציג את התמונה
        // כבר בסיבוב הזה, בלי להמתין לטעינה הבאה של המשחק.
        kb.addUserItems([
          /**
           * בלי קרדיט אין תמונה. המסלול הזה (אימות אונליין תוך כדי
           * סיבוב) לא שולף את שם היוצר, ולכן הוא לא מעביר תמונה —
           * `answerImages` יביא אותה בנפרד, עם הקרדיט המלא.
           */
          userItem(raw.text.trim(), category.id, onlineSource, onlineDescription)
        ]);
      }
    }
    results.push(submitted);
  }

  // זיהוי תשובות זהות בין שחקנים (בדו-קרב; בשיתוף פעולה אין כפל כי הלוח משותף)
  if (!coop && players.length > 1) {
    for (const category of categories) {
      const perPlayer = results.map((r) => r.find((a) => a.categoryId === category.id));
      const texts = perPlayer.map((a) => a?.normalizedText ?? '');
      for (let i = 0; i < perPlayer.length; i++) {
        const answer = perPlayer[i];
        if (!answer || answer.validation.status !== 'valid') continue;
        const dup = texts.some((t, j) => j !== i && t && t === answer.normalizedText);
        answer.duplicateWithOtherPlayer = dup;
      }
    }
  }

  // ניקוד + שמירה למילון האישי וסטטיסטיקות
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    const personalRows = player.profile.id
      ? await db.personalAnswers.where('profileId').equals(player.profile.id).toArray()
      : [];

    for (const answer of results[i]) {
      const valid = answer.validation.status === 'valid';
      const pop = answer.validation.matchedItem?.popularityScore ?? 25;
      const timesUsedBefore =
        personalRows.find((r) => r.normalized === answer.normalizedText && r.categoryId === answer.categoryId)
          ?.timesUsed ?? 0;

      answer.originality = valid
        ? originalityScore({
            popularityScore: pop,
            timesUsedBefore,
            duplicateWithOtherPlayer: answer.duplicateWithOtherPlayer,
            isNewDiscovery: answer.discoveryBonus > 0,
            usedHint: answer.hintsUsed > 0
          })
        : 0;

      const breakdown = scoreAnswer({
        isValid: valid,
        revealed: answer.revealed,
        duplicateWithOtherPlayer: answer.duplicateWithOtherPlayer,
        hintsUsed: answer.hintsUsed,
        originality: answer.originality,
        typedAtMs: answer.typedAtMs,
        roundSeconds,
        isNewDiscovery: answer.discoveryBonus > 0
      });
      answer.baseScore = breakdown.base;
      answer.originalityBonus = breakdown.originalityBonus;
      answer.speedBonus = breakdown.speedBonus;
      answer.noHintBonus = breakdown.noHintBonus;
      answer.discoveryBonus = breakdown.discoveryBonus;
      answer.totalScore = breakdown.total;

      // שמירת תשובה נכונה למילון האישי (השלמה אוטומטית בעתיד)
      if (valid && player.profile.id) {
        await savePersonalAnswer(player.profile.id, answer, personalRows);
      }
    }
  }

  return results;
}

async function savePersonalAnswer(
  profileId: number,
  answer: SubmittedAnswer,
  existing: PersonalAnswer[]
): Promise<void> {
  const found = existing.find(
    (r) => r.normalized === answer.normalizedText && r.categoryId === answer.categoryId
  );
  if (found?.id) {
    await db.personalAnswers.update(found.id, { timesUsed: found.timesUsed + 1 });
  } else {
    const canonical = answer.validation.matchedItem?.canonicalName ?? answer.rawText.trim();
    await db.personalAnswers.add({
      profileId,
      categoryId: answer.categoryId,
      letter: answer.letter,
      text: canonical,
      normalized: answer.normalizedText,
      timesUsed: 1,
      discoveredAt: new Date().toISOString(),
      viaHint: answer.hintsUsed > 0 || answer.revealed,
      favorite: false,
      knowledgeId: answer.validation.matchedItem?.id
    });
  }
}
